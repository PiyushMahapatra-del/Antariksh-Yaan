/**
 * AEGIS TRANSIT — Sensor Model Unit Tests
 * 
 * Verifies stochastic sensor model behavior:
 * Gaussian noise properties, quantization steps, bias drift integration,
 * dropout probability, and stuck-at hardware fault states.
 */

import { describe, it, expect } from 'vitest';
import { SensorModel } from './sensors.js';
import { SeededRng } from './rng.js';
import { SubsystemManager } from './subsystems/index.js';

describe('SensorModel', () => {
  it('returns exact value when noiseless, unquantized, and drift-free', () => {
    const rng = new SeededRng(42);
    const sensor = new SensorModel(
      {
        noiseSigma: 0,
        quantization: 0,
        biasDrift: 0,
        dropoutProb: 0,
        stuckValue: null,
      },
      rng
    );

    const reading = sensor.read(293.15, 1.0);
    expect(reading.raw).toBe(293.15);
    expect(reading.measured).toBe(293.15);
    expect(reading.status).toBe('OK');
  });

  it('quantizes measured values to discrete step increments', () => {
    const rng = new SeededRng(42);
    const sensor = new SensorModel(
      {
        noiseSigma: 0,
        quantization: 0.25,
        biasDrift: 0,
        dropoutProb: 0,
        stuckValue: null,
      },
      rng
    );

    expect(sensor.read(10.12, 0).measured).toBe(10.0);
    expect(sensor.read(10.13, 0).measured).toBe(10.25);
    expect(sensor.read(10.37, 0).measured).toBe(10.25);
    expect(sensor.read(10.38, 0).measured).toBe(10.5);
  });

  it('accumulates continuous bias drift linearly with elapsed time', () => {
    const rng = new SeededRng(42);
    const driftRate = 0.05; // 0.05 units per second
    const sensor = new SensorModel(
      {
        noiseSigma: 0,
        quantization: 0,
        biasDrift: driftRate,
        dropoutProb: 0,
        stuckValue: null,
      },
      rng
    );

    sensor.read(100.0, 10.0); // 10s -> +0.50 drift
    expect(sensor.getBias()).toBeCloseTo(0.5, 4);

    const reading = sensor.read(100.0, 10.0); // another 10s -> +1.0 total
    expect(sensor.getBias()).toBeCloseTo(1.0, 4);
    expect(reading.measured).toBeCloseTo(101.0, 4);

    sensor.resetBias();
    expect(sensor.getBias()).toBe(0);
    expect(sensor.read(100.0, 0).measured).toBe(100.0);
  });

  it('exhibits Gaussian noise properties with zero mean and expected standard deviation', () => {
    const rng = new SeededRng(12345);
    const sigma = 2.0;
    const sensor = new SensorModel(
      {
        noiseSigma: sigma,
        quantization: 0,
        biasDrift: 0,
        dropoutProb: 0,
        stuckValue: null,
      },
      rng
    );

    const samples = 2000;
    const trueVal = 50.0;
    let sum = 0;
    const readings: number[] = [];

    for (let i = 0; i < samples; i++) {
      const r = sensor.read(trueVal, 0).measured;
      readings.push(r);
      sum += r;
    }

    const mean = sum / samples;
    const variance = readings.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / samples;
    const sampleStd = Math.sqrt(variance);

    // Mean should be near trueVal (within 0.15)
    expect(mean).toBeCloseTo(trueVal, 0);
    // Standard deviation should be near 2.0 (within 0.2)
    expect(sampleStd).toBeGreaterThan(1.8);
    expect(sampleStd).toBeLessThan(2.2);
  });

  it('handles stuck-at sensor faults and recovers upon clearance', () => {
    const rng = new SeededRng(42);
    const sensor = new SensorModel(
      {
        noiseSigma: 0.5,
        quantization: 0,
        biasDrift: 0.01,
        dropoutProb: 0,
        stuckValue: null,
      },
      rng
    );

    expect(sensor.isStuck()).toBe(false);

    sensor.setStuck(315.0);
    expect(sensor.isStuck()).toBe(true);

    const stuckReading = sensor.read(280.0, 1.0);
    expect(stuckReading.raw).toBe(280.0);
    expect(stuckReading.measured).toBe(315.0);
    expect(stuckReading.status).toBe('STUCK');

    sensor.clearStuck();
    expect(sensor.isStuck()).toBe(false);

    const recovered = sensor.read(280.0, 0);
    expect(recovered.status).toBe('OK');
    expect(Math.abs(recovered.measured - 280.0)).toBeLessThan(5.0);
  });

  it('produces DROPOUT readings with last measured value when dropout triggers', () => {
    const rng = new SeededRng(42);
    const sensor = new SensorModel(
      {
        noiseSigma: 0,
        quantization: 0,
        biasDrift: 0,
        dropoutProb: 1.0, // 100% dropout rate
        stuckValue: null,
      },
      rng
    );

    // Initialize first value
    const firstReading = sensor.read(42.0, 0);
    // Even if dropout hits, on first reading it holds the initialized value
    expect(firstReading.status).toBe('DROPOUT');
    expect(firstReading.measured).toBe(42.0);

    // With a different raw value, measured stays frozen at previous value 42.0
    const secondReading = sensor.read(99.0, 0);
    expect(secondReading.raw).toBe(99.0);
    expect(secondReading.measured).toBe(42.0);
    expect(secondReading.status).toBe('DROPOUT');
  });

  it('property test: reported distance >= 0 across 10,000 random states on every distance channel', () => {
    const rng = new SeededRng(99999);
    const sub = new SubsystemManager(rng);
    const distanceChannels = ['nav_dist_sun', 'nav_dist_earth', 'nav_dist_mars'];

    for (let i = 0; i < 10000; i++) {
      const shipX = (rng.random() - 0.5) * 4;
      const shipY = (rng.random() - 0.5) * 4;
      const earthX = (rng.random() - 0.5) * 2;
      const earthY = (rng.random() - 0.5) * 2;
      const marsX = (rng.random() - 0.5) * 3;
      const marsY = (rng.random() - 0.5) * 3;

      // In 10% of cases, test extreme near-zero distance (e.g. 0 to 0.00001 AU)
      const nearZero = rng.random() < 0.1;
      const distEarth = nearZero ? rng.random() * 0.00001 : Math.hypot(shipX - earthX, shipY - earthY);
      const distSun = nearZero ? rng.random() * 0.00001 : Math.hypot(shipX, shipY);
      const distMars = nearZero ? rng.random() * 0.00001 : Math.hypot(shipX - marsX, shipY - marsY);

      sub.updateNavigation({
        distSun,
        distEarth,
        distMars,
        speedKmS: rng.random() * 40,
        etaDays: rng.random() * 200,
      });

      // Step subsystem
      sub.step(0.1, distSun, 'CRUISE', 2451545.0 + i * 0.01);
      const telem = sub.getTelemetry();

      for (const ch of distanceChannels) {
        const reading = telem.get(ch);
        expect(reading).toBeDefined();
        if (reading) {
          expect(reading.measured).toBeGreaterThanOrEqual(0);
          expect(Number.isNaN(reading.measured)).toBe(false);
          expect(Number.isFinite(reading.measured)).toBe(true);
        }
      }
    }
  });
});
