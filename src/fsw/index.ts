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

export { EnvironmentManager } from './environment-manager.js';
export type { AuditLogEntry, TransitionResult, TransitionStep, DemoState } from './environment-manager.js';

export { ENVIRONMENT_PROFILES, PERMANENT_MEMORY, computeProfileChecksum, computeDiff, getAllEnvironments, getEnvironmentDisplayName } from './environment-profiles.js';
export type { SpacecraftEnvironment, EnvironmentProfile, EnvironmentMeasurements, AdaptiveConfiguration, PermanentMemoryRegion } from './environment-profiles.js';
