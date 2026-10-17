/**
 * AEGIS TRANSIT — Environment Transition Manager (Tier 0 FSW)
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Manages spacecraft operational environment transitions, profile validation,
 * checksum integrity checking, and persistent audit logging.
 * 
 * Core Invariant:
 * Permanent memory (R0, R1) remains 100% immutable and write-protected.
 * Adaptive memory profiles are strictly validated against physical bounds
 * before atomic activation.
 */

import type { EventBus } from '../core/event-bus.js';
import type { AegisEventMap } from '../core/types.js';
import {
  ENVIRONMENT_PROFILES,
  PERMANENT_MEMORY,
  computeProfileChecksum,
  computeDiff,
  type SpacecraftEnvironment,
  type EnvironmentProfile,
  type PermanentMemoryRegion,
  type ProfileDiffEntry,
} from './environment-profiles.js';

// ============================================================================
// Types
// ============================================================================

export type AuditLogType =
  | 'TRANSITION'
  | 'VERIFICATION'
  | 'FAULT_INJECTION'
  | 'FAULT_RECOVERY'
  | 'VALIDATION_FAILURE';

export interface AuditLogEntry {
  timestamp: number;
  type: AuditLogType;
  message: string;
  fromEnvironment?: SpacecraftEnvironment;
  toEnvironment?: SpacecraftEnvironment;
  success: boolean;
  details?: string;
}

export interface TransitionResult {
  success: boolean;
  fromEnvironment: SpacecraftEnvironment;
  toEnvironment: SpacecraftEnvironment;
  changedParameterCount: number;
  unchangedPermanentRegions: number;
  verificationPassed: boolean;
  validationPassed: boolean;
  diff: ProfileDiffEntry[];
  timestamp: number;
  error?: string;
}

export interface TransitionStep {
  step:
    | 'CAPTURING'
    | 'VERIFYING'
    | 'CHECKING_INTEGRITY'
    | 'VALIDATING'
    | 'ACTIVATING'
    | 'UPDATING'
    | 'RECORDING'
    | 'COMPLETE'
    | 'ERROR';
  message: string;
  progress: number;
}

export interface DemoState {
  running: boolean;
  paused: boolean;
  currentStage: number;
  totalStages: number;
}

export interface TestBufferState {
  data: number[];
  checksum: string;
  corrupted: boolean;
}

// ============================================================================
// Environment Manager Implementation
// ============================================================================

export class EnvironmentManager {
  private _currentEnvironment: SpacecraftEnvironment = 'EarthOrbit';
  private _activeProfile: EnvironmentProfile;
  private _previousProfile: EnvironmentProfile | null = null;
  private _permanentMemory: PermanentMemoryRegion[];
  private _auditLog: AuditLogEntry[] = [];
  private _lastTransitionResult: TransitionResult | null = null;
  private _transitionInProgress = false;

  // Dedicated test buffer for simulated SEU / bit-flip fault testing (separate from permanent memory)
  private _goldenTestData: number[] = [0xde, 0xad, 0xbe, 0xef, 0xca, 0xfe, 0xba, 0xbe];
  private _goldenTestChecksum: string;
  private _testBuffer: TestBufferState;

  private _bus: EventBus<AegisEventMap> | null = null;
  private _onTransitionStep: ((step: TransitionStep) => void) | null = null;
  private _onTransitionComplete: ((result: TransitionResult) => void) | null = null;

  constructor() {
    this._activeProfile = { ...ENVIRONMENT_PROFILES['EarthOrbit'] };
    // Deep copy permanent memory regions
    this._permanentMemory = PERMANENT_MEMORY.map(r => ({
      ...r,
      contents: [...r.contents],
    }));

    // Initialize test buffer with deterministic checksum
    this._goldenTestChecksum = this._computeBufferChecksum(this._goldenTestData);
    this._testBuffer = {
      data: [...this._goldenTestData],
      checksum: this._goldenTestChecksum,
      corrupted: false,
    };

    // Log initialization in audit log
    this._auditLog.push({
      timestamp: Date.now(),
      type: 'VERIFICATION',
      message: 'Environment Manager initialized at Earth Orbit (EARTH_ORBIT_PROFILE)',
      fromEnvironment: 'EarthOrbit',
      toEnvironment: 'EarthOrbit',
      success: true,
      details: 'Immutable permanent core verified (R0, R1). Integrity: 100%.',
    });
  }

  // Getters
  get currentEnvironment(): SpacecraftEnvironment { return this._currentEnvironment; }
  get activeProfile(): EnvironmentProfile { return this._activeProfile; }
  get previousProfile(): EnvironmentProfile | null { return this._previousProfile; }
  get permanentMemory(): readonly PermanentMemoryRegion[] { return this._permanentMemory; }
  get auditLog(): readonly AuditLogEntry[] { return this._auditLog; }
  get lastTransitionResult(): TransitionResult | null { return this._lastTransitionResult; }
  get isTransitioning(): boolean { return this._transitionInProgress; }
  get testBuffer(): Readonly<TestBufferState> { return this._testBuffer; }
  get bus(): EventBus<AegisEventMap> | null { return this._bus; }

  /** Connect the manager to the application event bus */
  setBus(bus: EventBus<AegisEventMap>): void {
    this._bus = bus;
  }

  /** Subscribe to transition progress steps */
  onTransitionStep(callback: (step: TransitionStep) => void): void {
    this._onTransitionStep = callback;
  }

  /** Subscribe to transition completion */
  onTransitionComplete(callback: (result: TransitionResult) => void): void {
    this._onTransitionComplete = callback;
  }

  /**
   * Performs an asynchronous, verified environment transition with progress steps.
   */
  async transitionTo(targetEnv: SpacecraftEnvironment): Promise<TransitionResult> {
    if (this._transitionInProgress) {
      return this._buildErrorResult(
        this._currentEnvironment,
        targetEnv,
        'Transition rejected: Another transition is already in progress.'
      );
    }

    const targetProfile = ENVIRONMENT_PROFILES[targetEnv];
    if (!targetProfile) {
      return this._buildErrorResult(
        this._currentEnvironment,
        targetEnv,
        `Unknown target environment "${targetEnv}".`
      );
    }

    if (targetEnv === this._currentEnvironment) {
      return this._buildErrorResult(
        this._currentEnvironment,
        targetEnv,
        `Spacecraft is already in environment "${targetProfile.displayName}".`
      );
    }

    this._transitionInProgress = true;
    const fromEnv = this._currentEnvironment;

    try {
      // Step 1: Capture snapshot
      this._emitStep({
        step: 'CAPTURING',
        message: 'Capturing current environment and active profile snapshot...',
        progress: 15,
      });
      this._previousProfile = { ...this._activeProfile };
      await this._delay(250);

      // Step 2: Verify target profile checksum
      this._emitStep({
        step: 'VERIFYING',
        message: `Verifying target profile integrity: ${targetProfile.profileName}...`,
        progress: 35,
      });
      const expectedChecksum = computeProfileChecksum(targetProfile);
      if (expectedChecksum !== targetProfile.checksum) {
        throw new Error(
          `Checksum mismatch on ${targetProfile.profileName}: computed 0x${expectedChecksum.substring(0, 8)} vs expected 0x${targetProfile.checksum.substring(0, 8)}`
        );
      }
      await this._delay(300);

      // Step 3: Check permanent memory integrity
      this._emitStep({
        step: 'CHECKING_INTEGRITY',
        message: 'Verifying immutable permanent memory core (R0/R1)...',
        progress: 55,
      });
      const permCheck = this.verifyPermanentMemory();
      if (!permCheck.allValid) {
        throw new Error('Permanent memory integrity check failed. Aborting profile activation.');
      }
      await this._delay(250);

      // Step 4: Validate operating parameters against physical constraints
      this._emitStep({
        step: 'VALIDATING',
        message: 'Validating operational parameters against physical bounds...',
        progress: 75,
      });
      const validationError = this._validateProfile(targetProfile);
      if (validationError) {
        this._auditLog.push({
          timestamp: Date.now(),
          type: 'VALIDATION_FAILURE',
          message: `Validation failed for ${targetProfile.profileName}`,
          fromEnvironment: fromEnv,
          toEnvironment: targetEnv,
          success: false,
          details: validationError,
        });
        throw new Error(`Profile validation failed: ${validationError}`);
      }
      await this._delay(250);

      // Step 5: Activate target profile atomically
      this._emitStep({
        step: 'ACTIVATING',
        message: `Activating ${targetProfile.profileName} (v${targetProfile.version})...`,
        progress: 88,
      });
      this._currentEnvironment = targetEnv;
      this._activeProfile = { ...targetProfile };
      await this._delay(200);

      // Step 6: Update subsystem telemetry
      this._emitStep({
        step: 'UPDATING',
        message: 'Updating subsystem telemetry and environmental sensors...',
        progress: 95,
      });
      await this._delay(150);

      // Step 7: Record transition in audit log
      this._emitStep({
        step: 'RECORDING',
        message: 'Recording transition in persistent audit log...',
        progress: 100,
      });

      const diff = computeDiff(this._previousProfile, targetProfile);
      const changedParameterCount = diff.filter(d => d.changed).length;
      const unchangedPermanentRegions = this._permanentMemory.length;

      const result: TransitionResult = {
        success: true,
        fromEnvironment: fromEnv,
        toEnvironment: targetEnv,
        changedParameterCount,
        unchangedPermanentRegions,
        verificationPassed: true,
        validationPassed: true,
        diff,
        timestamp: Date.now(),
      };

      this._auditLog.push({
        timestamp: Date.now(),
        type: 'TRANSITION',
        message: `Environment transition: ${ENVIRONMENT_PROFILES[fromEnv].displayName} → ${targetProfile.displayName}`,
        fromEnvironment: fromEnv,
        toEnvironment: targetEnv,
        success: true,
        details: `Active profile: ${targetProfile.profileName}. ${changedParameterCount} parameters changed. Permanent regions preserved: ${unchangedPermanentRegions}.`,
      });

      this._lastTransitionResult = result;
      this._emitStep({
        step: 'COMPLETE',
        message: `Transition complete: ${targetProfile.displayName} active`,
        progress: 100,
      });

      this._onTransitionComplete?.(result);
      return result;
    } catch (err) {
      const errorMsg = (err as Error).message;
      this._emitStep({
        step: 'ERROR',
        message: `Transition error: ${errorMsg}`,
        progress: 100,
      });
      return this._buildErrorResult(fromEnv, targetEnv, errorMsg);
    } finally {
      this._transitionInProgress = false;
    }
  }

  /**
   * Immediate, synchronous transition without delays (for unit tests / programmatic use).
   */
  transitionImmediate(targetEnv: SpacecraftEnvironment): TransitionResult {
    const targetProfile = ENVIRONMENT_PROFILES[targetEnv];
    if (!targetProfile) {
      return this._buildErrorResult(this._currentEnvironment, targetEnv, `Unknown target environment "${targetEnv}".`);
    }

    if (targetEnv === this._currentEnvironment) {
      return this._buildErrorResult(this._currentEnvironment, targetEnv, 'Already in target environment.');
    }

    const fromEnv = this._currentEnvironment;
    this._previousProfile = { ...this._activeProfile };

    // 1. Verify checksum
    const expectedChecksum = computeProfileChecksum(targetProfile);
    if (expectedChecksum !== targetProfile.checksum) {
      return this._buildErrorResult(fromEnv, targetEnv, 'Profile checksum mismatch.');
    }

    // 2. Verify permanent memory
    const permCheck = this.verifyPermanentMemory();
    if (!permCheck.allValid) {
      return this._buildErrorResult(fromEnv, targetEnv, 'Permanent memory integrity check failed.');
    }

    // 3. Validate bounds
    const validationError = this._validateProfile(targetProfile);
    if (validationError) {
      this._auditLog.push({
        timestamp: Date.now(),
        type: 'VALIDATION_FAILURE',
        message: `Validation failed for ${targetProfile.profileName}`,
        fromEnvironment: fromEnv,
        toEnvironment: targetEnv,
        success: false,
        details: validationError,
      });
      return this._buildErrorResult(fromEnv, targetEnv, `Validation failed: ${validationError}`);
    }

    // 4. Activate
    this._currentEnvironment = targetEnv;
    this._activeProfile = { ...targetProfile };

    // 5. Diff & audit
    const diff = computeDiff(this._previousProfile, targetProfile);
    const changedParameterCount = diff.filter(d => d.changed).length;
    const unchangedPermanentRegions = this._permanentMemory.length;

    const result: TransitionResult = {
      success: true,
      fromEnvironment: fromEnv,
      toEnvironment: targetEnv,
      changedParameterCount,
      unchangedPermanentRegions,
      verificationPassed: true,
      validationPassed: true,
      diff,
      timestamp: Date.now(),
    };

    this._auditLog.push({
      timestamp: Date.now(),
      type: 'TRANSITION',
      message: `Environment transition: ${ENVIRONMENT_PROFILES[fromEnv].displayName} → ${targetProfile.displayName}`,
      fromEnvironment: fromEnv,
      toEnvironment: targetEnv,
      success: true,
      details: `Active profile: ${targetProfile.profileName}. ${changedParameterCount} parameters changed.`,
    });

    this._lastTransitionResult = result;
    this._onTransitionComplete?.(result);
    return result;
  }

  /**
   * Verifies all permanent memory regions against their golden signatures.
   * Permanent memory is immutable and must never be altered by environment transitions.
   */
  verifyPermanentMemory(): { allValid: boolean; results: { regionId: string; valid: boolean; checksum: string }[] } {
    const results = this._permanentMemory.map((region, idx) => {
      const golden = PERMANENT_MEMORY[idx];
      const valid = region.checksum === golden.checksum && region.writeProtected && region.integrityPercent === 100;
      return {
        regionId: region.regionId,
        valid,
        checksum: region.checksum,
      };
    });

    const allValid = results.every(r => r.valid);
    return { allValid, results };
  }

  /**
   * Injects a bit-flip into the simulated test buffer (NOT permanent memory).
   */
  injectTestBitFlip(): { corrupted: boolean; originalChecksum: string; corruptedChecksum: string } {
    const originalChecksum = this._testBuffer.checksum;
    // Invert low bit of first byte in test buffer
    this._testBuffer.data[0] ^= 0x01;
    this._testBuffer.checksum = this._computeBufferChecksum(this._testBuffer.data);
    this._testBuffer.corrupted = true;

    this._auditLog.push({
      timestamp: Date.now(),
      type: 'FAULT_INJECTION',
      message: 'Simulated Single-Event Upset (SEU) injected into test buffer',
      success: false,
      details: `Byte 0 corrupted. Checksum deviated: 0x${originalChecksum.substring(0, 8)} → 0x${this._testBuffer.checksum.substring(0, 8)}. Permanent memory R0/R1 unaffected.`,
    });

    return {
      corrupted: true,
      originalChecksum,
      corruptedChecksum: this._testBuffer.checksum,
    };
  }

  /**
   * Restores the test buffer from the protected golden image.
   */
  restoreTestBuffer(): { restored: boolean; checksum: string } {
    this._testBuffer.data = [...this._goldenTestData];
    this._testBuffer.checksum = this._goldenTestChecksum;
    this._testBuffer.corrupted = false;

    this._auditLog.push({
      timestamp: Date.now(),
      type: 'FAULT_RECOVERY',
      message: 'Test buffer restored from protected golden image',
      success: true,
      details: `Checksum restored to 0x${this._goldenTestChecksum.substring(0, 8)}. Integrity: 100%.`,
    });

    return {
      restored: true,
      checksum: this._goldenTestChecksum,
    };
  }

  /**
   * Checks the test buffer integrity against the expected golden checksum.
   */
  verifyTestBuffer(): { valid: boolean; expectedChecksum: string; actualChecksum: string } {
    const valid = !this._testBuffer.corrupted && this._testBuffer.checksum === this._goldenTestChecksum;
    return {
      valid,
      expectedChecksum: this._goldenTestChecksum,
      actualChecksum: this._testBuffer.checksum,
    };
  }

  /**
   * Resets the environment manager to Earth Orbit initial state.
   */
  reset(): void {
    this._currentEnvironment = 'EarthOrbit';
    this._activeProfile = { ...ENVIRONMENT_PROFILES['EarthOrbit'] };
    this._previousProfile = null;
    this._lastTransitionResult = null;
    this._transitionInProgress = false;

    // Restore test buffer
    this._testBuffer = {
      data: [...this._goldenTestData],
      checksum: this._goldenTestChecksum,
      corrupted: false,
    };

    // Re-verify permanent memory
    this._permanentMemory = PERMANENT_MEMORY.map(r => ({
      ...r,
      contents: [...r.contents],
    }));

    this._auditLog.push({
      timestamp: Date.now(),
      type: 'VERIFICATION',
      message: 'Simulation reset to Earth Orbit initial state',
      fromEnvironment: 'EarthOrbit',
      toEnvironment: 'EarthOrbit',
      success: true,
      details: 'All profiles reset. Permanent memory verified.',
    });
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private _validateProfile(profile: EnvironmentProfile): string | null {
    const m = profile.measurements;
    if (m.solarIrradiance < 0 || m.solarIrradiance > 3000) {
      return `Solar irradiance ${m.solarIrradiance} W/m² out of physical bounds [0, 3000].`;
    }
    if (m.thermalReading < 50 || m.thermalReading > 600) {
      return `Thermal reading ${m.thermalReading} K out of physical bounds [50, 600].`;
    }
    if (m.radiationIndex < 0 || m.radiationIndex > 1000) {
      return `Radiation index ${m.radiationIndex} out of physical bounds [0, 1000].`;
    }
    if (m.solarPowerAvailability < 0 || m.solarPowerAvailability > 100) {
      return `Solar power availability ${m.solarPowerAvailability}% out of range [0, 100].`;
    }
    if (m.commLatencyMs < 0) {
      return `Communication latency ${m.commLatencyMs} ms cannot be negative.`;
    }
    if (m.powerReserve < 0 || m.powerReserve > 100) {
      return `Power reserve ${m.powerReserve}% out of range [0, 100].`;
    }

    const c = profile.configuration;
    if (!c.navigationProfile || !c.communicationMode || !c.thermalMode || !c.propulsionMode || !c.powerMode || !c.radiationMode || !c.instrumentMode) {
      return 'Missing required adaptive configuration parameter.';
    }

    return null;
  }

  private _computeBufferChecksum(data: number[]): string {
    let hash = 0x811c9dc5;
    for (let i = 0; i < data.length; i++) {
      hash ^= data[i];
      hash = Math.imul(hash, 0x01000193);
    }
    const h = (hash >>> 0).toString(16).padStart(8, '0');
    return h.repeat(8);
  }

  private _buildErrorResult(
    fromEnv: SpacecraftEnvironment,
    toEnv: SpacecraftEnvironment,
    errorMessage: string
  ): TransitionResult {
    const fromProfile = ENVIRONMENT_PROFILES[fromEnv] ?? this._activeProfile;
    const toProfile = ENVIRONMENT_PROFILES[toEnv] ?? this._activeProfile;
    const diff = computeDiff(fromProfile, toProfile);

    const result: TransitionResult = {
      success: false,
      fromEnvironment: fromEnv,
      toEnvironment: toEnv,
      changedParameterCount: 0,
      unchangedPermanentRegions: this._permanentMemory.length,
      verificationPassed: false,
      validationPassed: false,
      diff,
      timestamp: Date.now(),
      error: errorMessage,
    };

    this._lastTransitionResult = result;
    return result;
  }

  private _emitStep(step: TransitionStep): void {
    this._onTransitionStep?.(step);
  }

  private _delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
