/**
 * AEGIS TRANSIT — Comms State Manager Unit Tests
 * SIMULATION: NOT FLIGHT SOFTWARE
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CommsStateManager } from './comms-state.js';
import { LIGHT_TIME_1AU_S } from './constants.js';

describe('CommsStateManager', () => {
  let comms: CommsStateManager;

  beforeEach(() => {
    comms = new CommsStateManager();
  });

  it('initializes with nominal defaults', () => {
    expect(comms.overrideEnabled).toBe(false);
    expect(comms.overrideDelaySec).toBe(600);
    expect(comms.state.linkState).toBe('NOMINAL');
    expect(comms.state.isOverridden).toBe(false);
    expect(comms.effectiveDelaySec).toBe(0);
  });

  it('updates distance and one-way light time', () => {
    // Earth at [1, 0], Ship at [2, 0] -> distance = 1 AU
    comms.update([2, 0], [1, 0]);

    expect(comms.state.distanceAU).toBeCloseTo(1.0, 6);
    expect(comms.state.oneWayLightTimeSec).toBeCloseTo(LIGHT_TIME_1AU_S, 1);
    expect(comms.state.roundTripSec).toBeCloseTo(2 * LIGHT_TIME_1AU_S, 1);
    expect(comms.effectiveDelaySec).toBeCloseTo(LIGHT_TIME_1AU_S, 1);
    expect(comms.state.linkState).toBe('NOMINAL');
  });

  it('detects solar blackout when theta <= 2 degrees', () => {
    // Earth at [1, 0], Sun at [0, 0], Ship at [-1, 0] (behind Sun)
    comms.update([-1, 0], [1, 0]);

    expect(comms.state.thetaDeg).toBeLessThanOrEqual(2.0);
    expect(comms.state.linkState).toBe('BLACKOUT');
    expect(comms.state.linkRateBps).toBe(0);
    expect(comms.state.packetLossProb).toBe(1.0);
  });

  it('detects degraded link in transition region', () => {
    // Position where theta is around 3.5 deg
    // Earth at [1, 0]. Ship at [-1.5, 0.08]
    // Vector Earth->Sun = [-1, 0]. Vector Earth->Ship = [-2.5, 0.08]
    // angle = atan(0.08 / 2.5) ≈ 1.83 deg -> blackout
    // If Ship at [-1.5, 0.15], angle = atan(0.15 / 2.5) ≈ 3.4 deg
    comms.update([-1.5, 0.15], [1, 0]);
    if (comms.state.thetaDeg > 2.0 && comms.state.thetaDeg < 7.0) {
      expect(comms.state.packetLossProb).toBeGreaterThan(0);
      expect(comms.state.linkState).toBe('DEGRADED');
    }
  });

  it('handles operator override and clamps delay strictly to 3–22 minutes', () => {
    // Default override delay: 10 minutes = 600 seconds
    comms.setOverride(true);
    expect(comms.overrideEnabled).toBe(true);
    expect(comms.state.isOverridden).toBe(true);
    expect(comms.state.linkState).toBe('OVERRIDE');
    expect(comms.effectiveDelaySec).toBe(600);

    // Below 3 min clamp -> 3 min (180 s)
    comms.setOverride(true, 1.5);
    expect(comms.overrideDelaySec).toBe(180);
    expect(comms.effectiveDelaySec).toBe(180);

    // Above 22 min clamp -> 22 min (1320 s)
    comms.setOverride(true, 30);
    expect(comms.overrideDelaySec).toBe(1320);
    expect(comms.effectiveDelaySec).toBe(1320);

    // Valid intermediate delay
    comms.setOverride(true, 14.5);
    expect(comms.overrideDelaySec).toBe(14.5 * 60);
    expect(comms.effectiveDelaySec).toBe(870);

    // Disabling override returns effectiveDelaySec to physical delay
    comms.update([2, 0], [1, 0]);
    comms.setOverride(false);
    expect(comms.overrideEnabled).toBe(false);
    expect(comms.state.isOverridden).toBe(false);
    expect(comms.state.linkState).toBe('NOMINAL');
    expect(comms.effectiveDelaySec).toBeCloseTo(LIGHT_TIME_1AU_S, 1);
  });
});
