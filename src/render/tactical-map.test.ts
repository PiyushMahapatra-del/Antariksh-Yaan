/**
 * AEGIS TRANSIT — Tactical Map Component Tests
 * SIMULATION: NOT FLIGHT SOFTWARE
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TacticalMap } from './tactical-map';
import type { CommState } from '../core/types';

interface MockElement {
  tagName: string;
  style: Record<string, string>;
  className: string;
  tabIndex: number;
  children: MockElement[];
  parentElement: MockElement | null;
  appendChild(child: MockElement): MockElement;
  removeChild(child: MockElement): MockElement;
  getBoundingClientRect(): { left: number; top: number; width: number; height: number };
  getContext(type: string): unknown;
  addEventListener(evt: string, fn: unknown): void;
  removeEventListener(evt: string, fn: unknown): void;
}

describe('TacticalMap Component', () => {
  let container: MockElement;
  let origDocument: Document | undefined;
  let origWindow: (Window & typeof globalThis) | undefined;

  beforeEach(() => {
    origDocument = Reflect.get(globalThis, 'document');
    origWindow = Reflect.get(globalThis, 'window');

    const mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillRect: vi.fn(),
      fillText: vi.fn(),
      setLineDash: vi.fn(),
      setTransform: vi.fn(),
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      measureText: vi.fn(() => ({ width: 50 })),
      strokeStyle: '',
      fillStyle: '',
      lineWidth: 1,
      font: '',
      textAlign: '',
      textBaseline: '',
      globalAlpha: 1,
    };

    const createMockElement = (tag: string): MockElement => {
      const el: MockElement = {
        tagName: tag.toUpperCase(),
        style: {},
        className: '',
        tabIndex: 0,
        children: [],
        parentElement: null,
        appendChild(child: MockElement) {
          child.parentElement = this;
          this.children.push(child);
          return child;
        },
        removeChild(child: MockElement) {
          const idx = this.children.indexOf(child);
          if (idx !== -1) {
            this.children.splice(idx, 1);
            child.parentElement = null;
          }
          return child;
        },
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
        getContext: vi.fn(() => mockCtx),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
      return el;
    };

    Reflect.set(globalThis, 'document', {
      createElement: vi.fn((tag: string) => createMockElement(tag)),
    });

    Reflect.set(globalThis, 'window', {
      devicePixelRatio: 1,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    container = createMockElement('div');
  });

  afterEach(() => {
    Reflect.set(globalThis, 'document', origDocument);
    Reflect.set(globalThis, 'window', origWindow);
  });

  it('instantiates and attaches canvas to container', () => {
    const map = new TacticalMap(container as unknown as HTMLElement);
    expect(container.children.length).toBe(1);
    expect(map.getScale()).toBe(200);
    expect(map.getCenter()).toEqual([0, 0]);

    map.destroy();
    expect(container.children.length).toBe(0);
  });

  it('updates state and accumulates ship trail', () => {
    const map = new TacticalMap(container as unknown as HTMLElement);

    const commState: CommState = {
      distanceAU: 0.5,
      oneWayLightTimeSec: 250,
      roundTripSec: 500,
      thetaDeg: 45,
      linkState: 'NOMINAL',
      linkRateBps: 1000000,
      packetLossProb: 0,
      isOverridden: false,
      overrideDelaySec: 0,
    };

    map.updateState({
      earthPos: [1.0, 0.0],
      marsPos: [1.5, 0.2],
      shipPos: [1.1, 0.05],
      commState,
      simTimeJD: 2451550.0,
      phase: 'Cruise',
    });

    // Move ship multiple times to verify trail growth
    for (let i = 1; i <= 10; i++) {
      map.updateState({
        earthPos: [1.0, 0.0],
        marsPos: [1.5, 0.2],
        shipPos: [1.1 + i * 0.01, 0.05 + i * 0.01],
        commState,
        simTimeJD: 2451550.0 + i,
        phase: 'Cruise',
      });
    }

    // Should render without error
    expect(() => map.render()).not.toThrow();

    map.destroy();
  });

  it('focuses on celestial bodies and resets view', () => {
    const map = new TacticalMap(container as unknown as HTMLElement);

    map.updateState({
      earthPos: [0.98, 0.15],
      marsPos: [1.55, -0.3],
      shipPos: [1.2, 0.1],
      commState: {
        distanceAU: 0.8,
        oneWayLightTimeSec: 400,
        roundTripSec: 800,
        thetaDeg: 30,
        linkState: 'NOMINAL',
        linkRateBps: 500000,
        packetLossProb: 0,
        isOverridden: false,
        overrideDelaySec: 0,
      },
      simTimeJD: 2451560.0,
      phase: 'Cruise',
    });

    map.focusOn('MARS');
    expect(map.getCenter()[0]).toBeCloseTo(1.55, 4);
    expect(map.getCenter()[1]).toBeCloseTo(-0.3, 4);

    map.focusOn('EARTH');
    expect(map.getCenter()[0]).toBeCloseTo(0.98, 4);

    map.focusOn('SUN');
    expect(map.getCenter()).toEqual([0, 0]);

    map.setCenter(2.5, -1.0);
    expect(map.getCenter()).toEqual([2.5, -1.0]);

    map.setScale(350);
    expect(map.getScale()).toBe(350);

    map.resetView();
    expect(map.getCenter()).toEqual([0, 0]);
    expect(map.getScale()).toBe(200);

    map.destroy();
  });

  it('renders all comm link states (NOMINAL, DEGRADED, BLACKOUT, OVERRIDE)', () => {
    const map = new TacticalMap(container as unknown as HTMLElement);

    const states: CommState['linkState'][] = ['NOMINAL', 'DEGRADED', 'BLACKOUT', 'OVERRIDE'];

    for (const linkState of states) {
      map.updateState({
        earthPos: [1.0, 0.0],
        marsPos: [1.5, 0.0],
        shipPos: [-1.2, 0.0], // Behind Sun for blackout geometry test
        commState: {
          distanceAU: 2.2,
          oneWayLightTimeSec: 1100,
          roundTripSec: 2200,
          thetaDeg: 0.5,
          linkState,
          linkRateBps: 10000,
          packetLossProb: linkState === 'BLACKOUT' ? 1.0 : 0.1,
          isOverridden: linkState === 'OVERRIDE',
          overrideDelaySec: 0,
        },
        simTimeJD: 2451570.0,
        phase: 'Cruise',
      });

      expect(() => map.render()).not.toThrow();
    }

    map.destroy();
  });

  it('correctly handles coordinate transformations', () => {
    const map = new TacticalMap(container as unknown as HTMLElement);
    map.setCenter(0, 0);
    map.setScale(200);

    const [screenX, screenY] = map.toScreen(1.0, 0.5);
    const [worldX, worldY] = map.toWorld(screenX, screenY);

    expect(worldX).toBeCloseTo(1.0, 5);
    expect(worldY).toBeCloseTo(0.5, 5);

    map.destroy();
  });
});
