/**
 * AEGIS TRANSIT — Radiation Environment Subsystem
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Models deep space Galactic Cosmic Rays (GCR), Solar Particle Events (SPE),
 * habitat shielding factors, and cumulative biological dose accumulation.
 */

import { RAD_DOSE_CRUISE, RAD_DOSE_SURFACE, SECONDS_PER_DAY } from '../constants.js';

export interface RadiationState {
  doseRate: number;           // mSv/day
  cumulativeDose: number;     // mSv
  shieldingFactor: number;    // 0-1 (1 = no shielding effect)
  speActive: boolean;         // Solar Particle Event
  speMultiplier: number;      // multiplier during SPE
  phase: 'cruise' | 'surface';
}

export class RadiationSubsystem {
  public state: RadiationState;

  constructor() {
    this.state = {
      doseRate: RAD_DOSE_CRUISE * 0.85,
      cumulativeDose: 12.4, // Initial accumulated transit dose
      shieldingFactor: 0.85, // Transit habitat nominal shielding
      speActive: false,
      speMultiplier: 18.0,
      phase: 'cruise',
    };
  }

  /**
   * Advances radiation dose tracking by dt seconds.
   *
   * @param dt Elapsed simulation time in seconds
   * @param phase Current mission phase string
   */
  step(dt: number, phase: string): void {
    if (dt <= 0) return;

    const isSurface = phase.toLowerCase().includes('surface');
    this.state.phase = isSurface ? 'surface' : 'cruise';

    const baseRate = isSurface ? RAD_DOSE_SURFACE : RAD_DOSE_CRUISE;

    if (this.state.speActive) {
      this.state.doseRate = baseRate * this.state.speMultiplier * this.state.shieldingFactor;
    } else {
      this.state.doseRate = baseRate * this.state.shieldingFactor;
    }

    const doseIncrement = this.state.doseRate * (dt / SECONDS_PER_DAY);
    this.state.cumulativeDose += doseIncrement;
  }

  /**
   * Injects a Solar Particle Event (SPE) space weather anomaly.
   *
   * @param multiplier Solar flux intensification factor (default 18.0x)
   */
  injectSPE(multiplier: number = 18.0): void {
    this.state.speActive = true;
    this.state.speMultiplier = Math.max(1.0, multiplier);
  }

  /**
   * Clears the active Solar Particle Event.
   */
  clearSPE(): void {
    this.state.speActive = false;
  }
}
