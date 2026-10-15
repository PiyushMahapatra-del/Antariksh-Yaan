/**
 * AEGIS TRANSIT — Fault Injection Framework
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Programmatic fault injection engine for subsystem stress testing,
 * anomaly response evaluation, and AI diagnostic verification.
 */

import type { EventBus } from '../core/event-bus.js';
import type { AegisEventMap } from '../core/types.js';

export type FaultType = 
  | 'coolant_pump_failure' 
  | 'coolant_leak' 
  | 'coolant_blockage'
  | 'sensor_stuck' 
  | 'o2_regulator_stuck' 
  | 'cabin_leak'
  | 'scrubber_degradation' 
  | 'solar_particle_event'
  | 'ai_bitflip' 
  | 'ai_worker_freeze'
  | 'uplink_corrupt' 
  | 'early_blackout' 
  | 'moi_burn_abort';

export interface FaultDefinition {
  type: FaultType;
  params: Record<string, number>;
  active: boolean;
  injectedAt: number; // sim time JD
}

export interface FaultMetadata {
  type: FaultType;
  name: string;
  subsystem: string;
  description: string;
  defaultParams: Record<string, number>;
}

export const FAULT_CATALOG: FaultMetadata[] = [
  {
    type: 'coolant_pump_failure',
    name: 'Coolant Pump Degradation',
    subsystem: 'Thermal',
    description: 'Primary Loop A pump efficiency drops by 50%, reducing coolant mass flow',
    defaultParams: { loop: 0, efficiency: 0.5 },
  },
  {
    type: 'coolant_leak',
    name: 'Coolant Fluid Leak',
    subsystem: 'Thermal',
    description: 'Micro-meteoroid puncture causes slow fluid loss from Loop A accumulator',
    defaultParams: { rate: 0.005 },
  },
  {
    type: 'coolant_blockage',
    name: 'Radiator Line Blockage',
    subsystem: 'Thermal',
    description: 'Hydraulic blockage produces backpressure spike and starved loop flow',
    defaultParams: {},
  },
  {
    type: 'sensor_stuck',
    name: 'Telemetry Sensor Stuck',
    subsystem: 'Sensors',
    description: 'Analog telemetry channel freezes at current reading (hardware ADC latch-up)',
    defaultParams: { channel: 0, stuckValue: 295.0 },
  },
  {
    type: 'o2_regulator_stuck',
    name: 'O2 Regulator Stuck Closed',
    subsystem: 'ECLSS',
    description: 'Oxygen replenishment valve fails shut; cabin ppO2 decays with metabolic load',
    defaultParams: {},
  },
  {
    type: 'cabin_leak',
    name: 'Pressure Hull Micropuncture',
    subsystem: 'ECLSS',
    description: 'Structural micro-leak venting cabin atmosphere to deep space vacuum',
    defaultParams: { rate: 0.003 },
  },
  {
    type: 'scrubber_degradation',
    name: 'CO2 Scrubber Chemical Decay',
    subsystem: 'ECLSS',
    description: 'Amine adsorption bed degraded to 30% capacity; ppCO2 climbs steadily',
    defaultParams: { efficiency: 0.3 },
  },
  {
    type: 'solar_particle_event',
    name: 'Solar Particle Event (SPE)',
    subsystem: 'Radiation',
    description: 'Coronal mass ejection proton storm multiplying cosmic radiation flux',
    defaultParams: { multiplier: 18.0 },
  },
  {
    type: 'ai_bitflip',
    name: 'AI DRAM Single-Event Upset',
    subsystem: 'Compute',
    description: 'High-energy cosmic ray induces bitflip in Tier 2 inference weights memory',
    defaultParams: {},
  },
  {
    type: 'ai_worker_freeze',
    name: 'AI Inference Worker Hang',
    subsystem: 'Compute',
    description: 'Diagnostic coprocessor thread hangs; triggers safety gate timeout watchdog',
    defaultParams: {},
  },
  {
    type: 'uplink_corrupt',
    name: 'Deep Space Uplink Corruption',
    subsystem: 'Comms',
    description: 'Solar noise corrupts ground telecommand frame parity check',
    defaultParams: { errorRate: 0.8 },
  },
  {
    type: 'early_blackout',
    name: 'Solar Conjunction Blackout',
    subsystem: 'Comms',
    description: 'Premature corona plasma blackout blocking Earth telecommunication links',
    defaultParams: {},
  },
  {
    type: 'moi_burn_abort',
    name: 'Mars Insertion Burn Abort',
    subsystem: 'Propulsion',
    description: 'Turbopump cavitates during critical orbital insertion burn, forcing abort',
    defaultParams: {},
  },
];

export class FaultInjector {
  public activeFaults: Map<string, FaultDefinition> = new Map();
  private bus?: EventBus<AegisEventMap>;

  constructor(bus?: EventBus<AegisEventMap>) {
    this.bus = bus;
  }

  /**
   * Binds an event bus to dispatch injection and clearance events.
   */
  setBus(bus: EventBus<AegisEventMap>): void {
    this.bus = bus;
  }

  /**
   * Injects a specified fault into active simulation.
   *
   * @param type The fault category to activate
   * @param params Optional parametric configurations
   * @param simTimeJD Julian date of injection
   */
  inject(type: FaultType, params?: Record<string, number>, simTimeJD: number = 0): void {
    const faultDef: FaultDefinition = {
      type,
      params: params ?? {},
      active: true,
      injectedAt: simTimeJD,
    };

    this.activeFaults.set(type, faultDef);

    if (this.bus) {
      this.bus.emit('fault:injected', {
        faultId: type,
        params: faultDef.params,
      });
    }
  }

  /**
   * Clears a previously active fault.
   *
   * @param type The fault type to deactivate
   */
  clear(type: FaultType): void {
    if (this.activeFaults.delete(type)) {
      if (this.bus) {
        this.bus.emit('fault:cleared', { faultId: type });
      }
    }
  }

  /**
   * Clears all active faults.
   */
  clearAll(): void {
    const types = Array.from(this.activeFaults.keys()) as FaultType[];
    for (const t of types) {
      this.clear(t);
    }
  }

  /**
   * Checks whether a fault type is currently active.
   */
  isActive(type: FaultType): boolean {
    return this.activeFaults.has(type);
  }

  /**
   * Returns a snapshot array of all active fault definitions.
   */
  getActive(): FaultDefinition[] {
    return Array.from(this.activeFaults.values());
  }
}
