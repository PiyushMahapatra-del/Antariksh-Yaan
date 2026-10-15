/**
 * AEGIS TRANSIT — Simulation Loop Unit Tests
 * SIMULATION: NOT FLIGHT SOFTWARE
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SimLoop } from './sim-loop.js';
import { EventBus } from '../core/event-bus.js';
import type { AegisEventMap, CommState } from '../core/types.js';

describe('SimLoop', () => {
  let bus: EventBus<AegisEventMap>;
  let simLoop: SimLoop;

  beforeEach(() => {
    bus = new EventBus<AegisEventMap>();
    simLoop = new SimLoop(bus);
  });

  it('initializes coordinators, ephemerides, and trajectory state', () => {
    expect(simLoop.clock).toBeDefined();
    expect(simLoop.trajectory).toBeDefined();
    expect(simLoop.comms).toBeDefined();
    expect(simLoop.running).toBe(false);

    expect(simLoop.earthPos).toBeDefined();
    expect(simLoop.marsPos).toBeDefined();
    expect(simLoop.earthState.r).toBeCloseTo(1.0, 1);
    expect(simLoop.marsState.r).toBeCloseTo(1.5, 1);
  });

  it('tick advances simulation and broadcasts sim:tick and comm:stateChanged', () => {
    let tickCount = 0;
    let lastSimDt = 0;
    let lastJD = 0;
    let lastCommState: CommState | undefined;

    bus.on('sim:tick', ({ dt, simTimeJD }) => {
      tickCount++;
      lastSimDt = dt;
      lastJD = simTimeJD;
    });

    bus.on('comm:stateChanged', (comm) => {
      lastCommState = comm;
    });

    simLoop.tick(0.05); // 50ms wall-clock step at 1x

    expect(tickCount).toBe(1);
    expect(lastSimDt).toBe(0.05);
    expect(lastJD).toBeGreaterThan(simLoop.trajectory.departureJD);
    expect(lastCommState).toBeDefined();
    expect(lastCommState?.distanceAU).toBeGreaterThanOrEqual(0);
  });

  it('responds to sim:warpChanged event from bus', () => {
    bus.emit('sim:warpChanged', { warp: 60, paused: false });
    expect(simLoop.clock.warp).toBe(60);
    expect(simLoop.clock.paused).toBe(false);

    bus.emit('sim:warpChanged', { warp: 60, paused: true });
    expect(simLoop.clock.paused).toBe(true);
  });

  it('auto-drops warp to 1x on alert:raised event', () => {
    simLoop.clock.setWarp(3600);
    expect(simLoop.clock.warp).toBe(3600);

    const warpChangedSpy = vi.fn();
    bus.on('sim:warpChanged', warpChangedSpy);

    bus.emit('alert:raised', {
      subsystem: 'EPS',
      channel: 'bus_voltage',
      level: 'WARNING',
      value: 23.8,
      limit: 24.0,
    });

    expect(simLoop.clock.warp).toBe(1);
    expect(warpChangedSpy).toHaveBeenCalledWith(expect.objectContaining({ warp: 1 }));
  });

  it('start and stop manage running lifecycle', () => {
    simLoop.start();
    expect(simLoop.running).toBe(true);

    simLoop.stop();
    expect(simLoop.running).toBe(false);
  });
});
