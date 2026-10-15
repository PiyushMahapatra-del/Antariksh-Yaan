/**
 * AEGIS TRANSIT — Dual-Tier Compute Architecture Subsystem
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Models Tier 1 (FSW Rad-Hard Deterministic Core) and
 * Tier 2 (AI Diagnostic Accelerator / Power-Gated Coprocessor).
 */

import { TIER2_POWER_ACTIVE_W, TIER2_POWER_GATED_W } from '../constants.js';

export interface ComputeState {
  tier1Active: boolean;
  tier2Active: boolean;
  tier1PowerW: number;
  tier2PowerW: number;
  totalPowerW: number;
  thermalOutputW: number;    // heat generated, feeds into thermal
}

export class ComputeSubsystem {
  public state: ComputeState;

  constructor() {
    const tier1Pwr = 45.0; // Deterministic Rad750/GR740 core
    const tier2Pwr = TIER2_POWER_ACTIVE_W;

    this.state = {
      tier1Active: true,
      tier2Active: true,
      tier1PowerW: tier1Pwr,
      tier2PowerW: tier2Pwr,
      totalPowerW: tier1Pwr + tier2Pwr,
      thermalOutputW: tier1Pwr + tier2Pwr,
    };
  }

  /**
   * Advances compute power consumption and thermal dissipation state.
   *
   * @param dt Elapsed simulation time in seconds
   */
  step(dt: number): void {
    if (dt <= 0) return;

    this.state.tier1PowerW = this.state.tier1Active ? 45.0 : 0;
    this.state.tier2PowerW = this.state.tier2Active ? TIER2_POWER_ACTIVE_W : TIER2_POWER_GATED_W;
    this.state.totalPowerW = this.state.tier1PowerW + this.state.tier2PowerW;
    this.state.thermalOutputW = this.state.totalPowerW;
  }

  /**
   * Power-gates Tier 2 compute to shed electrical and thermal loads.
   */
  gateTier2(): void {
    this.state.tier2Active = false;
    this.state.tier2PowerW = TIER2_POWER_GATED_W;
    this.state.totalPowerW = this.state.tier1PowerW + this.state.tier2PowerW;
    this.state.thermalOutputW = this.state.totalPowerW;
  }

  /**
   * Activates / cold-starts Tier 2 AI inference engine.
   */
  activateTier2(): void {
    this.state.tier2Active = true;
    this.state.tier2PowerW = TIER2_POWER_ACTIVE_W;
    this.state.totalPowerW = this.state.tier1PowerW + this.state.tier2PowerW;
    this.state.thermalOutputW = this.state.totalPowerW;
  }
}
