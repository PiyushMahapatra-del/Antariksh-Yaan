/**
 * AEGIS TRANSIT — ECLSS Subsystem Unit Tests
 * 
 * Verifies atmospheric mass balance:
 * PI oxygen regulator setpoint tracking, ppO2 decay under regulator failure,
 * CO2 scrubber performance and degradation, and cabin hull leakage.
 */

import { describe, it, expect } from 'vitest';
import { ECLSSSubsystem } from './eclss.js';

describe('ECLSSSubsystem', () => {
  it('maintains ppO2 near 21.3 kPa setpoint under normal 4-crew metabolic consumption', () => {
    const eclss = new ECLSSSubsystem();
    expect(eclss.state.ppO2).toBeCloseTo(21.3, 1);

    // Step for 1 hour (3600 seconds) in 10-second increments
    const dt = 10.0;
    for (let t = 0; t < 360; t++) {
      eclss.step(dt, 4);
    }

    // PI controller should maintain ppO2 tightly at setpoint
    expect(eclss.state.ppO2).toBeGreaterThan(21.0);
    expect(eclss.state.ppO2).toBeLessThan(21.5);
    expect(eclss.state.o2FlowRate).toBeGreaterThan(0);
  });

  it('causes ppO2 to continuously drop without regulator (regulator stuck closed)', () => {
    const eclss = new ECLSSSubsystem();
    const initialPpO2 = eclss.state.ppO2;

    // Inject regulator stuck closed fault
    eclss.injectRegulatorStuck();
    expect(eclss.state.regulatorStuck).toBe(true);
    expect(eclss.state.o2FlowRate).toBe(0);

    // Step for 3 hours (10,800 seconds)
    const dt = 60.0;
    for (let t = 0; t < 180; t++) {
      eclss.step(dt, 4);
    }

    // Without O2 replenishment, ppO2 must drop significantly
    expect(eclss.state.ppO2).toBeLessThan(initialPpO2 - 0.2);
    expect(eclss.state.o2FlowRate).toBe(0);

    // Clear fault and verify regulator begins flowing again
    eclss.clearFault('regulator');
    expect(eclss.state.regulatorStuck).toBe(false);
    eclss.step(1.0, 4);
    expect(eclss.state.o2FlowRate).toBeGreaterThan(0);
  });

  it('causes ppCO2 to accumulate when scrubber degradation is injected', () => {
    const normalEclss = new ECLSSSubsystem();
    const degradedEclss = new ECLSSSubsystem();

    degradedEclss.injectScrubberDegradation(0.2); // degraded to 20% efficiency
    expect(degradedEclss.state.scrubberDegraded).toBe(true);

    // Step both for 2 hours (7200 seconds)
    const dt = 60.0;
    for (let t = 0; t < 120; t++) {
      normalEclss.step(dt, 4);
      degradedEclss.step(dt, 4);
    }

    expect(degradedEclss.state.ppCO2).toBeGreaterThan(normalEclss.state.ppCO2);
    expect(degradedEclss.state.ppCO2).toBeGreaterThan(0.6);
  });

  it('maintains Dalton law of partial pressures: cabinPressure = ppO2 + ppN2 + ppCO2', () => {
    const eclss = new ECLSSSubsystem();
    eclss.step(10.0, 4);

    const sumPartial = eclss.state.ppO2 + eclss.state.ppN2 + eclss.state.ppCO2;
    expect(eclss.state.cabinPressure).toBeCloseTo(sumPartial, 5);
  });

  it('drops cabin pressure and total gas mass during a hull leak', () => {
    const eclss = new ECLSSSubsystem();
    const initialPressure = eclss.state.cabinPressure;

    // Inject significant hull leak
    eclss.injectLeak(0.05); // 50 g/s

    // Step for 300 seconds
    const dt = 10.0;
    for (let t = 0; t < 30; t++) {
      eclss.step(dt, 4);
    }

    expect(eclss.state.cabinPressure).toBeLessThan(initialPressure - 1.0);
  });
});
