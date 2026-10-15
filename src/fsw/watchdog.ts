/**
 * AEGIS TRANSIT — Watchdog, Hash-Chained Log, Procedure Runner (Tier 0 FSW)
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Fidelity: HIGH
 */

// ============================================================================
// WATCHDOG — AI worker heartbeat monitor
// ============================================================================

/** Degradation ladder levels */
export type DegradationLevel = 'FULL_AI' | 'TEMPLATES_ONLY' | 'R0_TREES' | 'CREW_PROCEDURES';

/**
 * Watchdog monitors AI worker heartbeat.
 * If the worker stalls, Tier 0 is unaffected. Degradation ladder steps down.
 */
export class Watchdog {
  private _lastHeartbeat: number = Date.now();
  private _timeoutMs: number;
  private _level: DegradationLevel = 'FULL_AI';
  private _workerAlive: boolean = true;
  private _checkInterval: number | null = null;

  constructor(timeoutMs: number = 5000) {
    this._timeoutMs = timeoutMs;
  }

  get level(): DegradationLevel { return this._level; }
  get workerAlive(): boolean { return this._workerAlive; }
  get lastHeartbeat(): number { return this._lastHeartbeat; }

  /** Called when heartbeat received from AI worker */
  heartbeat(): void {
    this._lastHeartbeat = Date.now();
    this._workerAlive = true;
    this._level = 'FULL_AI';
  }

  /** Check if worker is still alive */
  check(): DegradationLevel {
    const elapsed = Date.now() - this._lastHeartbeat;
    if (elapsed > this._timeoutMs * 4) {
      this._workerAlive = false;
      this._level = 'CREW_PROCEDURES';
    } else if (elapsed > this._timeoutMs * 2) {
      this._workerAlive = false;
      this._level = 'R0_TREES';
    } else if (elapsed > this._timeoutMs) {
      this._workerAlive = false;
      this._level = 'TEMPLATES_ONLY';
    } else {
      this._workerAlive = true;
      this._level = 'FULL_AI';
    }
    return this._level;
  }

  /** Start periodic checking */
  startMonitoring(onLevelChange?: (level: DegradationLevel) => void): void {
    let lastLevel = this._level;
    this._checkInterval = window.setInterval(() => {
      const newLevel = this.check();
      if (newLevel !== lastLevel) {
        lastLevel = newLevel;
        onLevelChange?.(newLevel);
      }
    }, 1000) as unknown as number;
  }

  /** Stop monitoring */
  stopMonitoring(): void {
    if (this._checkInterval !== null) {
      clearInterval(this._checkInterval);
      this._checkInterval = null;
    }
  }

  /** Simulate worker freeze for testing */
  simulateFreeze(): void {
    this._lastHeartbeat = Date.now() - this._timeoutMs * 10;
  }
}

// ============================================================================
// HASH-CHAINED EVENT LOG
// ============================================================================

/** A single log entry with hash chain */
export interface LogEntry {
  index: number;
  timestamp: number;
  eventType: string;
  data: Record<string, unknown>;
  configId: string;
  inputHash: string;
  prevHash: string;
  hash: string;
}

/**
 * Hash-chained event log using SHA-256.
 * Every event includes the previous hash, creating a tamper-evident chain.
 */
export class HashChainedLog {
  private _entries: LogEntry[] = [];
  private _prevHash: string = '0'.repeat(64); // Genesis hash

  get entries(): readonly LogEntry[] { return this._entries; }
  get length(): number { return this._entries.length; }

  /** Append an event to the log */
  async append(eventType: string, data: Record<string, unknown>, configId: string = 'default'): Promise<LogEntry> {
    const inputHash = await this._sha256(JSON.stringify(data));
    const entry: LogEntry = {
      index: this._entries.length,
      timestamp: Date.now(),
      eventType,
      data,
      configId,
      inputHash,
      prevHash: this._prevHash,
      hash: '', // computed below
    };

    // Hash = SHA-256(index + timestamp + eventType + inputHash + prevHash)
    const preimage = `${entry.index}|${entry.timestamp}|${entry.eventType}|${entry.inputHash}|${entry.prevHash}`;
    entry.hash = await this._sha256(preimage);
    this._prevHash = entry.hash;
    this._entries.push(entry);
    return entry;
  }

  /** Verify the entire chain. Returns index of first tampered entry, or -1 if clean. */
  async verify(): Promise<{ valid: boolean; tamperedIndex: number }> {
    let prevHash = '0'.repeat(64);

    for (const entry of this._entries) {
      if (entry.prevHash !== prevHash) {
        return { valid: false, tamperedIndex: entry.index };
      }

      const preimage = `${entry.index}|${entry.timestamp}|${entry.eventType}|${entry.inputHash}|${entry.prevHash}`;
      const expectedHash = await this._sha256(preimage);

      if (entry.hash !== expectedHash) {
        return { valid: false, tamperedIndex: entry.index };
      }

      prevHash = entry.hash;
    }

    return { valid: true, tamperedIndex: -1 };
  }

  /** Tamper test: corrupt an entry for demo */
  async tamperEntry(index: number): Promise<void> {
    if (index >= 0 && index < this._entries.length) {
      this._entries[index].data = { ...this._entries[index].data, TAMPERED: true };
      this._entries[index].inputHash = 'CORRUPTED';
    }
  }

  private async _sha256(input: string): Promise<string> {
    // Use WebCrypto if available, otherwise fallback
    if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
      const encoded = new TextEncoder().encode(input);
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
      return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    }
    // Fallback: simple hash for test environments
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }
}

// ============================================================================
// PROCEDURE RUNNER
// ============================================================================

/** A procedure step */
export interface ProcedureStep {
  id: string;
  description: string;
  action: string;
  params: Record<string, unknown>;
  /** Precondition check */
  precondition?: (state: Record<string, number>) => boolean;
  /** Verification check after execution */
  verification?: (state: Record<string, number>) => boolean;
  /** Rollback notes */
  rollbackNotes: string;
  /** Requires crew confirmation for this step? */
  requiresConfirm: boolean;
}

/** Procedure definition */
export interface ProcedureDef {
  id: string;
  name: string;
  description: string;
  steps: ProcedureStep[];
}

export type ProcedureStatus = 'IDLE' | 'RUNNING' | 'AWAITING_CONFIRM' | 'VERIFYING' | 'COMPLETE' | 'FAILED' | 'ABORTED';

/**
 * Procedure Runner — executes whitelisted procedures step by step.
 */
export class ProcedureRunner {
  private _currentProcedure: ProcedureDef | null = null;
  private _currentStep: number = 0;
  private _status: ProcedureStatus = 'IDLE';
  private _log: { stepId: string; status: string; timestamp: number }[] = [];

  get status(): ProcedureStatus { return this._status; }
  get currentStep(): number { return this._currentStep; }
  get currentProcedure(): ProcedureDef | null { return this._currentProcedure; }
  get stepLog(): readonly { stepId: string; status: string; timestamp: number }[] { return this._log; }

  /** Start a procedure */
  start(proc: ProcedureDef): boolean {
    if (this._status === 'RUNNING' || this._status === 'AWAITING_CONFIRM') {
      return false; // Already running
    }
    this._currentProcedure = proc;
    this._currentStep = 0;
    this._status = 'RUNNING';
    this._log = [];
    return true;
  }

  /** Advance to next step. Returns the step to execute, or null if done/blocked. */
  advance(state: Record<string, number>): { step: ProcedureStep | null; status: ProcedureStatus; reason: string } {
    if (!this._currentProcedure || this._status !== 'RUNNING') {
      return { step: null, status: this._status, reason: 'No active procedure' };
    }

    if (this._currentStep >= this._currentProcedure.steps.length) {
      this._status = 'COMPLETE';
      return { step: null, status: 'COMPLETE', reason: 'All steps completed' };
    }

    const step = this._currentProcedure.steps[this._currentStep];

    // Check precondition
    if (step.precondition && !step.precondition(state)) {
      this._status = 'FAILED';
      this._log.push({ stepId: step.id, status: 'PRECONDITION_FAILED', timestamp: Date.now() });
      return { step, status: 'FAILED', reason: `Precondition failed for step ${step.id}` };
    }

    // Check if confirmation needed
    if (step.requiresConfirm) {
      this._status = 'AWAITING_CONFIRM';
      return { step, status: 'AWAITING_CONFIRM', reason: 'Crew confirmation required' };
    }

    // Execute step
    this._log.push({ stepId: step.id, status: 'EXECUTED', timestamp: Date.now() });
    this._currentStep++;
    
    // Check if complete
    if (this._currentStep >= this._currentProcedure.steps.length) {
      this._status = 'COMPLETE';
    }

    return { step, status: this._status, reason: 'OK' };
  }

  /** Confirm a step that requires crew confirmation */
  confirm(_state: Record<string, number>): { step: ProcedureStep | null; status: ProcedureStatus; reason: string } {
    void _state;
    if (this._status !== 'AWAITING_CONFIRM' || !this._currentProcedure) {
      return { step: null, status: this._status, reason: 'No step awaiting confirmation' };
    }

    const step = this._currentProcedure.steps[this._currentStep];
    this._log.push({ stepId: step.id, status: 'CONFIRMED', timestamp: Date.now() });
    this._currentStep++;
    this._status = this._currentStep >= this._currentProcedure.steps.length ? 'COMPLETE' : 'RUNNING';
    
    return { step, status: this._status, reason: 'Confirmed' };
  }

  /** Abort current procedure */
  abort(): void {
    if (this._currentProcedure) {
      this._log.push({ stepId: `abort_at_${this._currentStep}`, status: 'ABORTED', timestamp: Date.now() });
    }
    this._status = 'ABORTED';
    this._currentProcedure = null;
    this._currentStep = 0;
  }
}
