/**
 * AEGIS TRANSIT — Thermal Control Subsystem Unit Tests
 * 
 * Verifies dual-loop ATCS thermodynamics:
 * temperature response to heat load, coolant temperature differential ODE,
 * pump degradation, accumulator leakage, and blockage hydraulic responses.
 */

import { describe, it, expect } from 'vitest';
import { ThermalSubsystem } from './thermal.js';

describe('ThermalSubsystem', () => {
  it('temperature rises with increased internal heat load', () => {
    const lowLoadSim = new ThermalSubsystem();
    lowLoadSim.baseHeatLoad = 500;
    lowLoadSim.payloadHeatLoad = 200;
    lowLoadSim.computeHeatLoad = 30; // Total 730 W

    const highLoadSim = new ThermalSubsystem();
    highLoadSim.baseHeatLoad = 3000;
    highLoadSim.payloadHeatLoad = 1500;
    highLoadSim.computeHeatLoad = 100; // Total 4600 W

    // Step both systems for 120 seconds in deep space (1.2 AU)
    const dt = 1.0;
    for (let t = 0; t < 120; t++) {
      lowLoadSim.step(dt, 1.2);
      highLoadSim.step(dt, 1.2);
    }

    expect(highLoadSim.loopA.coolantTempIn).toBeGreaterThan(lowLoadSim.loopA.coolantTempIn);
    expect(highLoadSim.loopA.coolantTempOut).toBeGreaterThan(lowLoadSim.loopA.coolantTempOut);
  });

  it('satisfies the coolant temperature ODE: T_out = T_in + Q / (flowRate * cp)', () => {
    const sim = new ThermalSubsystem();
    sim.baseHeatLoad = 2000;
    sim.payloadHeatLoad = 0;
    sim.computeHeatLoad = 0; // Total 2000 W -> 1000 W per loop
    sim.step(1.0, 1.2);

    const cp = 4186; // J/(kg*K)
    const flow = sim.loopA.flowRate;
    const qPerLoop = 1000; // 2000 / 2 loops

    const expectedDeltaT = qPerLoop / (flow * cp);
    const actualDeltaT = sim.loopA.coolantTempOut - sim.loopA.coolantTempIn;

    expect(actualDeltaT).toBeCloseTo(expectedDeltaT, 3);
  });

  it('halves pump efficiency and mass flow rate upon pump failure injection', () => {
    const sim = new ThermalSubsystem();
    const nominalFlow = sim.loopA.flowRate;

    sim.injectPumpFailure('A');
    sim.step(1.0, 1.2);

    expect(sim.loopA.pumpDegraded).toBe(true);
    // Flow rate should be roughly halved
    expect(sim.loopA.flowRate).toBeCloseTo(nominalFlow * (2400 / 3600) * 0.5, 2);

    // Clear pump fault
    sim.clearFault('A', 'pump');
    sim.step(1.0, 1.2);
    expect(sim.loopA.pumpDegraded).toBe(false);
    expect(sim.loopA.flowRate).toBeCloseTo(nominalFlow, 2);
  });

  it('spikes delta-P and starves flow rate upon hydraulic blockage', () => {
    const sim = new ThermalSubsystem();
    sim.injectBlockage('A');
    sim.step(1.0, 1.2);

    expect(sim.loopA.blocked).toBe(true);
    expect(sim.loopA.pumpDeltaP).toBeGreaterThan(300); // 320 kPa spike
    expect(sim.loopA.flowRate).toBeLessThanOrEqual(0.02);

    sim.clearFault('A', 'blockage');
    sim.step(1.0, 1.2);
    expect(sim.loopA.blocked).toBe(false);
    expect(sim.loopA.flowRate).toBeGreaterThan(0.3);
  });

  it('depletes accumulator level and eventually drops loop pressure during a leak', () => {
    const sim = new ThermalSubsystem();
    const initialAccum = sim.loopA.accumulatorLevel;

    // Inject high leak rate: 0.1 kg/s
    sim.injectLeak('A', 0.1);

    // Step for 90 seconds (90s * 0.1 kg/s = 9 kg fluid lost > 8 kg capacity)
    for (let t = 0; t < 90; t++) {
      sim.step(1.0, 1.2);
    }

    expect(sim.loopA.accumulatorLevel).toBeLessThan(initialAccum);
    expect(sim.loopA.accumulatorLevel).toBeCloseTo(0, 1);
    expect(sim.loopA.loopPressure).toBeLessThan(100); // Pressure loss
  });
});
