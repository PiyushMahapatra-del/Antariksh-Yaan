/**
 * AEGIS TRANSIT — Safety Gate (Tier 0 FSW)
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * The ONLY writer to actuators. Accepts whitelisted procedure IDs,
 * validates preconditions, checks flight rules, requires crew confirmation
 * for irreversible actions.
 * 
 * Fidelity: HIGH (enforced architectural boundary)
 */

import type { MissionPhase, AlertLevel } from '../core/types.js';

/** A whitelisted procedure that the safety gate can execute */
export interface WhitelistedProcedure {
  id: string;
  name: string;
  description: string;
  /** Phases in which this procedure is valid */
  validPhases: MissionPhase[];
  /** Parameter definitions */
  params: { name: string; min: number; max: number; unit: string }[];
  /** Preconditions that must be met */
  preconditions: { id: string; description: string; check: (state: GateState) => boolean }[];
  /** Requires crew confirmation? */
  requiresCrewConfirm: boolean;
  /** Is this irreversible? */
  irreversible: boolean;
  /** Is this crew-affecting? */
  crewAffecting: boolean;
}

/** State available to safety gate checks */
export interface GateState {
  phase: MissionPhase;
  alertLevel: AlertLevel;
  isBurning: boolean;
  batterySOC: number;
  cabinPressure: number;
  ppO2: number;
  thermalAActive: boolean;
  thermalBActive: boolean;
  tier2Active: boolean;
  deltaVRemaining: number;
}

/** Result of a safety gate evaluation */
export interface GateResult {
  approved: boolean;
  procedureId: string;
  reasons: string[];
  requiresCrewConfirm: boolean;
  timestamp: number;
}

/**
 * Safety Gate — the only path to actuators.
 * 
 * ARCHITECTURAL CONSTRAINT: Only accepts whitelisted procedure IDs.
 * The AI tier proposes; the safety gate decides and crew confirms.
 * 
 * NEVER imports from src/ai.
 */
export class SafetyGate {
  private _whitelist: Map<string, WhitelistedProcedure> = new Map();
  private _state: GateState;
  private _log: GateResult[] = [];
  private _pendingConfirm: { proc: WhitelistedProcedure; params: Record<string, number> } | null = null;

  constructor() {
    this._state = {
      phase: 'Cruise',
      alertLevel: 'NOMINAL',
      isBurning: false,
      batterySOC: 1.0,
      cabinPressure: 101.3,
      ppO2: 21.3,
      thermalAActive: true,
      thermalBActive: false,
      tier2Active: true,
      deltaVRemaining: 3000,
    };
    this._buildWhitelist();
  }

  get log(): readonly GateResult[] { return this._log; }
  get hasPending(): boolean { return this._pendingConfirm !== null; }
  get pendingProcedure(): string | null { return this._pendingConfirm?.proc.id ?? null; }

  /** Update gate state each tick */
  updateState(partial: Partial<GateState>): void {
    Object.assign(this._state, partial);
  }

  /** Evaluate a procedure request. Returns approval or rejection with reasons. */
  evaluate(procedureId: string, params: Record<string, number> = {}): GateResult {
    const proc = this._whitelist.get(procedureId);
    const timestamp = Date.now();

    // 1. Check whitelist
    if (!proc) {
      const result: GateResult = {
        approved: false,
        procedureId,
        reasons: [`Procedure "${procedureId}" is NOT in the safety whitelist. Rejected.`],
        requiresCrewConfirm: false,
        timestamp,
      };
      this._log.push(result);
      return result;
    }

    const reasons: string[] = [];

    // 2. Check valid phase
    if (proc.validPhases.length > 0 && !proc.validPhases.includes(this._state.phase)) {
      reasons.push(`Procedure not valid in phase ${this._state.phase}. Valid: ${proc.validPhases.join(', ')}`);
    }

    // 3. Check parameter ranges
    for (const pdef of proc.params) {
      const val = params[pdef.name];
      if (val === undefined) {
        reasons.push(`Missing required parameter: ${pdef.name}`);
      } else if (val < pdef.min || val > pdef.max) {
        reasons.push(`Parameter ${pdef.name} = ${val} out of range [${pdef.min}, ${pdef.max}] ${pdef.unit}`);
      }
    }

    // 4. Check preconditions
    for (const pre of proc.preconditions) {
      if (!pre.check(this._state)) {
        reasons.push(`Precondition failed: ${pre.description}`);
      }
    }

    // 5. Check if irreversible/crew-affecting needs confirmation
    const needsConfirm = proc.requiresCrewConfirm ||
      (proc.irreversible && this._state.alertLevel !== 'CRITICAL') ||
      proc.crewAffecting;

    const approved = reasons.length === 0;

    if (approved && needsConfirm) {
      this._pendingConfirm = { proc, params };
    }

    const result: GateResult = {
      approved: approved && !needsConfirm,
      procedureId,
      reasons: approved ? (needsConfirm ? ['AWAITING_CREW_CONFIRM'] : []) : reasons,
      requiresCrewConfirm: approved && needsConfirm,
      timestamp,
    };

    this._log.push(result);
    return result;
  }

  /** Crew confirms pending procedure */
  confirmPending(): GateResult | null {
    if (!this._pendingConfirm) return null;
    const { proc } = this._pendingConfirm;
    const result: GateResult = {
      approved: true,
      procedureId: proc.id,
      reasons: [],
      requiresCrewConfirm: false,
      timestamp: Date.now(),
    };
    this._log.push(result);
    this._pendingConfirm = null;
    return result;
  }

  /** Crew rejects pending procedure */
  rejectPending(): void {
    if (this._pendingConfirm) {
      this._log.push({
        approved: false,
        procedureId: this._pendingConfirm.proc.id,
        reasons: ['Rejected by crew'],
        requiresCrewConfirm: false,
        timestamp: Date.now(),
      });
      this._pendingConfirm = null;
    }
  }

  /** Check if a procedure ID is whitelisted */
  isWhitelisted(procedureId: string): boolean {
    return this._whitelist.has(procedureId);
  }

  /** Get all whitelisted procedure IDs */
  getWhitelistedIds(): string[] {
    return [...this._whitelist.keys()];
  }

  private _buildWhitelist(): void {
    const procs: WhitelistedProcedure[] = [
      {
        id: 'PROC_LOOP_SWITCH',
        name: 'Coolant Loop Failover',
        description: 'Switch from failed coolant loop to redundant loop',
        validPhases: [],
        params: [{ name: 'targetLoop', min: 0, max: 1, unit: '0=A,1=B' }],
        preconditions: [
          { id: 'redundant_available', description: 'Redundant loop must be available', check: s => !s.thermalAActive || !s.thermalBActive },
        ],
        requiresCrewConfirm: false,
        irreversible: false,
        crewAffecting: false,
      },
      {
        id: 'PROC_LOAD_SHED',
        name: 'Load Shed',
        description: 'Shed non-essential electrical loads',
        validPhases: [],
        params: [],
        preconditions: [],
        requiresCrewConfirm: false,
        irreversible: false,
        crewAffecting: false,
      },
      {
        id: 'PROC_GATE_TIER2',
        name: 'Power-Gate Tier 2 Compute',
        description: 'Power off Tier 2 AI compute module',
        validPhases: [],
        params: [],
        preconditions: [],
        requiresCrewConfirm: false,
        irreversible: false,
        crewAffecting: false,
      },
      {
        id: 'PROC_ACTIVATE_TIER2',
        name: 'Activate Tier 2 Compute',
        description: 'Power on Tier 2 AI compute (cold start ~20-60s)',
        validPhases: [],
        params: [],
        preconditions: [
          { id: 'no_thermal_warning', description: 'No thermal warnings', check: s => s.alertLevel !== 'WARNING' && s.alertLevel !== 'CRITICAL' },
        ],
        requiresCrewConfirm: false,
        irreversible: false,
        crewAffecting: false,
      },
      {
        id: 'PROC_MOI_BURN',
        name: 'Mars Orbit Insertion Burn',
        description: 'Execute MOI burn for Mars capture',
        validPhases: ['MOI'],
        params: [{ name: 'deltaV', min: 500, max: 3000, unit: 'm/s' }],
        preconditions: [
          { id: 'sufficient_dv', description: 'Sufficient delta-v remaining', check: s => s.deltaVRemaining > 500 },
          { id: 'not_burning', description: 'No active burn', check: s => !s.isBurning },
        ],
        requiresCrewConfirm: true,
        irreversible: true,
        crewAffecting: true,
      },
      {
        id: 'PROC_ABORT_MOI',
        name: 'Abort MOI to Flyby',
        description: 'Abort MOI burn and enter flyby trajectory',
        validPhases: ['MOI'],
        params: [],
        preconditions: [],
        requiresCrewConfirm: true,
        irreversible: true,
        crewAffecting: true,
      },
      {
        id: 'PROC_O2_SUPPLEMENT',
        name: 'Supplemental O2 Supply',
        description: 'Open supplemental O2 supply to cabin',
        validPhases: [],
        params: [{ name: 'flowRate', min: 0.001, max: 0.1, unit: 'kg/s' }],
        preconditions: [],
        requiresCrewConfirm: false,
        irreversible: false,
        crewAffecting: true,
      },
      {
        id: 'PROC_SAFE_MODE',
        name: 'Enter Safe Mode',
        description: 'Enter vehicle safe mode — shed all non-essential systems',
        validPhases: [],
        params: [],
        preconditions: [],
        requiresCrewConfirm: true,
        irreversible: false,
        crewAffecting: true,
      },
    ];

    for (const p of procs) {
      this._whitelist.set(p.id, p);
    }
  }
}
