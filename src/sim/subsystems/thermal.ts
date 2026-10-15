/**
 * AEGIS TRANSIT — Thermal Control Subsystem (ATCS)
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * High-fidelity dual-loop Active Thermal Control System (ATCS).
 * Integrates internal heat dissipation, radiator Stefan-Boltzmann rejection,
 * fluid pump hydraulics, and accumulator pressurization.
 */

import { SIGMA_SB } from '../constants.js';

export interface CoolantLoopState {
  id: 'A' | 'B';
  active: boolean;
  coolantTempIn: number;    // K (inlet to heat exchangers)
  coolantTempOut: number;   // K (outlet from heat exchangers / to radiator)
  pumpRpm: number;          // RPM
  pumpDeltaP: number;       // kPa
  flowRate: number;         // kg/s
  accumulatorLevel: number; // fraction 0-1
  loopPressure: number;     // kPa
  radiatorTemp: number;     // K
  
  // Fault states
  pumpDegraded: boolean;
  leaking: boolean;
  leakRate?: number;
  blocked: boolean;
}

export class ThermalSubsystem {
  public loopA: CoolantLoopState;
  public loopB: CoolantLoopState;
  
  // Base heat loads in Watts
  public baseHeatLoad: number = 1400;     // Avionics, life support base
  public payloadHeatLoad: number = 600;   // Scientific & comm payloads
  public computeHeatLoad: number = 70;    // FSW and AI inference compute

  // Physical parameters
  private readonly cp: number = 4186;     // Specific heat of water J/(kg*K)
  private readonly fluidMass: number = 60; // kg per loop
  private readonly radArea: number = 10;   // m^2 radiator area per loop (20 m^2 total)
  private readonly emissivity: number = 0.9;
  private readonly accumCapacityKg: number = 8; // Accumulator fluid capacity kg

  constructor() {
    this.loopA = this.createDefaultLoop('A', true);
    this.loopB = this.createDefaultLoop('B', true);
  }

  private createDefaultLoop(id: 'A' | 'B', active: boolean): CoolantLoopState {
    return {
      id,
      active,
      coolantTempIn: 290.0,
      coolantTempOut: 292.5,
      pumpRpm: 3600,
      pumpDeltaP: 155.0,
      flowRate: 0.45,
      accumulatorLevel: 0.88,
      loopPressure: 215.0,
      radiatorTemp: 292.5,
      pumpDegraded: false,
      leaking: false,
      leakRate: 0,
      blocked: false,
    };
  }

  /**
   * Advances the thermal simulation state by dt seconds.
   *
   * @param dt Elapsed simulation time in seconds
   * @param solarDistAU Current distance from Sun in AU
   */
  step(dt: number, solarDistAU: number): void {
    if (dt <= 0) return;

    // Environmental sink temperature: 200 K near Earth (<=1.05 AU) or Mars (1.4-1.6 AU), 3 K in deep space
    const isNearPlanet = solarDistAU <= 1.05 || (solarDistAU >= 1.38 && solarDistAU <= 1.62);
    const sinkTemp = isNearPlanet ? 200.0 : 3.0;

    // Total internal heat dissipation to be removed
    const totalQ = Math.max(0, this.baseHeatLoad + this.payloadHeatLoad + this.computeHeatLoad);

    const activeLoops = [this.loopA, this.loopB].filter(l => l.active);
    const loopCount = activeLoops.length;

    // Allocate heat load evenly among active loops
    const qPerLoop = loopCount > 0 ? totalQ / loopCount : 0;

    this.stepLoop(this.loopA, dt, qPerLoop, sinkTemp);
    this.stepLoop(this.loopB, dt, qPerLoop, sinkTemp);
  }

  private stepLoop(loop: CoolantLoopState, dt: number, qLoad: number, sinkTemp: number): void {
    if (!loop.active) {
      // Standby loop: pump idle, minimal heat exchange
      loop.pumpRpm = 0;
      loop.flowRate = 0;
      loop.pumpDeltaP = 0;
      return;
    }

    // 1. Pump Hydraulics
    let targetRpm = 3600;
    let pumpEfficiency = 1.0;

    if (loop.pumpDegraded) {
      pumpEfficiency = 0.5; // 50% efficiency under degraded fault
      targetRpm = 2400;
    }

    if (loop.blocked) {
      loop.pumpDeltaP = 320.0; // Backpressure spike behind blockage
      loop.flowRate = 0.01;    // Choked flow
      targetRpm = 3200;
    } else {
      const nominalFlow = 0.45; // kg/s
      loop.flowRate = nominalFlow * (targetRpm / 3600) * pumpEfficiency;
      loop.pumpDeltaP = 155.0 * pumpEfficiency;
    }
    loop.pumpRpm = targetRpm;

    // 2. Accumulator & Pressure Leakage
    if (loop.leaking && loop.leakRate && loop.leakRate > 0) {
      const lostMass = loop.leakRate * dt;
      const deltaFraction = lostMass / this.accumCapacityKg;
      loop.accumulatorLevel = Math.max(0, loop.accumulatorLevel - deltaFraction);
      if (loop.accumulatorLevel <= 0.05) {
        loop.loopPressure = Math.max(10, loop.loopPressure - (5.0 * dt));
      }
    } else {
      // Slowly refill / maintain nominal pressure if not leaking
      if (loop.accumulatorLevel > 0.1 && loop.loopPressure < 215.0) {
        loop.loopPressure = Math.min(215.0, loop.loopPressure + 0.5 * dt);
      }
    }

    // 3. Thermal Dynamics: Heat Absorption & Radiator Rejection
    const effectiveFlow = Math.max(0.01, loop.flowRate);
    const deltaT_absorb = qLoad / (effectiveFlow * this.cp);

    // Outlet temperature from heat exchangers
    loop.coolantTempOut = loop.coolantTempIn + deltaT_absorb;
    loop.radiatorTemp = loop.coolantTempOut;

    // Active thermal bypass valve (ATCS thermostat)
    // Closes radiator bypass when loop temperature exceeds 291 K to dump heat
    const setpoint = 291.0;
    let bypass = 0;
    if (loop.coolantTempIn < setpoint) {
      bypass = Math.min(1.0, Math.max(0, (setpoint - loop.coolantTempIn) / 8.0));
    }

    // Radiator Stefan-Boltzmann rejection: Q_rad = eps * sigma * A * (T_rad^4 - T_sink^4)
    const radEffectiveArea = this.radArea * (1 - bypass);
    const radEmission = this.emissivity * SIGMA_SB * radEffectiveArea * 
      (Math.pow(loop.radiatorTemp, 4) - Math.pow(sinkTemp, 4));
    const qRejected = Math.max(0, radEmission);

    // First-order Euler thermal integration of loop bulk fluid
    const netHeatRate = qLoad - qRejected;
    const thermalCap = this.fluidMass * this.cp;
    const dTempIn = (netHeatRate / thermalCap) * dt;

    // Update temperatures with physical bounds (freezing 260K to boiling 370K)
    loop.coolantTempIn = Math.min(370, Math.max(260, loop.coolantTempIn + dTempIn));
    loop.coolantTempOut = loop.coolantTempIn + (qLoad / (effectiveFlow * this.cp));
    loop.radiatorTemp = (loop.coolantTempIn + loop.coolantTempOut) / 2;
  }

  /**
   * Injects a coolant pump failure on specified loop.
   */
  injectPumpFailure(loop: 'A' | 'B'): void {
    const l = loop === 'A' ? this.loopA : this.loopB;
    l.pumpDegraded = true;
  }

  /**
   * Injects a coolant fluid leak on specified loop.
   */
  injectLeak(loop: 'A' | 'B', rate: number = 0.002): void {
    const l = loop === 'A' ? this.loopA : this.loopB;
    l.leaking = true;
    l.leakRate = rate;
  }

  /**
   * Injects a coolant loop hydraulic blockage on specified loop.
   */
  injectBlockage(loop: 'A' | 'B'): void {
    const l = loop === 'A' ? this.loopA : this.loopB;
    l.blocked = true;
  }

  /**
   * Clears an active fault on the specified loop.
   */
  clearFault(loop: 'A' | 'B', fault: string): void {
    const l = loop === 'A' ? this.loopA : this.loopB;
    if (fault === 'pump' || fault === 'all') {
      l.pumpDegraded = false;
    }
    if (fault === 'leak' || fault === 'all') {
      l.leaking = false;
      l.leakRate = 0;
      l.accumulatorLevel = 0.88;
      l.loopPressure = 215.0;
    }
    if (fault === 'blockage' || fault === 'all') {
      l.blocked = false;
    }
  }
}
