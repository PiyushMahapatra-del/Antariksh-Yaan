/**
 * AEGIS TRANSIT — Tactical Map Drawing Utilities Tests
 * SIMULATION: NOT FLIGHT SOFTWARE
 */

import { describe, it, expect, vi } from 'vitest';
import {
  worldToScreen,
  screenToWorld,
  formatDistance,
  formatLightTime,
  drawCornerBrackets,
  drawArrow,
  drawBody,
  drawDiamond,
  drawOrbitEllipse,
} from './map-utils';

describe('Map Utilities Coordinate Transforms', () => {
  it('correctly maps center to canvas center', () => {
    const [sx, sy] = worldToScreen(0, 0, 0, 0, 100, 800, 600);
    expect(sx).toBe(400);
    expect(sy).toBe(300);
  });

  it('correctly maps positive offsets in world coordinates', () => {
    // 1 AU to the right (+X), 2 AU up (+Y)
    const [sx, sy] = worldToScreen(1, 2, 0, 0, 100, 800, 600);
    expect(sx).toBe(500); // 400 + 100
    expect(sy).toBe(100); // 300 - 200 (Y is inverted on screen)
  });

  it('performs exact round-trip inverse transformation', () => {
    const origWx = 1.2345;
    const origWy = -0.6789;
    const centerX = 0.5;
    const centerY = -0.2;
    const scale = 145.2;
    const w = 1024;
    const h = 768;

    const [sx, sy] = worldToScreen(origWx, origWy, centerX, centerY, scale, w, h);
    const [wx, wy] = screenToWorld(sx, sy, centerX, centerY, scale, w, h);

    expect(wx).toBeCloseTo(origWx, 8);
    expect(wy).toBeCloseTo(origWy, 8);
  });
});

describe('Format Helpers', () => {
  it('formats distances strictly adhering to: kilometers below 0.01 AU, otherwise AU with 3 decimals', () => {
    // Below 0.01 AU -> kilometers with commas
    expect(formatDistance(0.00386)).toBe('577,448 km');
    expect(formatDistance(0.00000178)).toBe('266 km');
    expect(formatDistance(0)).toBe('0 km');
    // Negative inputs are safely clamped to 0
    expect(formatDistance(-0.001)).toBe('0 km');
    // At or above 0.01 AU -> AU with 3 decimals
    expect(formatDistance(0.01)).toBe('0.010 AU');
    expect(formatDistance(0.015)).toBe('0.015 AU');
    expect(formatDistance(1.5237)).toBe('1.524 AU');
  });

  it('formats light-time under an hour', () => {
    expect(formatLightTime(0)).toBe('0m 0s');
    expect(formatLightTime(499)).toBe('8m 19s');
    expect(formatLightTime(75)).toBe('1m 15s');
  });

  it('formats light-time over an hour', () => {
    expect(formatLightTime(3665)).toBe('1h 1m 5s');
  });
});

describe('Canvas Drawing Helpers', () => {
  function createMockCtx(): CanvasRenderingContext2D {
    return {
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
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      measureText: vi.fn(() => ({ width: 40 })),
      strokeStyle: '',
      fillStyle: '',
      lineWidth: 1,
      font: '',
      textAlign: '',
      textBaseline: '',
      globalAlpha: 1,
    } as unknown as CanvasRenderingContext2D;
  }

  it('draws orbit ellipse without throwing', () => {
    const ctx = createMockCtx();
    drawOrbitEllipse(ctx, 1.52, 0.093, 336.0, '#ff5544', [4, 4]);
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  it('draws body marker with and without glow', () => {
    const ctxWithGlow = createMockCtx();
    drawBody(ctxWithGlow, 100, 100, 8, '#ffeb3b', 'SUN', true);
    expect(ctxWithGlow.createRadialGradient).toHaveBeenCalled();
    expect(ctxWithGlow.fillText).toHaveBeenCalledWith('SUN', expect.any(Number), expect.any(Number));

    const ctxNoGlow = createMockCtx();
    drawBody(ctxNoGlow, 200, 200, 5, '#00e5ff', 'SHIP', false);
    expect(ctxNoGlow.createRadialGradient).not.toHaveBeenCalled();
    expect(ctxNoGlow.fillText).toHaveBeenCalledWith('SHIP', expect.any(Number), expect.any(Number));
  });

  it('draws arrow with shaft and arrowhead', () => {
    const ctx = createMockCtx();
    drawArrow(ctx, 0, 0, 100, 100, '#00e5ff', 8);
    expect(ctx.moveTo).toHaveBeenCalled();
    expect(ctx.lineTo).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
  });

  it('draws corner brackets', () => {
    const ctx = createMockCtx();
    drawCornerBrackets(ctx, 10, 10, 50, 30, '#00e5ff', 6);
    expect(ctx.moveTo).toHaveBeenCalled();
    expect(ctx.lineTo).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
  });

  it('draws diamond icon', () => {
    const ctx = createMockCtx();
    drawDiamond(ctx, 50, 50, 6, '#00e5ff', true);
    expect(ctx.moveTo).toHaveBeenCalled();
    expect(ctx.lineTo).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
  });
});
