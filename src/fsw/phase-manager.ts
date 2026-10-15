/**
 * AEGIS TRANSIT — Phase Manager (Tier 0 FSW)
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Directed graph of mission phases with transitions, abort edges,
 * and rollback capability. The AI tier subscribes read-only.
 * 
 * Fidelity: HIGH (integrated state machine with guard conditions)
 */

import type { MissionPhase, AlertLevel } from '../core/types.js';

/** Transition guard: must return true for transition to proceed */
export interface TransitionGuard {
  /** Unique ID for logging */
  id: string;
  /** Human-readable description */
  description: string;
  /** Evaluate: returns true if guard is satisfied */
  evaluate: (context: PhaseContext) => boolean;
}

/** Context available to transition guards */
export interface PhaseContext {
  simTimeJD: number;
  metSeconds: number;
  phase: MissionPhase;
  deltaVRemaining: number;
  alertLevel: AlertLevel;
  /** True if currently in a burn */
  isBurning: boolean;
  /** Distance to Mars in AU */
  distToMarsAU: number;
  /** Whether the ship is inside Mars SOI */
  inMarsSOI: boolean;
  /** Custom flags set by procedures */
  flags: Map<string, boolean>;
}

/** Defines a directed edge in the phase graph */
export interface PhaseTransition {
  from: MissionPhase;
  to: MissionPhase;
  /** Is this an abort edge? */
  isAbort: boolean;
  /** Is this a rollback edge? */
  isRollback: boolean;
  /** Guards that must all pass */
  guards: TransitionGuard[];
  /** Is this transition irreversible once committed? */
  irreversible: boolean;
  /** Requires crew confirmation? */
  requiresCrewConfirm: boolean;
}

/** Committed transition record */
export interface TransitionRecord {
  from: MissionPhase;
  to: MissionPhase;
  timestamp: number;
  isAbort: boolean;
  guardResults: { id: string; passed: boolean }[];
}

/**
 * Phase Manager — directed graph of mission phases.
 * 
 * NEVER imports from src/ai. AI subscribes read-only via the event bus.
 */
export class PhaseManager {
  private _currentPhase: MissionPhase = 'Cruise';
  private _transitions: PhaseTransition[] = [];
  private _history: TransitionRecord[] = [];
  private _context: PhaseContext;
  private _pendingTransition: PhaseTransition | null = null;

  constructor() {
    this._context = {
      simTimeJD: 0,
      metSeconds: 0,
      phase: 'Cruise',
      deltaVRemaining: 0,
      alertLevel: 'NOMINAL',
      isBurning: false,
      distToMarsAU: 2.0,
      inMarsSOI: false,
      flags: new Map(),
    };
    this._buildGraph();
  }

  get currentPhase(): MissionPhase { return this._currentPhase; }
  get history(): readonly TransitionRecord[] { return this._history; }
  get pendingTransition(): PhaseTransition | null { return this._pendingTransition; }

  /** All phases in graph order */
  get allPhases(): MissionPhase[] {
    return ['Cruise', 'MOI', 'MarsOrbit', 'EDL', 'SurfaceOps', 'Ascent', 'TEI', 'ReturnCruise', 'EarthEntry'];
  }

  /** Get reachable phases from current (including abort targets) */
  getReachablePhases(): MissionPhase[] {
    return this._transitions
      .filter(t => t.from === this._currentPhase)
      .map(t => t.to);
  }

  /** Get abort targets from current phase */
  getAbortTargets(): MissionPhase[] {
    return this._transitions
      .filter(t => t.from === this._currentPhase && t.isAbort)
      .map(t => t.to);
  }

  /** Update context each tick */
  updateContext(partial: Partial<PhaseContext>): void {
    Object.assign(this._context, partial);
    this._context.phase = this._currentPhase;
  }

  /** Attempt a transition. Returns success and reason. */
  tryTransition(targetPhase: MissionPhase): { success: boolean; reason: string; guardResults: { id: string; passed: boolean }[] } {
    const transition = this._transitions.find(
      t => t.from === this._currentPhase && t.to === targetPhase
    );

    if (!transition) {
      return { success: false, reason: `No edge from ${this._currentPhase} to ${targetPhase}`, guardResults: [] };
    }

    const guardResults = transition.guards.map(g => ({
      id: g.id,
      passed: g.evaluate(this._context),
    }));

    const allPassed = guardResults.every(r => r.passed);

    if (!allPassed) {
      const failed = guardResults.filter(r => !r.passed).map(r => r.id).join(', ');
      return { success: false, reason: `Guards failed: ${failed}`, guardResults };
    }

    if (transition.requiresCrewConfirm) {
      this._pendingTransition = transition;
      return { success: false, reason: 'AWAITING_CREW_CONFIRM', guardResults };
    }

    this._commitTransition(transition, guardResults);
    return { success: true, reason: 'OK', guardResults };
  }

  /** Confirm a pending transition (crew confirmation) */
  confirmPendingTransition(): boolean {
    if (!this._pendingTransition) return false;
    const transition = this._pendingTransition;
    const guardResults = transition.guards.map(g => ({
      id: g.id,
      passed: g.evaluate(this._context),
    }));
    // Re-check guards at confirmation time
    if (!guardResults.every(r => r.passed)) {
      this._pendingTransition = null;
      return false;
    }
    this._commitTransition(transition, guardResults);
    this._pendingTransition = null;
    return true;
  }

  /** Cancel pending transition */
  cancelPendingTransition(): void {
    this._pendingTransition = null;
  }

  private _commitTransition(transition: PhaseTransition, guardResults: { id: string; passed: boolean }[]): void {
    const record: TransitionRecord = {
      from: this._currentPhase,
      to: transition.to,
      timestamp: this._context.simTimeJD,
      isAbort: transition.isAbort,
      guardResults,
    };
    this._history.push(record);
    this._currentPhase = transition.to;
    this._context.phase = transition.to;
  }

  /** Build the phase graph with all transitions and abort edges */
  private _buildGraph(): void {
    const T = (from: MissionPhase, to: MissionPhase, opts: Partial<PhaseTransition> = {}): PhaseTransition => ({
      from, to,
      isAbort: false,
      isRollback: false,
      guards: [],
      irreversible: false,
      requiresCrewConfirm: false,
      ...opts,
    });

    // Normal progression
    this._transitions = [
      T('Cruise', 'MOI', {
        irreversible: true,
        requiresCrewConfirm: true,
        guards: [
          { id: 'in_mars_soi', description: 'Ship must be in Mars SOI', evaluate: ctx => ctx.inMarsSOI },
          { id: 'no_critical', description: 'No CRITICAL alerts', evaluate: ctx => ctx.alertLevel !== 'CRITICAL' },
        ],
      }),
      T('MOI', 'MarsOrbit', {
        guards: [
          { id: 'burn_complete', description: 'MOI burn must be complete', evaluate: ctx => !ctx.isBurning },
        ],
      }),
      T('MarsOrbit', 'EDL', {
        irreversible: true,
        requiresCrewConfirm: true,
        guards: [
          { id: 'no_critical', description: 'No CRITICAL alerts', evaluate: ctx => ctx.alertLevel !== 'CRITICAL' },
        ],
      }),
      T('EDL', 'SurfaceOps', {
        guards: [
          { id: 'landed', description: 'EDL sequence complete', evaluate: ctx => ctx.flags.get('edl_complete') === true },
        ],
      }),
      T('SurfaceOps', 'Ascent', {
        irreversible: true,
        requiresCrewConfirm: true,
      }),
      T('Ascent', 'TEI', {
        guards: [
          { id: 'orbit_reached', description: 'Must reach Mars orbit', evaluate: ctx => ctx.flags.get('ascent_complete') === true },
        ],
      }),
      T('TEI', 'ReturnCruise', {
        guards: [
          { id: 'tei_burn_done', description: 'TEI burn complete', evaluate: ctx => !ctx.isBurning },
        ],
      }),
      T('ReturnCruise', 'EarthEntry', {
        irreversible: true,
        requiresCrewConfirm: true,
      }),

      // Abort edges
      T('MOI', 'Cruise', {
        isAbort: true,
        guards: [
          { id: 'abort_dv', description: 'Sufficient delta-v for flyby abort', evaluate: ctx => ctx.deltaVRemaining > 100 },
        ],
      }),
      T('EDL', 'MarsOrbit', {
        isAbort: true,
        isRollback: true,
        guards: [
          { id: 'pre_entry', description: 'Must abort before atmospheric entry', evaluate: ctx => ctx.flags.get('atm_entry') !== true },
        ],
      }),
      T('SurfaceOps', 'Ascent', {
        isAbort: true,
        requiresCrewConfirm: true,
      }),
    ];
  }
}
