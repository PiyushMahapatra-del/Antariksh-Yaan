/**
 * AEGIS TRANSIT — Keplerian Orbit Solver
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Solves Kepler's equation and anomaly conversions in the 2D orbital plane.
 * All internal angles are in radians.
 */

/**
 * Solves Kepler's equation M = E - e * sin(E) for eccentric anomaly E using Newton-Raphson iteration.
 *
 * @param M Mean anomaly in radians
 * @param e Orbital eccentricity (0 <= e < 1)
 * @param tol Convergence tolerance (default 1e-12)
 * @param maxIter Maximum iterations (default 100)
 * @returns Eccentric anomaly E in radians
 */
export function solveKepler(
  M: number,
  e: number,
  tol: number = 1e-12,
  maxIter: number = 100
): number {
  if (e === 0) {
    return M;
  }

  // Handle multi-revolution angle wrapping smoothly
  const twoPi = 2 * Math.PI;
  const k = Math.floor(M / twoPi);
  const mNorm = M - k * twoPi;

  // Good initial guess for Newton-Raphson
  let E = e < 0.8
    ? mNorm + e * Math.sin(mNorm) + 0.5 * e * e * Math.sin(2 * mNorm)
    : Math.PI;

  for (let iter = 0; iter < maxIter; iter++) {
    const f = E - e * Math.sin(E) - mNorm;
    const fPrime = 1 - e * Math.cos(E);

    const delta = f / fPrime;
    E -= delta;

    if (Math.abs(delta) < tol) {
      break;
    }
  }

  return k * twoPi + E;
}

/**
 * Computes true anomaly nu from eccentric anomaly E and eccentricity e.
 *
 * @param E Eccentric anomaly in radians
 * @param e Orbital eccentricity (0 <= e < 1)
 * @returns True anomaly nu in radians
 */
export function trueAnomalyFromE(E: number, e: number): number {
  if (e === 0) {
    return E;
  }

  const twoPi = 2 * Math.PI;
  const k = Math.floor(E / twoPi);
  const eNorm = E - k * twoPi;

  const sinNu = Math.sqrt(Math.max(0, 1 - e * e)) * Math.sin(eNorm);
  const cosNu = Math.cos(eNorm) - e;

  let nu = Math.atan2(sinNu, cosNu);
  if (nu < 0) {
    nu += twoPi;
  }

  return k * twoPi + nu;
}

/**
 * Computes heliocentric radius r = a * (1 - e * cos(E)).
 *
 * @param a Semi-major axis (AU or m)
 * @param e Orbital eccentricity (0 <= e < 1)
 * @param E Eccentric anomaly in radians
 * @returns Heliocentric radius in the same units as semi-major axis
 */
export function radiusFromA(a: number, e: number, E: number): number {
  return a * (1 - e * Math.cos(E));
}

/**
 * Computes 2D position in the orbital plane with perihelion oriented along the +x axis.
 *
 * @param a Semi-major axis (AU)
 * @param e Orbital eccentricity (0 <= e < 1)
 * @param nu True anomaly in radians
 * @returns 2D coordinates { x, y } in the orbital plane
 */
export function positionInOrbitalPlane(
  a: number,
  e: number,
  nu: number
): { x: number; y: number } {
  const r = (a * (1 - e * e)) / (1 + e * Math.cos(nu));
  return {
    x: r * Math.cos(nu),
    y: r * Math.sin(nu),
  };
}
