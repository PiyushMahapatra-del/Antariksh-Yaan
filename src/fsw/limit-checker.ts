/**
 * AEGIS TRANSIT — Limit Checker & FDIR (Tier 0 FSW)
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Rule-based fault detection, isolation, and recovery.
 * Acts independently of AI and always acts first.
 * 
 * Fidelity: HIGH (deterministic rule tables with hysteresis)
 */

import type { MissionPhase, AlertLevel } from '../core/types.js';

/** A single limit definition for a telemetry channel */
export interface LimitDef {
  channelId: string;
  cautionLow?: number;
  cautionHigh?: number;
  warningLow?: number;
  warningHigh?: number;
  /** Number of consecutive violations before triggering */
  persistenceCount: number;
  /** Hysteresis band (deadband) for clearing */
  hysteresis: number;
  /** Applicable phases (empty = all) */
  phases: MissionPhase[];
}

/** FDIR action to take on limit violation */
export interface FDIRAction {
  id: string;
  description: string;
  trigger: { channelId: string; level: AlertLevel };
  /** Applicable phases */
  phases: MissionPhase[];
  /** Action to perform */
  action: 'SWITCH_REDUNDANT' | 'SHED_LOADS' | 'SAFE_MODE' | 'GATE_TIER2' | 'ALERT_ONLY';
  /** Parameters for the action */
  params: Record<string, string>;
}

/** Current state of a limit check */
interface LimitState {
  currentLevel: AlertLevel;
  violationCount: number;
  lastValue: number;
  triggered: boolean;
}

/**
 * Limit Checker — evaluates telemetry against rule tables.
 */
export class LimitChecker {
  private _limits: LimitDef[] = [];
  private _states: Map<string, LimitState> = new Map();

  constructor() {
    this._buildDefaultLimits();
  }

  get limits(): readonly LimitDef[] { return this._limits; }

  /** Add or update a limit definition */
  addLimit(def: LimitDef): void {
    const existing = this._limits.findIndex(l => l.channelId === def.channelId);
    if (existing >= 0) this._limits[existing] = def;
    else this._limits.push(def);
  }

  /** Check a value against limits. Returns new alert level. */
  check(channelId: string, value: number, phase: MissionPhase): AlertLevel {
    const def = this._limits.find(l => l.channelId === channelId);
    if (!def) return 'NOMINAL';
    if (def.phases.length > 0 && !def.phases.includes(phase)) return 'NOMINAL';

    let state = this._states.get(channelId);
    if (!state) {
      state = { currentLevel: 'NOMINAL', violationCount: 0, lastValue: value, triggered: false };
      this._states.set(channelId, state);
    }

    const rawLevel = this._evaluateLevel(value, def);
    
    // Hysteresis: if currently triggered, require value to return to nominal band + hysteresis
    if (state.triggered && rawLevel === 'NOMINAL') {
      const inHysteresis = this._isInHysteresisBand(value, def);
      if (inHysteresis) {
        state.lastValue = value;
        return state.currentLevel; // Stay at current level
      }
      // Cleared hysteresis
      state.triggered = false;
      state.violationCount = 0;
      state.currentLevel = 'NOMINAL';
      state.lastValue = value;
      return 'NOMINAL';
    }

    // Persistence: count consecutive violations
    if (rawLevel !== 'NOMINAL') {
      state.violationCount++;
      if (state.violationCount >= def.persistenceCount) {
        state.triggered = true;
        state.currentLevel = rawLevel;
      }
    } else {
      state.violationCount = 0;
      state.currentLevel = 'NOMINAL';
      state.triggered = false;
    }

    state.lastValue = value;
    return state.currentLevel;
  }

  /** Reset all states */
  reset(): void {
    this._states.clear();
  }

  private _evaluateLevel(value: number, def: LimitDef): AlertLevel {
    if (def.warningLow !== undefined && value < def.warningLow) return 'WARNING';
    if (def.warningHigh !== undefined && value > def.warningHigh) return 'WARNING';
    if (def.cautionLow !== undefined && value < def.cautionLow) return 'CAUTION';
    if (def.cautionHigh !== undefined && value > def.cautionHigh) return 'CAUTION';
    return 'NOMINAL';
  }

  private _isInHysteresisBand(value: number, def: LimitDef): boolean {
    const h = def.hysteresis;
    if (def.cautionLow !== undefined && value < def.cautionLow + h) return true;
    if (def.cautionHigh !== undefined && value > def.cautionHigh - h) return true;
    return false;
  }

  private _buildDefaultLimits(): void {
    this._limits = [
      // Thermal
      { channelId: 'thermal_a_outlet_temp', cautionHigh: 320, warningHigh: 340, cautionLow: 260, warningLow: 250, persistenceCount: 3, hysteresis: 2, phases: [] },
      { channelId: 'thermal_b_outlet_temp', cautionHigh: 320, warningHigh: 340, cautionLow: 260, warningLow: 250, persistenceCount: 3, hysteresis: 2, phases: [] },
      { channelId: 'thermal_a_pump_rpm', cautionLow: 1500, warningLow: 800, persistenceCount: 5, hysteresis: 100, phases: [] },
      { channelId: 'thermal_a_accumulator', cautionLow: 0.3, warningLow: 0.15, persistenceCount: 5, hysteresis: 0.02, phases: [] },
      // ECLSS
      { channelId: 'eclss_ppO2', cautionLow: 19.5, warningLow: 17.0, cautionHigh: 23.5, warningHigh: 25.0, persistenceCount: 3, hysteresis: 0.5, phases: [] },
      { channelId: 'eclss_ppCO2', cautionHigh: 1.0, warningHigh: 2.0, persistenceCount: 3, hysteresis: 0.1, phases: [] },
      { channelId: 'eclss_cabin_pressure', cautionLow: 95, warningLow: 85, cautionHigh: 108, warningHigh: 115, persistenceCount: 3, hysteresis: 1, phases: [] },
      // Power
      { channelId: 'power_battery_soc', cautionLow: 0.25, warningLow: 0.10, persistenceCount: 5, hysteresis: 0.02, phases: [] },
      // Crew
      { channelId: 'crew_0_spo2', cautionLow: 93, warningLow: 88, persistenceCount: 3, hysteresis: 1, phases: [] },
      { channelId: 'crew_1_spo2', cautionLow: 93, warningLow: 88, persistenceCount: 3, hysteresis: 1, phases: [] },
      { channelId: 'crew_2_spo2', cautionLow: 93, warningLow: 88, persistenceCount: 3, hysteresis: 1, phases: [] },
      { channelId: 'crew_3_spo2', cautionLow: 93, warningLow: 88, persistenceCount: 3, hysteresis: 1, phases: [] },
      // Radiation
      { channelId: 'radiation_dose_rate', cautionHigh: 5.0, warningHigh: 20.0, persistenceCount: 1, hysteresis: 0.5, phases: [] },
    ];
  }
}

/**
 * FDIR Engine — Fault Detection, Isolation, and Recovery.
 * Acts independently of AI. Always acts first.
 */
export class FDIREngine {
  private _actions: FDIRAction[] = [];
  private _activeResponses: Set<string> = new Set();
  private _actionLog: { timestamp: number; actionId: string; trigger: string }[] = [];

  constructor() {
    this._buildDefaultActions();
  }

  get activeResponses(): ReadonlySet<string> { return this._activeResponses; }
  get actionLog(): readonly { timestamp: number; actionId: string; trigger: string }[] { return this._actionLog; }

  /** Evaluate and return actions to execute */
  evaluate(alerts: { channelId: string; level: AlertLevel }[], phase: MissionPhase, simTimeJD: number): FDIRAction[] {
    const toExecute: FDIRAction[] = [];

    for (const alert of alerts) {
      if (alert.level === 'NOMINAL') continue;

      for (const action of this._actions) {
        if (action.trigger.channelId === alert.channelId &&
            this._alertSeverity(alert.level) >= this._alertSeverity(action.trigger.level) &&
            (action.phases.length === 0 || action.phases.includes(phase)) &&
            !this._activeResponses.has(action.id)) {
          toExecute.push(action);
          this._activeResponses.add(action.id);
          this._actionLog.push({ timestamp: simTimeJD, actionId: action.id, trigger: alert.channelId });
        }
      }
    }

    return toExecute;
  }

  /** Clear an active response */
  clearResponse(actionId: string): void {
    this._activeResponses.delete(actionId);
  }

  /** Reset all */
  reset(): void {
    this._activeResponses.clear();
    this._actionLog.length = 0;
  }

  private _alertSeverity(level: AlertLevel): number {
    switch (level) {
      case 'NOMINAL': return 0;
      case 'CAUTION': return 1;
      case 'WARNING': return 2;
      case 'CRITICAL': return 3;
    }
  }

  private _buildDefaultActions(): void {
    this._actions = [
      {
        id: 'fdir_thermal_switch_loop',
        description: 'Switch to redundant coolant loop on pump failure',
        trigger: { channelId: 'thermal_a_pump_rpm', level: 'WARNING' },
        phases: [],
        action: 'SWITCH_REDUNDANT',
        params: { target: 'loop_b' },
      },
      {
        id: 'fdir_thermal_shed_loads',
        description: 'Shed non-essential loads on thermal warning',
        trigger: { channelId: 'thermal_a_outlet_temp', level: 'WARNING' },
        phases: [],
        action: 'SHED_LOADS',
        params: { includes: 'tier2_compute' },
      },
      {
        id: 'fdir_gate_tier2',
        description: 'Power-gate Tier 2 compute during thermal faults',
        trigger: { channelId: 'thermal_a_outlet_temp', level: 'CAUTION' },
        phases: [],
        action: 'GATE_TIER2',
        params: {},
      },
      {
        id: 'fdir_eclss_safe_mode',
        description: 'Safe mode on critical ECLSS failure',
        trigger: { channelId: 'eclss_ppO2', level: 'WARNING' },
        phases: [],
        action: 'ALERT_ONLY',
        params: {},
      },
      {
        id: 'fdir_radiation_shelter',
        description: 'Alert crew to radiation shelter during SPE',
        trigger: { channelId: 'radiation_dose_rate', level: 'WARNING' },
        phases: [],
        action: 'ALERT_ONLY',
        params: { message: 'RADIATION ALERT: Move to shelter' },
      },
    ];
  }
}
