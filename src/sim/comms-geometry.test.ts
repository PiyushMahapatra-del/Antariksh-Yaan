/**
 * AEGIS TRANSIT — Communication Geometry Tests
 * SIMULATION: NOT FLIGHT SOFTWARE
 */
import { describe, it, expect } from 'vitest';
import {
  lightTimeAU,
  commDistance,
  sunEarthShipAngle,
  isInBlackout,
  linkRate,
  packetLossProbability,
} from '@sim/comms-geometry';
import { LIGHT_TIME_1AU_S, DOWNLINK_RATE_1AU } from '@sim/constants';

describe('Light-time calculations', () => {
  it('light-time at 1 AU ≈ 499 seconds', () => {
    const lt = lightTimeAU(1.0);
    expect(lt).toBeCloseTo(LIGHT_TIME_1AU_S, 0);
    expect(lt).toBeCloseTo(499, 0);
  });

  it('light-time at 2.5 AU ≈ 1247.5 seconds', () => {
    const lt = lightTimeAU(2.5);
    expect(lt).toBeCloseTo(2.5 * LIGHT_TIME_1AU_S, 0);
    expect(lt).toBeCloseTo(1247.5, 0);
  });

  it('light-time at 0 AU is 0', () => {
    expect(lightTimeAU(0)).toBe(0);
  });
});

describe('Communication distance', () => {
  it('distance between same point is 0', () => {
    expect(commDistance([1, 0], [1, 0])).toBeCloseTo(0, 10);
  });

  it('distance between Earth at [1,0] and ship at [2,0] is 1 AU', () => {
    expect(commDistance([2, 0], [1, 0])).toBeCloseTo(1, 10);
  });

  it('distance is symmetric', () => {
    const d1 = commDistance([1, 0.5], [2, 1]);
    const d2 = commDistance([2, 1], [1, 0.5]);
    expect(d1).toBeCloseTo(d2, 10);
  });
});

describe('Sun-Earth-Ship angle (theta)', () => {
  it('ship behind the Sun from Earth → theta near 0 (blackout)', () => {
    // Earth at [1, 0], ship at [-1, 0] (on far side of Sun)
    // Sun at origin. Vector Earth→Sun = [-1, 0], vector Earth→ship = [-2, 0]
    // These are parallel → theta ≈ 0
    const theta = sunEarthShipAngle([-1, 0], [1, 0]);
    expect(theta).toBeLessThan(5); // near 0
  });

  it('ship on same side as Earth → theta near 180', () => {
    // Earth at [1, 0], ship at [2, 0]
    // Vector Earth→Sun = [-1, 0], vector Earth→ship = [1, 0]
    // These are anti-parallel → theta ≈ 180
    const theta = sunEarthShipAngle([2, 0], [1, 0]);
    expect(theta).toBeCloseTo(180, 0);
  });

  it('ship at 90 degrees from Earth-Sun line', () => {
    // Earth at [1, 0], ship at [0, 1]
    // Vector Earth→Sun = [-1, 0], vector Earth→ship = [-1, 1]
    // angle = atan2 geometry
    const theta = sunEarthShipAngle([0, 1], [1, 0]);
    expect(theta).toBeGreaterThan(30);
    expect(theta).toBeLessThan(90);
  });
});

describe('Blackout detection', () => {
  it('theta = 1 deg → blackout (below 2 deg threshold)', () => {
    expect(isInBlackout(1)).toBe(true);
  });

  it('theta = 2 deg → blackout (at threshold)', () => {
    expect(isInBlackout(2)).toBe(true);
  });

  it('theta = 3 deg → NOT blackout', () => {
    expect(isInBlackout(3)).toBe(false);
  });

  it('custom threshold: theta = 4 deg, threshold = 5 → blackout', () => {
    expect(isInBlackout(4, 5)).toBe(true);
  });
});

describe('Link rate scaling', () => {
  it('rate at 1 AU equals base rate', () => {
    expect(linkRate(1, DOWNLINK_RATE_1AU)).toBeCloseTo(DOWNLINK_RATE_1AU, 0);
  });

  it('rate at 2 AU is 1/4 of base rate', () => {
    expect(linkRate(2, DOWNLINK_RATE_1AU)).toBeCloseTo(DOWNLINK_RATE_1AU / 4, 0);
  });

  it('rate at 0.5 AU is 4x base rate', () => {
    expect(linkRate(0.5, DOWNLINK_RATE_1AU)).toBeCloseTo(DOWNLINK_RATE_1AU * 4, 0);
  });

  it('rate at 0 AU returns 0 (edge case)', () => {
    expect(linkRate(0, DOWNLINK_RATE_1AU)).toBe(0);
  });
});

describe('Packet loss probability', () => {
  it('loss is 1.0 within blackout', () => {
    expect(packetLossProbability(1)).toBe(1.0);
  });

  it('loss is 0.0 far from Sun', () => {
    expect(packetLossProbability(90)).toBe(0.0);
  });

  it('loss decreases as theta increases from threshold', () => {
    const loss3 = packetLossProbability(3);
    const loss5 = packetLossProbability(5);
    expect(loss3).toBeGreaterThan(loss5);
  });

  it('loss is between 0 and 1 near threshold', () => {
    const loss = packetLossProbability(4);
    expect(loss).toBeGreaterThanOrEqual(0);
    expect(loss).toBeLessThanOrEqual(1);
  });
});
