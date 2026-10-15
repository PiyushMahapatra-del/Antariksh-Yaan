/**
 * AEGIS TRANSIT — Lambert Solver Tests
 * SIMULATION: NOT FLIGHT SOFTWARE
 */
import { describe, it, expect } from 'vitest';
import { lambertSolve, stumpffC, stumpffS } from '@sim/lambert';
import { planetPosition } from '@sim/ephemeris';
import { MARS_ELEMENTS, EARTH_ELEMENTS, MU_SUN_AU3D2, J2000_JD, AU_M } from '@sim/constants';

describe('Stumpff Functions', () => {
  it('C(0) ≈ 0.5', () => {
    expect(stumpffC(0)).toBeCloseTo(0.5, 6);
  });

  it('S(0) ≈ 1/6', () => {
    expect(stumpffS(0)).toBeCloseTo(1 / 6, 6);
  });

  it('C(z) > 0 for z > 0 (elliptic)', () => {
    expect(stumpffC(1)).toBeGreaterThan(0);
    expect(stumpffC(10)).toBeGreaterThan(0);
  });

  it('C(z) > 0 for z < 0 (hyperbolic)', () => {
    expect(stumpffC(-1)).toBeGreaterThan(0);
    expect(stumpffC(-10)).toBeGreaterThan(0);
  });
});

describe('Lambert Solver', () => {
  it('Hohmann-like transfer: Earth to Mars, TOF ≈ 259 days', () => {
    // Departure near J2000
    const jdDepart = J2000_JD + 200; // arbitrary departure
    const tofDays = 259;
    const jdArrive = jdDepart + tofDays;

    const earth = planetPosition(EARTH_ELEMENTS, jdDepart);
    const mars = planetPosition(MARS_ELEMENTS, jdArrive);

    const r1: [number, number] = [earth.x, earth.y];
    const r2: [number, number] = [mars.x, mars.y];

    const result = lambertSolve(r1, r2, tofDays, MU_SUN_AU3D2);
    expect(result).not.toBeNull();

    if (result) {
      const { v1, v2 } = result;
      // Velocity magnitudes should be finite and positive
      const v1mag = Math.hypot(v1[0], v1[1]);
      const v2mag = Math.hypot(v2[0], v2[1]);
      expect(v1mag).toBeGreaterThan(0);
      expect(v2mag).toBeGreaterThan(0);
      expect(Number.isFinite(v1mag)).toBe(true);
      expect(Number.isFinite(v2mag)).toBe(true);

      // Departure velocity should be in reasonable range for heliocentric orbit
      // Earth orbital speed ≈ 0.01720 AU/day, transfer should be similar order
      expect(v1mag).toBeGreaterThan(0.005); // > ~2.5 km/s
      expect(v1mag).toBeLessThan(0.05);     // < ~25 km/s

      // Compute departure delta-v (difference from Earth's velocity)
      const earthVel = 2 * Math.PI * EARTH_ELEMENTS.a / EARTH_ELEMENTS.period; // rough circular speed
      // Delta-v depends on geometry; for some departure dates can be < 1 km/s
      const dvDepart = Math.abs(v1mag - earthVel);
      const dvDepartKmS = dvDepart * AU_M / 86400 / 1000;
      expect(dvDepartKmS).toBeGreaterThan(0.1);  // non-trivial delta-v
      expect(dvDepartKmS).toBeLessThan(15);      // less than 15 km/s
    }
  });

  it('returns null for zero time of flight', () => {
    const result = lambertSolve([1, 0], [1.5, 0.5], 0, MU_SUN_AU3D2);
    expect(result).toBeNull();
  });

  it('returns null for negative mu', () => {
    const result = lambertSolve([1, 0], [1.5, 0.5], 200, -1);
    expect(result).toBeNull();
  });

  it('handles short transfers (30 days)', () => {
    const jdDepart = J2000_JD + 100;
    const tofDays = 30;
    const jdArrive = jdDepart + tofDays;

    const earth = planetPosition(EARTH_ELEMENTS, jdDepart);
    const mars = planetPosition(MARS_ELEMENTS, jdArrive);

    const result = lambertSolve(
      [earth.x, earth.y],
      [mars.x, mars.y],
      tofDays,
      MU_SUN_AU3D2
    );
    // May or may not have a solution depending on geometry, but should not crash
    if (result) {
      expect(Number.isFinite(Math.hypot(result.v1[0], result.v1[1]))).toBe(true);
    }
  });
});
