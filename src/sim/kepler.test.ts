import { describe, expect, it } from 'vitest';
import { MARS_ELEMENTS } from '@sim/constants';
import {
  positionInOrbitalPlane,
  radiusFromA,
  solveKepler,
  trueAnomalyFromE,
} from '@sim/kepler';

describe('Kepler Solver & Anomalies', () => {
  it('circular orbit: e = 0, E should equal M', () => {
    const testAngles = [0, 0.5, Math.PI / 4, Math.PI / 2, Math.PI, 1.5 * Math.PI];
    for (const M of testAngles) {
      const E = solveKepler(M, 0);
      expect(E).toBeCloseTo(M, 10);
    }
  });

  it('moderate eccentricity: e = 0.5, verify against known solution', () => {
    const e = 0.5;
    const knownE = 1.0;
    // M = E - e * sin(E) = 1.0 - 0.5 * sin(1.0)
    const M = knownE - e * Math.sin(knownE);

    const computedE = solveKepler(M, e);
    expect(computedE).toBeCloseTo(knownE, 10);

    // Another known point: E = 2.0 rad
    const knownE2 = 2.0;
    const M2 = knownE2 - e * Math.sin(knownE2);
    expect(solveKepler(M2, e)).toBeCloseTo(knownE2, 10);
  });

  it('Mars eccentricity (e ≈ 0.0934): solve and verify radius at perihelion and aphelion', () => {
    const a = MARS_ELEMENTS.a;
    const e = MARS_ELEMENTS.e;

    // At perihelion: M = 0
    const E_perihelion = solveKepler(0, e);
    expect(E_perihelion).toBeCloseTo(0, 10);
    const r_perihelion = radiusFromA(a, e, E_perihelion);
    const expected_perihelion = a * (1 - e);
    expect(r_perihelion).toBeCloseTo(expected_perihelion, 9);
    expect(r_perihelion).toBeCloseTo(1.381404, 4);

    // At aphelion: M = pi
    const E_aphelion = solveKepler(Math.PI, e);
    expect(E_aphelion).toBeCloseTo(Math.PI, 10);
    const r_aphelion = radiusFromA(a, e, E_aphelion);
    const expected_aphelion = a * (1 + e);
    expect(r_aphelion).toBeCloseTo(expected_aphelion, 9);
    expect(r_aphelion).toBeCloseTo(1.666017, 4);
  });

  it('true anomaly at perihelion = 0, at aphelion = π', () => {
    const e = MARS_ELEMENTS.e;

    const nu_perihelion = trueAnomalyFromE(0, e);
    expect(nu_perihelion).toBeCloseTo(0, 10);

    const nu_aphelion = trueAnomalyFromE(Math.PI, e);
    expect(nu_aphelion).toBeCloseTo(Math.PI, 10);

    // Orbital plane positions
    const posPerihelion = positionInOrbitalPlane(MARS_ELEMENTS.a, e, 0);
    expect(posPerihelion.x).toBeCloseTo(MARS_ELEMENTS.a * (1 - e), 9);
    expect(posPerihelion.y).toBeCloseTo(0, 9);

    const posAphelion = positionInOrbitalPlane(MARS_ELEMENTS.a, e, Math.PI);
    expect(posAphelion.x).toBeCloseTo(-MARS_ELEMENTS.a * (1 + e), 9);
    expect(posAphelion.y).toBeCloseTo(0, 9);
  });
});
