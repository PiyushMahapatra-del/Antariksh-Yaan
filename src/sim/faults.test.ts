/**
 * AEGIS TRANSIT — Fault Injector & Subsystems Manager Tests
 * 
 * Verifies fault injection catalog, active fault tracking,
 * SubsystemManager cross-subsystem coupling, telemetry sensor channels,
 * and caution/warning alert threshold evaluations.
 */

import { describe, it, expect } from 'vitest';
import { FaultInjector, FAULT_CATALOG } from './faults.js';
import { SubsystemManager } from './subsystems/index.js';
import { PowerSubsystem } from './subsystems/power.js';
import { GNCSubsystem } from './subsystems/gnc.js';
import { RadiationSubsystem } from './subsystems/radiation.js';
import { CrewSubsystem } from './subsystems/crew.js';
import { ComputeSubsystem } from './subsystems/compute.js';
import { SeededRng } from './rng.js';

describe('FaultInjector', () => {
  it('contains definitions for all 13 required fault types in FAULT_CATALOG', () => {
    expect(FAULT_CATALOG.length).toBe(13);
    const types = FAULT_CATALOG.map(f => f.type);
    expect(types).toContain('coolant_pump_failure');
    expect(types).toContain('coolant_leak');
    expect(types).toContain('coolant_blockage');
    expect(types).toContain('sensor_stuck');
    expect(types).toContain('o2_regulator_stuck');
    expect(types).toContain('cabin_leak');
    expect(types).toContain('scrubber_degradation');
    expect(types).toContain('solar_particle_event');
    expect(types).toContain('ai_bitflip');
    expect(types).toContain('ai_worker_freeze');
    expect(types).toContain('uplink_corrupt');
    expect(types).toContain('early_blackout');
    expect(types).toContain('moi_burn_abort');
  });

  it('correctly tracks active faults, parameters, and clearance', () => {
    const injector = new FaultInjector();

    expect(injector.getActive().length).toBe(0);
    expect(injector.isActive('coolant_leak')).toBe(false);

    injector.inject('coolant_leak', { rate: 0.008 }, 2451545.0);
    expect(injector.isActive('coolant_leak')).toBe(true);
    expect(injector.getActive().length).toBe(1);

    const fault = injector.getActive()[0];
    expect(fault.type).toBe('coolant_leak');
    expect(fault.params.rate).toBe(0.008);
    expect(fault.injectedAt).toBe(2451545.0);

    injector.clear('coolant_leak');
    expect(injector.isActive('coolant_leak')).toBe(false);
    expect(injector.getActive().length).toBe(0);
  });

  it('clears all active faults on clearAll()', () => {
    const injector = new FaultInjector();
    injector.inject('coolant_pump_failure');
    injector.inject('o2_regulator_stuck');
    injector.inject('solar_particle_event');

    expect(injector.getActive().length).toBe(3);
    injector.clearAll();
    expect(injector.getActive().length).toBe(0);
  });
});

describe('PowerSubsystem', () => {
  it('computes 1/r^2 solar irradiance and percentage accurately', () => {
    const power = new PowerSubsystem();

    // At 1.0 AU (Earth)
    power.step(1.0, 1.0);
    expect(power.state.solarIrradiance).toBeCloseTo(1361, 0);
    expect(power.state.irradiancePercent).toBeCloseTo(100.0, 1);

    // At Mars mean distance ~ 1.5237 AU -> ~43%
    power.step(1.0, 1.5237);
    expect(power.state.solarIrradiance).toBeCloseTo(1361 / (1.5237 * 1.5237), 1);
    expect(power.state.irradiancePercent).toBeCloseTo(43.07, 1);
  });

  it('charges battery when array output exceeds loads, discharges when deficient', () => {
    const power = new PowerSubsystem();
    power.step(1.0, 1.0); // 1 AU generation > 20 kW >> 3.2 kW loads
    expect(power.state.batterySoC).toBeGreaterThanOrEqual(0.92);

    // Deep space dark/distant case with heavy loads
    const initialSoC = power.state.batterySoC;
    power.state.solarArrayArea = 0; // simulated array eclipse / failure
    for (let i = 0; i < 3600; i++) {
      power.step(1.0, 1.0);
    }
    expect(power.state.batterySoC).toBeLessThan(initialSoC);
  });
});

describe('GNCSubsystem', () => {
  it('calculates initial remaining delta-V via Tsiolkovsky equation', () => {
    const gnc = new GNCSubsystem();
    const dryMass = gnc.state.dryMass;
    const propMass = gnc.state.propellantMass;
    const isp = gnc.state.isp;

    const expectedDv = isp * 9.80665 * Math.log((dryMass + propMass) / dryMass);
    expect(gnc.state.deltaVRemaining).toBeCloseTo(expectedDv, 1);
  });

  it('consumes propellant and reduces remaining delta-V during engine burn', () => {
    const gnc = new GNCSubsystem();
    const initialProp = gnc.state.propellantMass;

    gnc.startBurn(100.0);
    expect(gnc.state.isBurning).toBe(true);
    expect(gnc.state.thrustN).toBeGreaterThan(0);

    // Step burn for 5 seconds
    gnc.step(5.0);
    expect(gnc.state.propellantMass).toBeLessThan(initialProp);

    gnc.stopBurn();
    expect(gnc.state.isBurning).toBe(false);
    expect(gnc.state.thrustN).toBe(0);
  });
});

describe('RadiationSubsystem', () => {
  it('multiplies dose rate during Solar Particle Event (SPE)', () => {
    const rad = new RadiationSubsystem();
    rad.step(1.0, 'cruise');
    const nominalRate = rad.state.doseRate;

    rad.injectSPE(20.0);
    rad.step(1.0, 'cruise');
    expect(rad.state.speActive).toBe(true);
    expect(rad.state.doseRate).toBeCloseTo(nominalRate * 20.0, 2);

    rad.clearSPE();
    rad.step(1.0, 'cruise');
    expect(rad.state.speActive).toBe(false);
    expect(rad.state.doseRate).toBeCloseTo(nominalRate, 2);
  });
});

describe('CrewSubsystem', () => {
  it('calculates SpO2 using sigmoid function and classifies status', () => {
    const crew = new CrewSubsystem(new SeededRng(42));
    expect(crew.crew.length).toBe(4);

    // Nominal conditions (ppO2 = 21.3 kPa, ppCO2 = 0.5 kPa)
    crew.step(1.0, 21.3, 0.5, 1.5);
    for (const member of crew.crew) {
      expect(member.spO2).toBeGreaterThan(98.0);
      expect(member.status).toBe('NOMINAL');
    }

    // Hypoxic conditions (ppO2 = 12.0 kPa)
    crew.step(1.0, 12.0, 0.5, 1.5);
    for (const member of crew.crew) {
      expect(member.spO2).toBeLessThan(93.0);
      expect(member.status).not.toBe('NOMINAL');
    }
  });
});

describe('ComputeSubsystem', () => {
  it('powers down Tier 2 on gateTier2() and restores on activateTier2()', () => {
    const compute = new ComputeSubsystem();
    expect(compute.state.tier2Active).toBe(true);
    expect(compute.state.tier2PowerW).toBe(25);

    compute.gateTier2();
    expect(compute.state.tier2Active).toBe(false);
    expect(compute.state.tier2PowerW).toBe(1); // Gated power
    expect(compute.state.totalPowerW).toBe(46);

    compute.activateTier2();
    expect(compute.state.tier2Active).toBe(true);
    expect(compute.state.tier2PowerW).toBe(25);
  });
});

describe('SubsystemManager', () => {
  it('steps all physical models and produces stochastic sensor telemetry readings', () => {
    const manager = new SubsystemManager();
    manager.step(1.0, 1.2, 'Cruise', 2451545.0);

    const telem = manager.getTelemetry();
    expect(telem.size).toBeGreaterThan(30);

    const tempIn = telem.get('thermal_loopA_tempIn');
    expect(tempIn).toBeDefined();
    expect(tempIn?.raw).toBeGreaterThan(280);
    expect(tempIn?.measured).toBeGreaterThan(280);
    expect(tempIn?.status).toBe('OK');

    const cabinO2 = telem.get('eclss_ppO2');
    expect(cabinO2).toBeDefined();
    expect(cabinO2?.measured).toBeCloseTo(21.3, 0);
  });

  it('evaluates caution and warning threshold alerts accurately', () => {
    const manager = new SubsystemManager();

    // Normal baseline should have 0 alerts
    manager.step(1.0, 1.2, 'Cruise', 2451545.0);
    const initialAlerts = manager.getAlerts();
    expect(initialAlerts.length).toBe(0);

    // 1. Inject coolant pump failure -> flow drops below 0.25 kg/s cautionLow
    manager.faultInjector.inject('coolant_pump_failure');
    manager.step(1.0, 1.2, 'Cruise', 2451545.0);

    const pumpAlerts = manager.getAlerts();
    const flowAlert = pumpAlerts.find(a => a.channel === 'thermal_loopA_flow');
    expect(flowAlert).toBeDefined();
    expect(['CAUTION', 'WARNING']).toContain(flowAlert?.level);

    // 2. Inject cabin hull leak -> pressure drops below 95.0 kPa cautionLow
    manager.faultInjector.inject('cabin_leak', { rate: 0.02 });
    for (let t = 0; t < 50; t++) {
      manager.step(10.0, 1.2, 'Cruise', 2451545.0);
    }

    const leakAlerts = manager.getAlerts();
    const pressureAlert = leakAlerts.find(a => a.channel === 'eclss_cabin_pressure');
    expect(pressureAlert).toBeDefined();
    expect(['CAUTION', 'WARNING']).toContain(pressureAlert?.level);
  });
});
