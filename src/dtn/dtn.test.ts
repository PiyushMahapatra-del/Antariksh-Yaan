/**
 * AEGIS TRANSIT — DTN Unit & Integration Tests
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createBundle,
  resetSequenceCounter,
  BundleVerifier,
  PrioritySpool,
  segmentBundle,
  CfdpReassembler,
  DeepSpaceLinkModel,
  GroundSegment,
} from './index.js';

describe('DTN Bundle Protocol & Cryptographic Integrity', () => {
  beforeEach(() => {
    resetSequenceCounter(100);
  });

  it('creates valid bundle with SHA-256 hash and metadata', async () => {
    const payload = { temp: 295.4, status: 'NOMINAL', loop: 'A' };
    const bundle = await createBundle('ship', 'earth', 1, 'telemetry', payload, 1000);

    expect(bundle.header.id).toContain('bndl-S-');
    expect(bundle.header.source).toBe('ship');
    expect(bundle.header.destination).toBe('earth');
    expect(bundle.header.priority).toBe(1);
    expect(bundle.header.sequenceNumber).toBe(101);
    expect(bundle.header.payloadHash).toBeDefined();
    expect(bundle.header.payloadHash.length).toBe(64);
  });

  it('detects payload tampering via SHA-256 mismatch', async () => {
    const verifier = new BundleVerifier();
    const payload = { safe: true, speed: 100 };
    const bundle = await createBundle('ship', 'earth', 0, 'fdir_alert', payload, 1000);

    // Initial verify should pass
    const v1 = await verifier.verifyBundle(bundle, 1005);
    expect(v1.valid).toBe(true);

    // Create a new bundle with tampered payload
    const bundle2 = await createBundle('ship', 'earth', 0, 'fdir_alert', { safe: true }, 1010);
    bundle2.payload = { safe: false, speed: 999 }; // Tamper!

    const v2 = await verifier.verifyBundle(bundle2, 1015);
    expect(v2.valid).toBe(false);
    expect(v2.code).toBe('HASH_MISMATCH');
  });

  it('enforces anti-rollback monotonic sequence counter', async () => {
    const verifier = new BundleVerifier();
    const b1 = await createBundle('ship', 'earth', 1, 'telemetry', { val: 1 }, 1000);
    const b2 = await createBundle('ship', 'earth', 1, 'telemetry', { val: 2 }, 1010);

    const v1 = await verifier.verifyBundle(b1, 1005);
    expect(v1.valid).toBe(true);

    const v2 = await verifier.verifyBundle(b2, 1015);
    expect(v2.valid).toBe(true);

    // Replay attack: try sending b1 again (older sequence)
    const vReplay = await verifier.verifyBundle(b1, 1020);
    expect(vReplay.valid).toBe(false);
    expect(vReplay.code).toBe('ROLLBACK_DETECTED');
  });
});

describe('DTN Priority Spool', () => {
  let spool: PrioritySpool;

  beforeEach(() => {
    spool = new PrioritySpool({ maxBundles: 4, maxSizeBytes: 100000 });
  });

  it('dequeues in strict priority order (P0 > P1 > P2 > P3)', async () => {
    const bP3 = await createBundle('ship', 'earth', 3, 'bulk', { msg: 'bulk 1' }, 100);
    const bP1 = await createBundle('ship', 'earth', 1, 'telemetry', { msg: 'telem 1' }, 101);
    const bP0 = await createBundle('ship', 'earth', 0, 'fdir', { msg: 'alarm 1' }, 102);
    const bP2 = await createBundle('ship', 'earth', 2, 'science', { msg: 'science 1' }, 103);

    // Enqueue in arbitrary order
    spool.enqueue(bP3, 110);
    spool.enqueue(bP1, 110);
    spool.enqueue(bP0, 110);
    spool.enqueue(bP2, 110);

    expect(spool.getTotalCount()).toBe(4);

    // Dequeue should yield P0, then P1, then P2, then P3
    const d0 = spool.dequeue();
    expect(d0?.header.priority).toBe(0);

    const d1 = spool.dequeue();
    expect(d1?.header.priority).toBe(1);

    const d2 = spool.dequeue();
    expect(d2?.header.priority).toBe(2);

    const d3 = spool.dequeue();
    expect(d3?.header.priority).toBe(3);

    expect(spool.dequeue()).toBeNull();
  });

  it('preempts lower-priority bundles when capacity is reached', async () => {
    // Capacity is 4
    const b1 = await createBundle('ship', 'earth', 3, 'bulk', { id: 1 }, 100);
    const b2 = await createBundle('ship', 'earth', 3, 'bulk', { id: 2 }, 101);
    const b3 = await createBundle('ship', 'earth', 3, 'bulk', { id: 3 }, 102);
    const b4 = await createBundle('ship', 'earth', 3, 'bulk', { id: 4 }, 103);

    spool.enqueue(b1, 105);
    spool.enqueue(b2, 105);
    spool.enqueue(b3, 105);
    spool.enqueue(b4, 105);
    expect(spool.getTotalCount()).toBe(4);

    // Incoming high priority P0 bundle must preempt a P3 bundle
    const bCritical = await createBundle('ship', 'earth', 0, 'fdir', { id: 'emergency' }, 106);
    const enqueued = spool.enqueue(bCritical, 106);
    expect(enqueued).toBe(true);

    // Spool count stays at capacity (4)
    expect(spool.getTotalCount()).toBe(4);
    const stats = spool.getStats();
    expect(stats.p0Count).toBe(1);
    expect(stats.p3Count).toBe(3);
    expect(stats.droppedCount).toBe(1);
  });

  it('prunes expired bundles according to TTL', async () => {
    const freshBundle = await createBundle('ship', 'earth', 1, 'telemetry', { fresh: true }, 100, 1000);
    const shortTtlBundle = await createBundle('ship', 'earth', 1, 'telemetry', { short: true }, 100, 50);

    spool.enqueue(freshBundle, 100);
    spool.enqueue(shortTtlBundle, 100);

    // At time 120, shortTtlBundle is still valid (100 + 50 = 150)
    expect(spool.pruneExpired(120)).toBe(0);

    // At time 160, shortTtlBundle is expired
    expect(spool.pruneExpired(160)).toBe(1);
    expect(spool.getTotalCount()).toBe(1);
  });
});

describe('CFDP-Lite Segmentation & Reassembly', () => {
  it('segments large bundle and reassembles correctly', async () => {
    // Create bundle with payload > 2KB
    const largePayload = {
      imageTitle: 'Mars Approach Survey',
      dataPoints: Array.from({ length: 150 }, (_, i) => ({ index: i, val: Math.sin(i) * 100, label: `point-${i}` })),
    };

    const bundle = await createBundle('ship', 'earth', 2, 'science', largePayload, 1000);
    const chunks = await segmentBundle(bundle, 512); // Use 512 byte chunk size for test

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].chunkIndex).toBe(0);
    expect(chunks[chunks.length - 1].isLast).toBe(true);

    const reassembler = new CfdpReassembler();

    // Ingest all chunks except last
    for (let i = 0; i < chunks.length - 1; i++) {
      const res = await reassembler.ingestChunk(chunks[i]);
      expect(res.completed).toBe(false);
    }

    // Check NAK detects the missing last chunk
    const nak = reassembler.generateNak(bundle.header.id);
    expect(nak).not.toBeNull();
    expect(nak!.missingChunkIndices).toEqual([chunks.length - 1]);

    // Ingest final chunk
    const finalRes = await reassembler.ingestChunk(chunks[chunks.length - 1]);
    expect(finalRes.completed).toBe(true);
    expect(finalRes.bundle).toBeDefined();
    expect(finalRes.bundle?.header.id).toBe(bundle.header.id);
    expect(finalRes.bundle?.payload.imageTitle).toBe('Mars Approach Survey');
  });
});

describe('Deep Space Link Model & Propagation Pipeline', () => {
  let link: DeepSpaceLinkModel;

  beforeEach(() => {
    link = new DeepSpaceLinkModel();
  });

  it('computes realistic light-time delay and inverse square rate', () => {
    // 1 AU distance, safe angle 30 degrees
    const state1Au = link.computeLinkState(1.0, 30.0, 0);
    expect(state1Au.oneWayLightTimeSec).toBeCloseTo(499.005, 1);
    expect(state1Au.roundTripLightTimeSec).toBeCloseTo(998.01, 1);
    expect(state1Au.downlinkRateKbps).toBeCloseTo(500, 0);
    expect(state1Au.status).toBe('NOMINAL');

    // 2 AU distance
    const state2Au = link.computeLinkState(2.0, 30.0, 0);
    expect(state2Au.oneWayLightTimeSec).toBeCloseTo(499.005 * 2, 1);
    // Rate drops by 1/4 (1/d^2)
    expect(state2Au.downlinkRateKbps).toBeCloseTo(125, 0);
  });

  it('detects solar conjunction blackout when theta < 2.0 degrees', () => {
    const blackoutState = link.computeLinkState(1.5, 1.8, 0);
    expect(blackoutState.status).toBe('BLACKOUT');
    expect(blackoutState.downlinkRateKbps).toBe(0);
    expect(blackoutState.lossProbability).toBe(1.0);
  });

  it('supports scenario latency override (SIM-05)', () => {
    link.setLatencyOverride(true, 12); // Force 12 minutes
    expect(link.isOverrideActive()).toBe(true);

    const state = link.computeLinkState(0.5, 45.0, 0);
    expect(state.status).toBe('OVERRIDE');
    expect(state.oneWayLightTimeSec).toBe(12 * 60);
    expect(state.roundTripLightTimeSec).toBe(24 * 60);
  });

  it('delivers bundles after light-time propagation delay', async () => {
    link.setLatencyOverride(true, 5); // 5 min = 300 seconds delay
    const state = link.computeLinkState(1.0, 20.0, 1000);

    const bundle = await createBundle('ship', 'earth', 1, 'telemetry', { p: 1 }, 1000);
    const sent = link.transmit(bundle, 1000, state);
    expect(sent).toBe(true);
    expect(link.getInFlightBundles().length).toBe(1);

    // At 1100s (only 100s passed), bundle still propagating
    const step1 = link.step(1100);
    expect(step1.delivered.length).toBe(0);
    expect(link.getInFlightBundles().length).toBe(1);

    // At 1300s (300s passed), bundle arrived!
    const step2 = link.step(1300);
    expect(step2.delivered.length).toBe(1);
    expect(step2.delivered[0].header.id).toBe(bundle.header.id);
    expect(link.getInFlightBundles().length).toBe(0);
  });
});

describe('Earth Ground Segment', () => {
  it('receives telemetry and tracks telemetry age', async () => {
    const ground = new GroundSegment();
    const bundle = await createBundle('ship', 'earth', 1, 'telemetry', { cabinO2: 21.2 }, 1000);

    // Ground receives bundle at sim time 1900 (900 seconds = 15 minutes after transmission)
    await ground.receiveDownlinkBundle(bundle, 1900);

    const ageString = ground.getTelemetryAgeString(1900);
    expect(ageString).toContain('DATA IS 15.0 MIN OLD');
  });

  it('creates uplink command bundles for ship execution', async () => {
    const ground = new GroundSegment();
    const cmdBundle = await ground.createUplinkCommand('proc_loop_failover', { arm: true }, 2000, 0);

    expect(cmdBundle.header.source).toBe('earth');
    expect(cmdBundle.header.destination).toBe('ship');
    expect(cmdBundle.header.priority).toBe(0);

    const dequeued = ground.dequeueUplink();
    expect(dequeued?.header.id).toBe(cmdBundle.header.id);
  });
});
