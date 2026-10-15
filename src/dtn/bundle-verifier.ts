/**
 * AEGIS TRANSIT — DTN Bundle Verifier & Anti-Rollback Guard
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Verifies cryptographic integrity, anti-replay / anti-rollback sequence enforcement,
 * and rejection logging.
 * 
 * Fidelity: HIGH (Cryptographic checksum + sequence monotonic verification)
 */

import { computeSha256, type Bundle } from './bundle.js';

export interface VerificationResult {
  valid: boolean;
  code: 'OK' | 'HASH_MISMATCH' | 'EXPIRED' | 'ROLLBACK_DETECTED' | 'INVALID_SOURCE' | 'CORRUPT_HEADER';
  reason?: string;
  bundleId: string;
  sequenceNumber: number;
}

export class BundleVerifier {
  /** Tracks highest received sequence number per source to prevent replay and rollback attacks */
  private lastKnownSequence: Map<string, number> = new Map();
  private auditLog: VerificationResult[] = [];

  constructor() {
    this.lastKnownSequence.set('ship', 0);
    this.lastKnownSequence.set('earth', 0);
  }

  /**
   * Resets the sequence tracking (for simulation re-arm or tests)
   */
  reset(): void {
    this.lastKnownSequence.clear();
    this.lastKnownSequence.set('ship', 0);
    this.lastKnownSequence.set('earth', 0);
    this.auditLog = [];
  }

  /**
   * Gets the highest received sequence number for a sender.
   */
  getLastSequence(source: string): number {
    return this.lastKnownSequence.get(source) ?? 0;
  }

  /**
   * Validates bundle against:
   * 1. Header integrity
   * 2. Expiration (TTL)
   * 3. Monotonic sequence counter (anti-rollback / anti-replay)
   * 4. SHA-256 payload checksum verification
   */
  async verifyBundle(bundle: Bundle, currentSimTime: number): Promise<VerificationResult> {
    const { header, payload } = bundle;

    // 1. Header sanity
    if (!header || !header.id || typeof header.sequenceNumber !== 'number') {
      const res: VerificationResult = {
        valid: false,
        code: 'CORRUPT_HEADER',
        reason: 'Malformed bundle header or missing sequence counter',
        bundleId: header?.id ?? 'UNKNOWN',
        sequenceNumber: header?.sequenceNumber ?? -1,
      };
      this.auditLog.push(res);
      return res;
    }

    // 2. TTL Expiry
    if (currentSimTime > header.creationSimTime + header.ttl) {
      const res: VerificationResult = {
        valid: false,
        code: 'EXPIRED',
        reason: `Bundle TTL exceeded by ${(currentSimTime - (header.creationSimTime + header.ttl)).toFixed(1)}s`,
        bundleId: header.id,
        sequenceNumber: header.sequenceNumber,
      };
      this.auditLog.push(res);
      return res;
    }

    // 3. Anti-Rollback / Anti-Replay Guard
    const lastSeq = this.lastKnownSequence.get(header.source) ?? 0;
    if (header.sequenceNumber <= lastSeq) {
      const res: VerificationResult = {
        valid: false,
        code: 'ROLLBACK_DETECTED',
        reason: `Anti-rollback violation: received sequence #${header.sequenceNumber} <= last known #${lastSeq} from ${header.source}`,
        bundleId: header.id,
        sequenceNumber: header.sequenceNumber,
      };
      this.auditLog.push(res);
      return res;
    }

    // 4. Cryptographic SHA-256 Hash Verification
    const computedHash = await computeSha256(JSON.stringify(payload));
    if (computedHash !== header.payloadHash) {
      const res: VerificationResult = {
        valid: false,
        code: 'HASH_MISMATCH',
        reason: `Cryptographic SHA-256 checksum failure. Expected ${header.payloadHash.slice(0, 8)}..., got ${computedHash.slice(0, 8)}...`,
        bundleId: header.id,
        sequenceNumber: header.sequenceNumber,
      };
      this.auditLog.push(res);
      return res;
    }

    // Passed all checks! Update monotonic sequence
    this.lastKnownSequence.set(header.source, header.sequenceNumber);

    const successResult: VerificationResult = {
      valid: true,
      code: 'OK',
      bundleId: header.id,
      sequenceNumber: header.sequenceNumber,
    };
    this.auditLog.push(successResult);
    return successResult;
  }

  /** Retrieve verification audit log */
  getAuditLog(): VerificationResult[] {
    return [...this.auditLog];
  }
}
