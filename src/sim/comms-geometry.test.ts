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
  linkBudget,
  formatLinkRate,
} from '@sim/comms-geometry';
import { LIGHT_TIME_1AU_S, DOWNLINK_RATE_1AU, UPLINK_RATE_1AU } from '@sim/constants';

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

describe('Unified LinkBudget & Rate Scaling', () => {
  it('no NaN or Infinity anywhere across wide distance and angle sweep', () => {
    const testDistances = [0, 0.0000017, 0.01, 0.5, 1.0, 1.5, 2.0, 3.0, 5.0, 10.0, -1, NaN, Infinity];
    const testAngles = [0, 1.0, 2.0, 2.5, 3.5, 5.0, 30.0, 90.0, 180.0, -5, NaN, Infinity];

    for (const d of testDistances) {
      for (const th of testAngles) {
        const budget = linkBudget(d, th);
        expect(Number.isNaN(budget.downlinkBps)).toBe(false);
        expect(Number.isFinite(budget.downlinkBps)).toBe(true);
        expect(Number.isNaN(budget.uplinkBps)).toBe(false);
        expect(Number.isFinite(budget.uplinkBps)).toBe(true);
        expect(budget.downlinkBps).toBeGreaterThanOrEqual(0);
        expect(budget.uplinkBps).toBeGreaterThanOrEqual(0);

        const fmtDl = formatLinkRate(budget.downlinkBps);
        const fmtUl = formatLinkRate(budget.uplinkBps);
        expect(fmtDl).not.toContain('NaN');
        expect(fmtDl).not.toContain('Infinity');
        expect(fmtUl).not.toContain('NaN');
        expect(fmtUl).not.toContain('Infinity');
      }
    }
  });

  it('rate is monotonically non-increasing with distance', () => {
    let prevRate = Infinity;
    // Step distance from 0.1 AU up to 6.0 AU with theta = 180 (nominal)
    for (let d = 0.1; d <= 6.0; d += 0.1) {
      const budget = linkBudget(d, 180);
      expect(budget.downlinkBps).toBeLessThanOrEqual(prevRate + 1e-6);
      prevRate = budget.downlinkBps;
    }
  });

  it('equals the cap at d <= 1 AU', () => {
    const at0 = linkBudget(0.0000017, 180);
    expect(at0.downlinkBps).toBe(DOWNLINK_RATE_1AU);
    expect(at0.uplinkBps).toBe(UPLINK_RATE_1AU);

    const atHalf = linkBudget(0.5, 180);
    expect(atHalf.downlinkBps).toBe(DOWNLINK_RATE_1AU);
    expect(atHalf.uplinkBps).toBe(UPLINK_RATE_1AU);

    const atOne = linkBudget(1.0, 180);
    expect(atOne.downlinkBps).toBe(DOWNLINK_RATE_1AU);
    expect(atOne.uplinkBps).toBe(UPLINK_RATE_1AU);
  });

  it('at 3 AU it is about 1/9 of the 1 AU rate', () => {
    const atOne = linkBudget(1.0, 180);
    const atThree = linkBudget(3.0, 180);

    const expectedDl = atOne.downlinkBps / 9;
    const expectedUl = atOne.uplinkBps / 9;

    expect(atThree.downlinkBps).toBeCloseTo(expectedDl, 1);
    expect(atThree.uplinkBps).toBeCloseTo(expectedUl, 1);
  });

  it('formats with adaptive units (bps, kbps, Mbps) and at most 4 significant digits', () => {
    expect(formatLinkRate(0)).toBe('0 bps');
    expect(formatLinkRate(500)).toBe('500 bps');
    expect(formatLinkRate(1200)).toBe('1.2 kbps');
    expect(formatLinkRate(55555.55)).toBe('55.56 kbps');
    expect(formatLinkRate(500000)).toBe('500 kbps');
    expect(formatLinkRate(1500000)).toBe('1.5 Mbps');
    expect(formatLinkRate(12345678)).toBe('12.35 Mbps');
  });

  it('verifies linkRate backward-compatible helper behavior with 1 AU cap', () => {
    expect(linkRate(1.0, DOWNLINK_RATE_1AU)).toBe(DOWNLINK_RATE_1AU);
    expect(linkRate(0.5, DOWNLINK_RATE_1AU)).toBe(DOWNLINK_RATE_1AU);
    expect(linkRate(2.0, DOWNLINK_RATE_1AU)).toBeCloseTo(DOWNLINK_RATE_1AU / 4, 1);
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
