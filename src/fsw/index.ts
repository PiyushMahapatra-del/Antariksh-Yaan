/**
 * AEGIS TRANSIT — Tier 0 Flight Software Index
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * This module NEVER imports from src/ai (enforced by ESLint import-boundary rules).
 */

export { PhaseManager } from './phase-manager.js';
export type { PhaseContext, PhaseTransition, TransitionGuard, TransitionRecord } from './phase-manager.js';

export { LimitChecker, FDIREngine } from './limit-checker.js';
export type { LimitDef, FDIRAction } from './limit-checker.js';

export { SafetyGate } from './safety-gate.js';
export type { WhitelistedProcedure, GateState, GateResult } from './safety-gate.js';

export { Watchdog, HashChainedLog, ProcedureRunner } from './watchdog.js';
export type { DegradationLevel, LogEntry, ProcedureStep, ProcedureDef, ProcedureStatus } from './watchdog.js';

export { MemoryManager } from './memory-manager.js';
export type { MemoryRegion, MemoryModule, ResidencySet, SwapResult, SEUResult } from './memory-manager.js';
