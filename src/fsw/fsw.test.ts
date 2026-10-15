/**
 * AEGIS TRANSIT — Tier 0 FSW Unit Tests
 * SIMULATION: NOT FLIGHT SOFTWARE
 */
import { describe, it, expect } from 'vitest';
import { PhaseManager } from './phase-manager.js';
import { LimitChecker, FDIREngine } from './limit-checker.js';
import { SafetyGate } from './safety-gate.js';
import { Watchdog, HashChainedLog, ProcedureRunner } from './watchdog.js';
import { MemoryManager } from './memory-manager.js';

describe('PhaseManager', () => {
  it('starts in Cruise phase', () => {
    const pm = new PhaseManager();
    expect(pm.currentPhase).toBe('Cruise');
  });

  it('lists reachable phases from Cruise', () => {
    const pm = new PhaseManager();
    const reachable = pm.getReachablePhases();
    expect(reachable).toContain('MOI');
  });

  it('blocks transition to MOI without being in Mars SOI', () => {
    const pm = new PhaseManager();
    pm.updateContext({ inMarsSOI: false });
    const result = pm.tryTransition('MOI');
    expect(result.success).toBe(false);
    expect(result.reason).toContain('in_mars_soi');
  });

  it('blocks transition to non-existent edge', () => {
    const pm = new PhaseManager();
    const result = pm.tryTransition('SurfaceOps');
    expect(result.success).toBe(false);
    expect(result.reason).toContain('No edge');
  });

  it('provides abort targets', () => {
    const pm = new PhaseManager();
    // Cruise has no abort targets (it's the start)
    expect(pm.getAbortTargets()).toHaveLength(0);
  });
});

describe('LimitChecker', () => {
  it('returns NOMINAL for values within limits', () => {
    const lc = new LimitChecker();
    const level = lc.check('thermal_a_outlet_temp', 290, 'Cruise');
    expect(level).toBe('NOMINAL');
  });

  it('triggers CAUTION after persistence count', () => {
    const lc = new LimitChecker();
    // Caution high is 320 for thermal_a_outlet_temp, persistence = 3
    lc.check('thermal_a_outlet_temp', 325, 'Cruise');
    lc.check('thermal_a_outlet_temp', 325, 'Cruise');
    const level = lc.check('thermal_a_outlet_temp', 325, 'Cruise');
    expect(level).toBe('CAUTION');
  });

  it('triggers WARNING for values past warning threshold', () => {
    const lc = new LimitChecker();
    // Warning high is 340
    for (let i = 0; i < 3; i++) {
      lc.check('thermal_a_outlet_temp', 345, 'Cruise');
    }
    const level = lc.check('thermal_a_outlet_temp', 345, 'Cruise');
    expect(level).toBe('WARNING');
  });

  it('respects hysteresis when clearing', () => {
    const lc = new LimitChecker();
    // Trigger caution
    for (let i = 0; i < 5; i++) {
      lc.check('thermal_a_outlet_temp', 325, 'Cruise');
    }
    // Value drops below threshold but within hysteresis band (320 - 2 = 318)
    const level = lc.check('thermal_a_outlet_temp', 319, 'Cruise');
    expect(level).toBe('CAUTION'); // Should still be caution due to hysteresis
  });
});

describe('FDIREngine', () => {
  it('returns actions for WARNING level alerts', () => {
    const fdir = new FDIREngine();
    const actions = fdir.evaluate(
      [{ channelId: 'thermal_a_outlet_temp', level: 'WARNING' }],
      'Cruise',
      2451545.0
    );
    expect(actions.length).toBeGreaterThan(0);
    expect(actions.some(a => a.action === 'SHED_LOADS' || a.action === 'GATE_TIER2')).toBe(true);
  });

  it('does not repeat actions already active', () => {
    const fdir = new FDIREngine();
    fdir.evaluate([{ channelId: 'thermal_a_outlet_temp', level: 'WARNING' }], 'Cruise', 2451545.0);
    const second = fdir.evaluate([{ channelId: 'thermal_a_outlet_temp', level: 'WARNING' }], 'Cruise', 2451545.0);
    expect(second).toHaveLength(0);
  });
});

describe('SafetyGate', () => {
  it('rejects non-whitelisted procedure', () => {
    const gate = new SafetyGate();
    const result = gate.evaluate('PROC_HACK_COMPUTER');
    expect(result.approved).toBe(false);
    expect(result.reasons[0]).toContain('NOT in the safety whitelist');
  });

  it('approves whitelisted procedure with valid params', () => {
    const gate = new SafetyGate();
    gate.updateState({ thermalAActive: true, thermalBActive: false });
    const result = gate.evaluate('PROC_LOOP_SWITCH', { targetLoop: 1 });
    expect(result.approved).toBe(true);
  });

  it('rejects procedure with out-of-range params', () => {
    const gate = new SafetyGate();
    const result = gate.evaluate('PROC_LOOP_SWITCH', { targetLoop: 5 });
    expect(result.approved).toBe(false);
    expect(result.reasons.some(r => r.includes('out of range'))).toBe(true);
  });

  it('requires crew confirm for irreversible procedures', () => {
    const gate = new SafetyGate();
    gate.updateState({ phase: 'MOI', deltaVRemaining: 2000, isBurning: false });
    const result = gate.evaluate('PROC_MOI_BURN', { deltaV: 1000 });
    expect(result.requiresCrewConfirm).toBe(true);
  });

  it('lists all whitelisted procedure IDs', () => {
    const gate = new SafetyGate();
    const ids = gate.getWhitelistedIds();
    expect(ids).toContain('PROC_LOOP_SWITCH');
    expect(ids).toContain('PROC_MOI_BURN');
    expect(ids).toContain('PROC_SAFE_MODE');
    expect(ids.length).toBeGreaterThanOrEqual(8);
  });
});

describe('HashChainedLog', () => {
  it('appends entries with hash chain', async () => {
    const log = new HashChainedLog();
    const e1 = await log.append('TEST', { msg: 'hello' });
    const e2 = await log.append('TEST', { msg: 'world' });
    expect(e1.prevHash).toBe('0'.repeat(64));
    expect(e2.prevHash).toBe(e1.hash);
    expect(e2.hash).not.toBe(e1.hash);
  });

  it('verifies a clean chain', async () => {
    const log = new HashChainedLog();
    await log.append('A', { x: 1 });
    await log.append('B', { x: 2 });
    await log.append('C', { x: 3 });
    const result = await log.verify();
    expect(result.valid).toBe(true);
    expect(result.tamperedIndex).toBe(-1);
  });

  it('detects tampering', async () => {
    const log = new HashChainedLog();
    await log.append('A', { x: 1 });
    await log.append('B', { x: 2 });
    await log.append('C', { x: 3 });
    await log.tamperEntry(1);
    const result = await log.verify();
    expect(result.valid).toBe(false);
    expect(result.tamperedIndex).toBe(1);
  });
});

describe('Watchdog', () => {
  it('starts at FULL_AI', () => {
    const wd = new Watchdog(100);
    expect(wd.level).toBe('FULL_AI');
  });

  it('degrades when heartbeat stops', () => {
    const wd = new Watchdog(100);
    wd.simulateFreeze();
    const level = wd.check();
    expect(level).toBe('CREW_PROCEDURES');
    expect(wd.workerAlive).toBe(false);
  });

  it('recovers on heartbeat', () => {
    const wd = new Watchdog(100);
    wd.simulateFreeze();
    wd.check();
    expect(wd.level).not.toBe('FULL_AI');
    wd.heartbeat();
    expect(wd.level).toBe('FULL_AI');
    expect(wd.workerAlive).toBe(true);
  });
});

describe('MemoryManager', () => {
  it('has R0 modules registered', () => {
    const mm = new MemoryManager();
    const r0 = mm.getRegionUsage('R0');
    expect(r0.modules.length).toBeGreaterThan(0);
    expect(r0.modules).toContain('r0_flight_rules');
  });

  it('R0 write attempt throws and logs', () => {
    const mm = new MemoryManager();
    expect(() => mm.attemptR0Write('r0_flight_rules', 'test')).toThrow('R0 WRITE VIOLATION');
    expect(mm.r0WriteAttempts.length).toBe(1);
    expect(mm.r0WriteAttempts[0].caller).toBe('test');
  });

  it('SEU scrubber detects bit-flip and restores', () => {
    const mm = new MemoryManager();
    mm.injectBitFlip('r0_flight_rules');
    const results = mm.scrubForSEU();
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].detected).toBe(true);
    expect(results[0].restored).toBe(true);
    // Module should now be clean
    const mod = mm.modules.get('r0_flight_rules');
    expect(mod?.corrupted).toBe(false);
  });

  it('computes residency set with window rule', () => {
    const mm = new MemoryManager();
    const phaseGraph = new Map<string, string[]>([
      ['Cruise', ['MOI']],
      ['MOI', ['MarsOrbit', 'Cruise']],
    ]) as Map<any, any>;
    const set = mm.computeResidencySet('Cruise', phaseGraph);
    // Should include modules for Cruise and MOI (one-hop reachable)
    expect(set.required.size).toBeGreaterThan(0);
    // Pinned modules always included
    expect(set.required.has('r0_flight_rules')).toBe(true);
    expect(set.required.has('lib_case_base')).toBe(true);
  });

  it('never deletes modules — only demotes to LIB', async () => {
    const mm = new MemoryManager();
    const initialCount = mm.modules.size;
    const phaseGraph = new Map<string, string[]>([
      ['MarsOrbit', ['EDL', 'Cruise']],
    ]) as Map<any, any>;
    await mm.stageForPhase('MarsOrbit' as any, phaseGraph);
    // Module count should never decrease
    expect(mm.modules.size).toBeGreaterThanOrEqual(initialCount);
  });
});

describe('ProcedureRunner', () => {
  it('runs a simple procedure to completion', () => {
    const runner = new ProcedureRunner();
    runner.start({
      id: 'TEST_PROC',
      name: 'Test',
      description: 'Test procedure',
      steps: [
        { id: 's1', description: 'Step 1', action: 'do_thing', params: {}, rollbackNotes: 'Undo', requiresConfirm: false },
        { id: 's2', description: 'Step 2', action: 'do_other', params: {}, rollbackNotes: 'Undo', requiresConfirm: false },
      ],
    });
    expect(runner.status).toBe('RUNNING');
    runner.advance({});
    runner.advance({});
    expect(runner.status).toBe('COMPLETE');
  });

  it('pauses on step requiring confirmation', () => {
    const runner = new ProcedureRunner();
    runner.start({
      id: 'TEST_PROC',
      name: 'Test',
      description: 'Test procedure',
      steps: [
        { id: 's1', description: 'Step 1', action: 'do_thing', params: {}, rollbackNotes: 'Undo', requiresConfirm: true },
      ],
    });
    const result = runner.advance({});
    expect(result.status).toBe('AWAITING_CONFIRM');
    runner.confirm({});
    expect(runner.status).toBe('COMPLETE');
  });
});
