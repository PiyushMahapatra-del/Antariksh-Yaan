/**
 * AEGIS TRANSIT — Simulation Clock Unit Tests
 * SIMULATION: NOT FLIGHT SOFTWARE
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SimClock } from './clock.js';
import { SECONDS_PER_DAY } from './constants.js';

describe('SimClock', () => {
  const START_JD = 2454360.0;
  let clock: SimClock;

  beforeEach(() => {
    clock = new SimClock(START_JD);
  });

  it('initializes at departure JD with zero MET and 1x warp', () => {
    expect(clock.simTimeJD).toBe(START_JD);
    expect(clock.metSeconds).toBe(0);
    expect(clock.warp).toBe(1);
    expect(clock.paused).toBe(false);
    expect(clock.subsystemsActive).toBe(true);
  });

  it('tick advances MET and simTimeJD according to warp', () => {
    const wallDt = 0.5; // 0.5 seconds
    const simDt = clock.tick(wallDt);

    expect(simDt).toBe(0.5);
    expect(clock.metSeconds).toBe(0.5);
    expect(clock.simTimeJD).toBeCloseTo(START_JD + 0.5 / SECONDS_PER_DAY, 10);

    clock.setWarp(60);
    const simDt60 = clock.tick(1.0);
    expect(simDt60).toBe(60);
    expect(clock.metSeconds).toBe(60.5);
    expect(clock.simTimeJD).toBeCloseTo(START_JD + 60.5 / SECONDS_PER_DAY, 10);
  });

  it('paused clock returns 0 and does not advance time', () => {
    clock.pause();
    expect(clock.paused).toBe(true);

    const simDt = clock.tick(1.0);
    expect(simDt).toBe(0);
    expect(clock.metSeconds).toBe(0);
    expect(clock.simTimeJD).toBe(START_JD);

    clock.resume();
    expect(clock.paused).toBe(false);
    const simDtAfterResume = clock.tick(1.0);
    expect(simDtAfterResume).toBe(1.0);
    expect(clock.metSeconds).toBe(1.0);
  });

  it('togglePause flips pause state', () => {
    expect(clock.paused).toBe(false);
    clock.togglePause();
    expect(clock.paused).toBe(true);
    clock.togglePause();
    expect(clock.paused).toBe(false);
  });

  it('setWarp snaps to closest preset', () => {
    clock.setWarp(10);
    expect(clock.warp).toBe(10);

    // Non-preset 45 should snap to 60
    clock.setWarp(45);
    expect(clock.warp).toBe(60);

    // Non-preset 2 should snap to 1
    clock.setWarp(2);
    expect(clock.warp).toBe(1);

    // High non-preset 90000 should snap to 86400
    clock.setWarp(90000);
    expect(clock.warp).toBe(86400);
  });

  it('warpUp and warpDown traverse presets with clamping', () => {
    expect(clock.warp).toBe(1);
    expect(clock.warpUp()).toBe(10);
    expect(clock.warpUp()).toBe(60);
    expect(clock.warpUp()).toBe(600);
    expect(clock.warpUp()).toBe(3600);
    expect(clock.warpUp()).toBe(86400);
    expect(clock.warpUp()).toBe(604800);
    // At maximum preset
    expect(clock.warpUp()).toBe(604800);

    expect(clock.warpDown()).toBe(86400);
    expect(clock.warpDown()).toBe(3600);
    expect(clock.warpDown()).toBe(600);
    expect(clock.warpDown()).toBe(60);
    expect(clock.warpDown()).toBe(10);
    expect(clock.warpDown()).toBe(1);
    // At minimum preset
    expect(clock.warpDown()).toBe(1);
  });

  it('subsystemsActive reflects warp <= 600 threshold', () => {
    clock.setWarp(1);
    expect(clock.subsystemsActive).toBe(true);

    clock.setWarp(600);
    expect(clock.subsystemsActive).toBe(true);

    clock.setWarp(3600);
    expect(clock.subsystemsActive).toBe(false);

    clock.setWarp(86400);
    expect(clock.subsystemsActive).toBe(false);

    clock.setWarp(604800);
    expect(clock.subsystemsActive).toBe(false);
  });

  it('dropTo1x resets warp factor to 1x', () => {
    clock.setWarp(86400);
    expect(clock.warp).toBe(86400);
    clock.dropTo1x();
    expect(clock.warp).toBe(1);
  });

  it('handleAlert drops to 1x on CAUTION, WARNING, CRITICAL but not NOMINAL', () => {
    clock.setWarp(3600);
    clock.handleAlert('NOMINAL');
    expect(clock.warp).toBe(3600);

    clock.handleAlert('CAUTION');
    expect(clock.warp).toBe(1);

    clock.setWarp(3600);
    clock.handleAlert('WARNING');
    expect(clock.warp).toBe(1);

    clock.setWarp(3600);
    clock.handleAlert('CRITICAL');
    expect(clock.warp).toBe(1);
  });
});
