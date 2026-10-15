/**
 * AEGIS TRANSIT — Planetary Ephemeris Core
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Calculates approximate planetary positions in the 2D heliocentric ecliptic plane.
 */

import {
  degToRad,
  EARTH_ELEMENTS,
  J2000_JD,
  MARS_ELEMENTS,
  type OrbitalElements,
} from '@sim/constants';
import { radiusFromA, solveKepler, trueAnomalyFromE } from '@sim/kepler';

/**
 * Computes mean anomaly M at a specified Julian Date, normalized to [0, 2π).
 * Formula: M = L0 - wbar + n * (jd - J2000_JD)
 *
 * @param elements Planetary orbital elements
 * @param jd Julian Date
 * @returns Mean anomaly in radians, normalized to [0, 2π)
 */
export function meanAnomalyAtEpoch(elements: OrbitalElements, jd: number): number {
  const dt = jd - J2000_JD;
  // Elements L0, wbar, and n are expressed in degrees
  const mDeg = elements.L0 - elements.wbar + elements.n * dt;
  const twoPi = 2 * Math.PI;
  let mRad = degToRad(mDeg) % twoPi;
  if (mRad < 0) {
    mRad += twoPi;
  }
  return mRad;
}

/**
 * Computes the 2D heliocentric ecliptic position of a planet at a specified Julian Date.
 *
 * @param elements Planetary orbital elements
 * @param jd Julian Date
 * @returns Object containing x, y in AU, radius r in AU, and true anomaly nu in radians
 */
export function planetPosition(
  elements: OrbitalElements,
  jd: number
): { x: number; y: number; r: number; nu: number } {
  const M = meanAnomalyAtEpoch(elements, jd);
  const E = solveKepler(M, elements.e);
  const nu = trueAnomalyFromE(E, elements.e);
  const r = radiusFromA(elements.a, elements.e, E);

  // Longitude of perihelion wbar converted to radians
  const wbarRad = degToRad(elements.wbar);
  // Heliocentric ecliptic true longitude lambda = wbar + nu
  const lambda = wbarRad + nu;

  return {
    x: r * Math.cos(lambda),
    y: r * Math.sin(lambda),
    r,
    nu,
  };
}

/**
 * Convenience wrapper returning Earth's position at the given Julian Date.
 *
 * @param jd Julian Date
 * @returns Earth heliocentric coordinates { x, y, r, nu }
 */
export function earthPosition(jd: number): { x: number; y: number; r: number; nu: number } {
  return planetPosition(EARTH_ELEMENTS, jd);
}

/**
 * Convenience wrapper returning Mars' position at the given Julian Date.
 *
 * @param jd Julian Date
 * @returns Mars heliocentric coordinates { x, y, r, nu }
 */
export function marsPosition(jd: number): { x: number; y: number; r: number; nu: number } {
  return planetPosition(MARS_ELEMENTS, jd);
}
