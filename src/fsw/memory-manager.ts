/**
 * AEGIS TRANSIT — Memory Hierarchy Manager (Tier 0 FSW)
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Enforces R0 (read-only), R1 (append-only), LIB (signed library),
 * R2 (phase working set A/B), R3 (scratch).
 * 
 * Fidelity: HIGH (enforced regions with write-protection)
 */

import type { MissionPhase } from '../core/types.js';

/** Memory region types */
export type MemoryRegion = 'R0' | 'R1' | 'LIB' | 'R2' | 'R3';

/** A registered module in the memory system */
export interface MemoryModule {
  id: string;
  name: string;
  size: number;           // bytes
  region: MemoryRegion;
  hash: string;           // SHA-256
  goldenHash: string;     // original hash from LIB
  phases: MissionPhase[]; // phases this module is needed for
  pinned: boolean;        // pinned = always resident
  slot: 'A' | 'B' | null; // which R2 slot (null if not in R2)
  verified: boolean;
  lastVerified: number;   // timestamp
  corrupted: boolean;
}

/** Residency rule result */
export interface ResidencySet {
  phase: MissionPhase;
  required: Set<string>;  // module IDs
  reason: Map<string, string>; // moduleId -> why it's required
}

/** Swap operation result */
export interface SwapResult {
  success: boolean;
  phase: MissionPhase;
  loaded: string[];
  evicted: string[];
  failedVerification: string[];
  swappedSlot: 'A' | 'B';
}

/** SEU detection result */
export interface SEUResult {
  detected: boolean;
  moduleId: string;
  originalHash: string;
  currentHash: string;
  restored: boolean;
  detectionTimeMs: number;
}

/**
 * Memory Manager — enforces the memory hierarchy.
 * 
 * R0: Golden read-only. Any write attempt throws and is logged.
 * R1: Persistent append-only (recorder, health history, downlink spool).
 * LIB: Full library of signed modules.
 * R2: Phase working set with A/B swap slots.
 * R3: Scratch buffers, session state.
 */
export class MemoryManager {
  private _modules: Map<string, MemoryModule> = new Map();
  private _activeSlot: 'A' | 'B' = 'A';
  private _r0WriteAttempts: { timestamp: number; moduleId: string; caller: string }[] = [];
  private _seuLog: SEUResult[] = [];

  /** Region capacity limits (bytes) */
  readonly regionCapacity: Record<MemoryRegion, number> = {
    R0: 1_000_000,      // 1 MB
    R1: 50_000_000,     // 50 MB
    LIB: 500_000_000,   // 500 MB
    R2: 100_000_000,    // 100 MB
    R3: 20_000_000,     // 20 MB
  };

  constructor() {
    this._buildInitialModules();
  }

  get modules(): ReadonlyMap<string, MemoryModule> { return this._modules; }
  get activeSlot(): 'A' | 'B' { return this._activeSlot; }
  get r0WriteAttempts(): readonly { timestamp: number; moduleId: string; caller: string }[] { return this._r0WriteAttempts; }
  get seuLog(): readonly SEUResult[] { return this._seuLog; }

  /** Get region usage stats */
  getRegionUsage(region: MemoryRegion): { used: number; capacity: number; modules: string[] } {
    let used = 0;
    const moduleIds: string[] = [];
    for (const [id, mod] of this._modules) {
      if (mod.region === region) {
        used += mod.size;
        moduleIds.push(id);
      }
    }
    return { used, capacity: this.regionCapacity[region], modules: moduleIds };
  }

  /** Attempt to write to R0 — ALWAYS throws and logs */
  attemptR0Write(moduleId: string, caller: string = 'unknown'): never {
    this._r0WriteAttempts.push({ timestamp: Date.now(), moduleId, caller });
    throw new Error(`R0 WRITE VIOLATION: Module "${moduleId}" is in read-only R0 region. Write attempt by "${caller}" blocked and logged.`);
  }

  /** Register a module */
  registerModule(mod: MemoryModule): void {
    this._modules.set(mod.id, { ...mod });
  }

  /** Compute residency set for a phase using the window rule */
  computeResidencySet(currentPhase: MissionPhase, phaseGraph: Map<MissionPhase, MissionPhase[]>): ResidencySet {
    const required = new Set<string>();
    const reason = new Map<string, string>();

    // Rule: resident = {current} ∪ {previous} ∪ {one-hop reachable including abort} ∪ {pinned}
    const phases = new Set<MissionPhase>();
    phases.add(currentPhase);

    // One-hop reachable (including abort targets)
    const reachable = phaseGraph.get(currentPhase) ?? [];
    for (const p of reachable) phases.add(p);

    // Previous phase (for rollback window)
    const allPhases: MissionPhase[] = ['Cruise', 'MOI', 'MarsOrbit', 'EDL', 'SurfaceOps', 'Ascent', 'TEI', 'ReturnCruise', 'EarthEntry'];
    const currentIdx = allPhases.indexOf(currentPhase);
    if (currentIdx > 0) phases.add(allPhases[currentIdx - 1]);

    // Collect modules needed for these phases + pinned
    for (const [id, mod] of this._modules) {
      if (mod.pinned) {
        required.add(id);
        reason.set(id, 'PINNED (contingency)');
      } else if (mod.phases.some(p => phases.has(p))) {
        required.add(id);
        const matchingPhases = mod.phases.filter(p => phases.has(p));
        reason.set(id, `Required for: ${matchingPhases.join(', ')}`);
      }
    }

    return { phase: currentPhase, required, reason };
  }

  /** Stage modules for a phase transition into the inactive slot */
  async stageForPhase(
    targetPhase: MissionPhase,
    phaseGraph: Map<MissionPhase, MissionPhase[]>
  ): Promise<SwapResult> {
    const residency = this.computeResidencySet(targetPhase, phaseGraph);
    const inactiveSlot: 'A' | 'B' = this._activeSlot === 'A' ? 'B' : 'A';
    const loaded: string[] = [];
    const evicted: string[] = [];
    const failedVerification: string[] = [];

    // Load required modules into inactive slot
    for (const modId of residency.required) {
      const mod = this._modules.get(modId);
      if (!mod) continue;

      if (mod.region === 'R0' || mod.region === 'R1') continue; // R0/R1 always available

      // Verify hash
      if (mod.hash !== mod.goldenHash) {
        failedVerification.push(modId);
        // Restore from LIB (reset hash)
        mod.hash = mod.goldenHash;
        mod.corrupted = false;
      }

      mod.slot = inactiveSlot;
      mod.verified = true;
      mod.lastVerified = Date.now();
      loaded.push(modId);
    }

    // Evict modules not in the required set from inactive slot (demote to LIB, never delete)
    for (const [id, mod] of this._modules) {
      if (mod.slot === inactiveSlot && !residency.required.has(id) && !mod.pinned) {
        mod.slot = null;
        mod.region = 'LIB'; // Demote, never delete
        evicted.push(id);
      }
    }

    // If verification passed, swap
    if (failedVerification.length === 0) {
      this._activeSlot = inactiveSlot;
    }

    return {
      success: failedVerification.length === 0,
      phase: targetPhase,
      loaded,
      evicted,
      failedVerification,
      swappedSlot: inactiveSlot,
    };
  }

  /** SEU scrubber: check module hashes against golden */
  scrubForSEU(): SEUResult[] {
    const results: SEUResult[] = [];
    const startTime = performance.now();

    for (const [id, mod] of this._modules) {
      if (mod.region === 'R0' || mod.region === 'LIB' || mod.slot !== null) {
        if (mod.hash !== mod.goldenHash) {
          const detectionTime = performance.now() - startTime;
          const result: SEUResult = {
            detected: true,
            moduleId: id,
            originalHash: mod.goldenHash,
            currentHash: mod.hash,
            restored: true,
            detectionTimeMs: detectionTime,
          };
          // Restore from golden
          mod.hash = mod.goldenHash;
          mod.corrupted = false;
          mod.verified = true;
          mod.lastVerified = Date.now();

          results.push(result);
          this._seuLog.push(result);
        }
      }
    }

    return results;
  }

  /** Inject a bit-flip fault into a module (for testing/scenarios) */
  injectBitFlip(moduleId: string): boolean {
    const mod = this._modules.get(moduleId);
    if (!mod) return false;
    mod.hash = 'CORRUPTED_' + mod.hash.substring(10);
    mod.corrupted = true;
    mod.verified = false;
    return true;
  }

  /** Build initial module registry */
  private _buildInitialModules(): void {
    const m = (id: string, name: string, size: number, region: MemoryRegion, phases: MissionPhase[], pinned: boolean = false): MemoryModule => {
      const hash = this._simpleHash(id + name);
      return { id, name, size, region, hash, goldenHash: hash, phases, pinned, slot: null, verified: true, lastVerified: Date.now(), corrupted: false };
    };

    // R0: Golden read-only
    this.registerModule(m('r0_flight_rules', 'Flight Rule Tables', 50000, 'R0', [], true));
    this.registerModule(m('r0_phase_graph', 'Phase Graph Definition', 10000, 'R0', [], true));
    this.registerModule(m('r0_emergency_trees', 'Emergency Decision Trees', 80000, 'R0', [], true));
    this.registerModule(m('r0_medical_trees', 'Critical Medical Trees', 60000, 'R0', [], true));
    this.registerModule(m('r0_safe_mode_config', 'Safe Mode Configuration', 20000, 'R0', [], true));
    this.registerModule(m('r0_public_keys', 'Public Keys (ECDSA P-256)', 5000, 'R0', [], true));

    // LIB: Signed library modules
    this.registerModule(m('lib_thermal_model', 'Thermal Diagnostic Model', 2000000, 'LIB', ['Cruise', 'MOI', 'MarsOrbit', 'ReturnCruise']));
    this.registerModule(m('lib_eclss_model', 'ECLSS Diagnostic Model', 1500000, 'LIB', ['Cruise', 'MOI', 'MarsOrbit', 'SurfaceOps', 'ReturnCruise']));
    this.registerModule(m('lib_kg_cruise', 'Knowledge Graph: Cruise', 3000000, 'LIB', ['Cruise', 'ReturnCruise']));
    this.registerModule(m('lib_kg_moi', 'Knowledge Graph: MOI', 2000000, 'LIB', ['MOI']));
    this.registerModule(m('lib_kg_surface', 'Knowledge Graph: Surface', 4000000, 'LIB', ['SurfaceOps']));
    this.registerModule(m('lib_kg_edl', 'Knowledge Graph: EDL', 2500000, 'LIB', ['EDL']));
    this.registerModule(m('lib_case_base', 'Case Base (Synthetic)', 1000000, 'LIB', ['Cruise', 'MOI', 'MarsOrbit', 'SurfaceOps', 'ReturnCruise'], true));
    this.registerModule(m('lib_medical_full', 'Full Medical Library', 5000000, 'LIB', ['Cruise', 'MOI', 'MarsOrbit', 'SurfaceOps', 'ReturnCruise'], true));
    this.registerModule(m('lib_formulary', 'Formulary Database', 500000, 'LIB', [], true));

    // R2: Phase working set (initially loaded for Cruise)
    const cruiseModules = ['lib_thermal_model', 'lib_eclss_model', 'lib_kg_cruise', 'lib_case_base'];
    for (const modId of cruiseModules) {
      const mod = this._modules.get(modId);
      if (mod) {
        mod.slot = 'A';
      }
    }
  }

  private _simpleHash(input: string): string {
    let hash = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, '0').repeat(8);
  }
}
