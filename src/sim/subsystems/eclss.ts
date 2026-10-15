/**
 * AEGIS TRANSIT — Environmental Control and Life Support System (ECLSS)
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * First-principles atmospheric mass balance for 4-crew transit habitat.
 * Models crew metabolic consumption/generation, O2 regulator PI control loop,
 * amine/zeolite CO2 scrubbers, and pressure hull integrity.
 */

import { CREW_O2_RATE_KG_DAY, CREW_CO2_RATE_KG_DAY } from '../constants.js';

export interface ECLSSState {
  cabinVolume: number;        // m^3
  cabinPressure: number;      // kPa
  ppO2: number;               // kPa (partial pressure O2)
  ppN2: number;               // kPa
  ppCO2: number;              // kPa
  temperature: number;        // K
  o2FlowRate: number;         // kg/s (from regulator)
  co2ScrubberEfficiency: number; // 0-1
  leakRate: number;           // kg/s
  
  // Fault states  
  regulatorStuck: boolean;
  scrubberDegraded: boolean;
  cabinLeak: boolean;
}

export class ECLSSSubsystem {
  public state: ECLSSState;

  // Gas specific gas constants J/(kg*K)
  private readonly rO2 = 259.83;
  private readonly rN2 = 296.81;
  private readonly rCO2 = 188.92;

  // Internal gas masses in kg
  private massO2: number;
  private massN2: number;
  private massCO2: number;

  // PI Controller state for O2 regulator
  private integralError: number = 0;
  private readonly kp: number = 0.0001; // kg/s per kPa error
  private readonly ki: number = 0.000005; // integral gain

  constructor() {
    const volume = 100.0; // m^3
    const temp = 295.15;  // 22°C (K)

    // Initial partial pressures (kPa)
    const ppO2 = 21.3;
    const ppN2 = 79.5;
    const ppCO2 = 0.5;

    // Convert partial pressures to masses: m = P * V * 1000 / (R * T)
    this.massO2 = (ppO2 * volume * 1000) / (this.rO2 * temp);
    this.massN2 = (ppN2 * volume * 1000) / (this.rN2 * temp);
    this.massCO2 = (ppCO2 * volume * 1000) / (this.rCO2 * temp);

    this.state = {
      cabinVolume: volume,
      cabinPressure: ppO2 + ppN2 + ppCO2, // 101.3 kPa
      ppO2,
      ppN2,
      ppCO2,
      temperature: temp,
      o2FlowRate: 0.00003889, // ~0.84 kg/day for 4 crew
      co2ScrubberEfficiency: 1.0,
      leakRate: 0,
      regulatorStuck: false,
      scrubberDegraded: false,
      cabinLeak: false,
    };
  }

  /**
   * Advances the ECLSS atmospheric simulation by dt seconds.
   *
   * @param dt Elapsed simulation time in seconds
   * @param crewCount Number of active crew members
   */
  step(dt: number, crewCount: number): void {
    if (dt <= 0) return;

    const count = Math.max(0, crewCount);

    // 1. Crew Metabolic Rates (kg/s)
    const o2ConsumedRate = (CREW_O2_RATE_KG_DAY / 86400) * count;
    const co2ProducedRate = (CREW_CO2_RATE_KG_DAY / 86400) * count;

    // 2. O2 Regulator PI Control Loop (targeting setpoint 21.3 kPa)
    const setpointO2 = 21.3;
    const errorO2 = setpointO2 - this.state.ppO2;

    if (!this.state.regulatorStuck) {
      this.integralError = Math.max(-0.5, Math.min(0.5, this.integralError + errorO2 * dt));
      // Feedforward term to match nominal crew consumption plus PI adjustment
      const pTerm = this.kp * errorO2;
      const iTerm = this.ki * this.integralError;
      this.state.o2FlowRate = Math.max(0, Math.min(0.005, o2ConsumedRate + pTerm + iTerm));
    } else {
      // Regulator stuck closed / unadjusting
      this.state.o2FlowRate = 0;
    }

    // 3. CO2 Scrubber (target <= 0.5 kPa)
    // Sized for 1.3x nominal crew generation at 100% efficiency
    const nominalScrubCapacity = co2ProducedRate * 1.35;
    const scrubberFlow = nominalScrubCapacity * this.state.co2ScrubberEfficiency * 
      Math.min(2.5, Math.max(0, this.state.ppCO2 / 0.5));
    const co2Removed = Math.min(this.massCO2, scrubberFlow * dt);

    // 4. Gas Mass Updates
    const deltaO2 = (this.state.o2FlowRate - o2ConsumedRate) * dt;
    this.massO2 = Math.max(0, this.massO2 + deltaO2);

    const deltaCO2 = (co2ProducedRate * dt) - co2Removed;
    this.massCO2 = Math.max(0, this.massCO2 + deltaCO2);

    // 5. Cabin Hull Leakage
    if (this.state.cabinLeak && this.state.leakRate > 0) {
      const totalMass = this.massO2 + this.massN2 + this.massCO2;
      if (totalMass > 0) {
        const leakMass = Math.min(totalMass, this.state.leakRate * dt);
        this.massO2 -= leakMass * (this.massO2 / totalMass);
        this.massN2 -= leakMass * (this.massN2 / totalMass);
        this.massCO2 -= leakMass * (this.massCO2 / totalMass);
      }
    }

    // 6. Recalculate Partial Pressures and Total Cabin Pressure
    const volume = this.state.cabinVolume;
    const temp = this.state.temperature;

    this.state.ppO2 = (this.massO2 * this.rO2 * temp) / (volume * 1000);
    this.state.ppN2 = (this.massN2 * this.rN2 * temp) / (volume * 1000);
    this.state.ppCO2 = (this.massCO2 * this.rCO2 * temp) / (volume * 1000);
    this.state.cabinPressure = this.state.ppO2 + this.state.ppN2 + this.state.ppCO2;
  }

  /**
   * Injects an O2 regulator stuck closed fault.
   */
  injectRegulatorStuck(): void {
    this.state.regulatorStuck = true;
    this.state.o2FlowRate = 0;
  }

  /**
   * Injects a cabin hull pressure leak.
   */
  injectLeak(rate: number = 0.002): void {
    this.state.cabinLeak = true;
    this.state.leakRate = rate;
  }

  /**
   * Injects CO2 scrubber degradation fault.
   */
  injectScrubberDegradation(efficiency: number = 0.3): void {
    this.state.scrubberDegraded = true;
    this.state.co2ScrubberEfficiency = Math.max(0, Math.min(1, efficiency));
  }

  /**
   * Clears active ECLSS faults.
   */
  clearFault(fault: string): void {
    if (fault === 'regulator' || fault === 'all') {
      this.state.regulatorStuck = false;
      this.integralError = 0;
    }
    if (fault === 'leak' || fault === 'all') {
      this.state.cabinLeak = false;
      this.state.leakRate = 0;
    }
    if (fault === 'scrubber' || fault === 'all') {
      this.state.scrubberDegraded = false;
      this.state.co2ScrubberEfficiency = 1.0;
    }
  }
}
