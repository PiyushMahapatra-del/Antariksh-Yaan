/**
 * AEGIS TRANSIT — Universal-Variable Kepler Propagator
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Propagates 2D heliocentric orbits forward or backward in time using universal variables.
 */

import { stumpffC, stumpffS } from '@sim/lambert';

/**
 * Propagates a 2D Keplerian orbital state vector (r0, v0) forward by dt days.
 * Handles circular, elliptic, parabolic, and hyperbolic orbits uniformly.
 *
 * @param r0 Initial position vector [x, y] in AU
 * @param v0 Initial velocity vector [vx, vy] in AU/day
 * @param dt Time step in days
 * @param mu Heliocentric gravitational parameter in AU^3/day^2
 * @returns Propagated state { r, v } with r in AU and v in AU/day
 */
export function propagateKepler(
  r0: [number, number],
  v0: [number, number],
  dt: number,
  mu: number
): { r: [number, number]; v: [number, number] } {
  if (dt === 0) {
    return {
      r: [r0[0], r0[1]],
      v: [v0[0], v0[1]],
    };
  }

  const [x0, y0] = r0;
  const [vx0, vy0] = v0;

  const R0 = Math.hypot(x0, y0);
  const V0Sq = vx0 * vx0 + vy0 * vy0;
  const r0DotV0 = x0 * vx0 + y0 * vy0;

  const sqrtMu = Math.sqrt(mu);
  // Reciprocal semi-major axis (alpha = 1/a)
  const alpha = 2 / R0 - V0Sq / mu;

  // Initial estimate for universal anomaly chi
  let chi: number;
  if (alpha > 1e-6) {
    // Elliptic orbit
    chi = sqrtMu * dt * alpha;
  } else if (alpha < -1e-6) {
    // Hyperbolic orbit
    const a = 1 / alpha;
    const signDt = dt >= 0 ? 1 : -1;
    const denom = r0DotV0 + signDt * Math.sqrt(-mu * alpha) * (1 - alpha * R0);
    const arg = (-2 * mu * alpha * dt) / denom;
    if (arg > 0) {
      chi = signDt * Math.sqrt(-a) * Math.log(arg);
    } else {
      chi = (sqrtMu * dt) / R0;
    }
  } else {
    // Parabolic orbit
    chi = (sqrtMu * dt) / R0;
  }

  // Newton-Raphson iteration on universal Kepler equation
  const maxIter = 100;
  const tol = 1e-12;

  for (let iter = 0; iter < maxIter; iter++) {
    const z = alpha * chi * chi;
    const c = stumpffC(z);
    const s = stumpffS(z);

    const f =
      (r0DotV0 / sqrtMu) * chi * chi * c +
      (1 - alpha * R0) * Math.pow(chi, 3) * s +
      R0 * chi -
      sqrtMu * dt;

    const fPrime =
      (r0DotV0 / sqrtMu) * chi * (1 - z * s) +
      (1 - alpha * R0) * chi * chi * c +
      R0;

    const delta = f / fPrime;
    chi -= delta;

    if (Math.abs(delta) < tol || Math.abs(f) < tol) {
      break;
    }
  }

  const z = alpha * chi * chi;
  const c = stumpffC(z);
  const s = stumpffS(z);

  const R =
    (r0DotV0 / sqrtMu) * chi * (1 - z * s) +
    (1 - alpha * R0) * chi * chi * c +
    R0;

  // Lagrange coefficients f, g, fDot, gDot
  const f = 1 - (chi * chi / R0) * c;
  const g = dt - (Math.pow(chi, 3) / sqrtMu) * s;
  const fDot = (sqrtMu / (Math.max(R, 1e-12) * R0)) * chi * (z * s - 1);
  const gDot = 1 - (chi * chi / Math.max(R, 1e-12)) * c;

  const r: [number, number] = [
    f * x0 + g * vx0,
    f * y0 + g * vy0,
  ];

  const v: [number, number] = [
    fDot * x0 + gDot * vx0,
    fDot * y0 + gDot * vy0,
  ];

  return { r, v };
}
