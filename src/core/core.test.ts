/**
 * AEGIS TRANSIT — Core Module Unit Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { EventBus } from './event-bus.js';
import { Store, RingBuffer, ReactiveValue } from './store.js';
import { formatMET } from '../main.js';
import type { AegisEventMap, WarpPreset } from './types.js';

describe('EventBus', () => {
  it('registers and emits typed events', () => {
    const bus = new EventBus<AegisEventMap>();
    const listener = vi.fn();

    bus.on('sim:warpChanged', listener);
    bus.emit('sim:warpChanged', { warp: 10, paused: false });

    expect(listener).toHaveBeenCalledWith({ warp: 10, paused: false });
  });

  it('handles once listener correctly', () => {
    const bus = new EventBus<AegisEventMap>();
    const listener = vi.fn();

    bus.once('sim:warpChanged', listener);
    bus.emit('sim:warpChanged', { warp: 60, paused: false });
    bus.emit('sim:warpChanged', { warp: 600, paused: false });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ warp: 60, paused: false });
  });

  it('unsubscribes listeners with off', () => {
    const bus = new EventBus<AegisEventMap>();
    const listener = vi.fn();

    const subId = bus.on('sim:warpChanged', listener);
    bus.off(subId);
    bus.emit('sim:warpChanged', { warp: 1, paused: true });

    expect(listener).not.toHaveBeenCalled();
  });
});

describe('Store and RingBuffer', () => {
  it('stores and notifies reactive updates', () => {
    const store = new Store({ warp: 1 as WarpPreset, paused: false });
    const listener = vi.fn();

    store.subscribe('warp', listener);
    store.set('warp', 60);

    expect(store.get('warp')).toBe(60);
    expect(listener).toHaveBeenCalledWith(60, 1);
  });

  it('RingBuffer maintains fixed capacity and ordering', () => {
    const rb = new RingBuffer<number>(3);
    rb.push(10);
    rb.push(20);
    rb.push(30);
    rb.push(40); // drops 10

    expect(rb.length).toBe(3);
    expect(rb.toArray()).toEqual([20, 30, 40]);
    expect(rb.last()).toBe(40);
  });

  it('ReactiveValue notifies subscribers on change', () => {
    const val = new ReactiveValue<number>(100);
    const listener = vi.fn();
    const unsub = val.subscribe(listener);

    val.set(200);
    expect(listener).toHaveBeenCalledWith(200, 100);

    unsub();
    val.set(300);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('formatMET', () => {
  it('formats zero seconds', () => {
    expect(formatMET(0)).toBe('+000d 00:00:00');
  });

  it('formats multi-day timestamps correctly', () => {
    const sec = 3 * 86400 + 14 * 3600 + 22 * 60 + 45;
    expect(formatMET(sec)).toBe('+003d 14:22:45');
  });
});
