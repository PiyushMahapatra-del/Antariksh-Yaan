/**
 * AEGIS TRANSIT — Mission Trajectory Manager Unit Tests
 * SIMULATION: NOT FLIGHT SOFTWARE
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TrajectoryManager } from './trajectory.js';
import { J2000_JD, MARS_SOI_M, AU_M } from './constants.js';
import { marsPosition } from './ephemeris.js';

describe('TrajectoryManager', () => {
  let tm: TrajectoryManager;

  beforeEach(() => {
    tm = new TrajectoryManager();
  });

  it('runs porkchop search to find launch window within bounds', () => {
    const minDep = J2000_JD + 365 * 5;
    const maxDep = J2000_JD + 365 * 8;

    expect(tm.departureJD).toBeGreaterThanOrEqual(minDep);
    expect(tm.departureJD).toBeLessThanOrEqual(maxDep);
    expect(tm.tofDays).toBeGreaterThanOrEqual(180);
    expect(tm.tofDays).toBeLessThanOrEqual(300);
    expect(tm.arrivalJD).toBe(tm.departureJD + tm.tofDays);

    // Positions should be in reasonable astronomical distances
    const r1Mag = Math.hypot(tm.departurePos[0], tm.departurePos[1]);
    const r2Mag = Math.hypot(tm.arrivalPos[0], tm.arrivalPos[1]);
    expect(r1Mag).toBeCloseTo(1.0, 1); // Earth ~ 1 AU
    expect(r2Mag).toBeGreaterThan(1.35); // Mars perihelion ~1.38 AU
    expect(r2Mag).toBeLessThan(1.70);    // Mars aphelion ~1.67 AU

    expect(Number.isFinite(tm.departureVel[0])).toBe(true);
    expect(Number.isFinite(tm.departureVel[1])).toBe(true);
    expect(Number.isFinite(tm.arrivalVel[0])).toBe(true);
    expect(Number.isFinite(tm.arrivalVel[1])).toBe(true);
  });

  it('initializes shipState at departure position and velocity', () => {
    expect(tm.shipState.pos[0]).toBeCloseTo(tm.departurePos[0], 6);
    expect(tm.shipState.pos[1]).toBeCloseTo(tm.departurePos[1], 6);
    expect(tm.shipState.vel[0]).toBeCloseTo(tm.departureVel[0], 6);
    expect(tm.shipState.vel[1]).toBeCloseTo(tm.departureVel[1], 6);
    expect(tm.shipState.phase).toBe('Cruise');
    expect(tm.shipState.deltaVRemaining).toBeGreaterThan(0);
    expect(tm.shipState.mass).toBeGreaterThan(0);
  });

  it('propagates ship along trajectory at arrival date', () => {
    tm.update(tm.arrivalJD);
    expect(tm.shipState.pos[0]).toBeCloseTo(tm.arrivalPos[0], 2);
    expect(tm.shipState.pos[1]).toBeCloseTo(tm.arrivalPos[1], 2);
  });

  it('predictPosition computes future position without mutating ship state', () => {
    const midJD = tm.departureJD + tm.tofDays / 2;
    const initialPos = [...tm.shipState.pos];

    const predicted = tm.predictPosition(midJD);
    expect(tm.shipState.pos[0]).toBe(initialPos[0]);
    expect(tm.shipState.pos[1]).toBe(initialPos[1]);

    // Now updating to midJD should match predicted
    tm.update(midJD);
    expect(tm.shipState.pos[0]).toBeCloseTo(predicted[0], 8);
    expect(tm.shipState.pos[1]).toBeCloseTo(predicted[1], 8);
  });

  it('distanceToMars calculates Euclidean distance in AU', () => {
    tm.update(tm.departureJD);
    const mars = marsPosition(tm.departureJD);
    const d = tm.distanceToMars([mars.x, mars.y]);
    expect(d).toBeGreaterThan(0.3); // Far from Mars at departure
  });

  it('detects Mars SOI entry and updates phase to MOI', () => {
    const mars = marsPosition(tm.arrivalJD);
    const marsSoiAU = MARS_SOI_M / AU_M;

    // During cruise, should not be in Mars SOI
    tm.update(tm.departureJD + 50);
    expect(tm.isInMarsSOI()).toBe(false);

    // If we place ship within SOI radius of Mars
    tm.shipState.pos = [mars.x + marsSoiAU * 0.5, mars.y];
    expect(tm.isInMarsSOI([mars.x, mars.y])).toBe(true);

    // Updating close to arrival should transition phase
    tm.update(tm.arrivalJD);
    const dArr = tm.distanceToMars([mars.x, mars.y]);
    if (dArr <= marsSoiAU) {
      expect(tm.shipState.phase).toBe('MOI');
    }
  });
});
