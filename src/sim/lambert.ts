/**
 * AEGIS TRANSIT — Universal-Variable Lambert Solver
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Solves Lambert's problem for 2D heliocentric orbits using universal variables
 * and Stumpff functions.
 */

/**
 * Evaluates Stumpff function C(z).
 * C(z) = (1 - cos(sqrt(z))) / z for z > 0
 * C(z) = (cosh(sqrt(-z)) - 1) / (-z) for z < 0
 * C(0) = 1/2
 *
 * @param z Universal variable parameter
 * @returns Stumpff C(z)
 */
export function stumpffC(z: number): number {
  if (z > 1e-4) {
    const sz = Math.sqrt(z);
    return (1 - Math.cos(sz)) / z;
  }
  if (z < -1e-4) {
    const sz = Math.sqrt(-z);
    return (Math.cosh(sz) - 1) / (-z);
  }
  // Taylor series around z = 0
  return 0.5 - z / 24 + (z * z) / 720 - (z * z * z) / 40320 + (z * z * z * z) / 3628800;
}

/**
 * Evaluates Stumpff function S(z).
 * S(z) = (sqrt(z) - sin(sqrt(z))) / (sqrt(z))^3 for z > 0
 * S(z) = (sinh(sqrt(-z)) - sqrt(-z)) / (sqrt(-z))^3 for z < 0
 * S(0) = 1/6
 *
 * @param z Universal variable parameter
 * @returns Stumpff S(z)
 */
export function stumpffS(z: number): number {
  if (z > 1e-4) {
    const sz = Math.sqrt(z);
    return (sz - Math.sin(sz)) / (sz * sz * sz);
  }
  if (z < -1e-4) {
    const sz = Math.sqrt(-z);
    return (Math.sinh(sz) - sz) / (sz * sz * sz);
  }
  // Taylor series around z = 0
  return 1 / 6 - z / 120 + (z * z) / 5040 - (z * z * z) / 362880 + (z * z * z * z) / 39916800;
}

/**
 * Evaluates the intermediate Lambert distance parameter y(z).
 */
function evalY(z: number, r1: number, r2: number, A: number): number {
  const c = stumpffC(z);
  const s = stumpffS(z);
  return r1 + r2 + A * ((z * s - 1) / Math.sqrt(c));
}

/**
 * Evaluates time of flight t(z) in days.
 */
function evalTof(z: number, r1: number, r2: number, A: number, mu: number): number {
  const c = stumpffC(z);
  const s = stumpffS(z);
  const y = evalY(z, r1, r2, A);
  if (y <= 0 || c <= 0) {
    return NaN;
  }
  return ((Math.pow(y / c, 1.5) * s + A * Math.sqrt(y)) / Math.sqrt(mu));
}

/**
 * Derivative dt/dz for Newton-Raphson iteration.
 */
function evalDtDz(z: number, r1: number, r2: number, A: number, mu: number): number {
  const c = stumpffC(z);
  const s = stumpffS(z);
  const y = evalY(z, r1, r2, A);
  if (y <= 0 || c <= 0) {
    return NaN;
  }

  const sqrtMu = Math.sqrt(mu);
  if (Math.abs(z) < 1e-6) {
    return (1 / sqrtMu) * (
      (Math.SQRT2 / 40) * Math.pow(y, 1.5) +
      (A / 8) * (Math.sqrt(y) + A * Math.sqrt(1 / (2 * y)))
    );
  }

  const term1 = Math.pow(y / c, 1.5) * ((1 / (2 * z)) * (c - 3 * s) + (3 * s * s) / (4 * c));
  const term2 = (A / 8) * ((3 * s / c) * Math.sqrt(y) + A * Math.sqrt(c / y));
  return (1 / sqrtMu) * (term1 + term2);
}

/**
 * Solves Lambert's orbital boundary-value problem for 2D coplanar trajectories.
 *
 * @param r1 Departure position vector [x, y] in AU
 * @param r2 Arrival position vector [x, y] in AU
 * @param tof Time of flight in days (> 0)
 * @param mu Heliocentric gravitational parameter in AU^3/day^2
 * @param isRetrograde True for retrograde transfer (default false = prograde)
 * @returns Departure v1 and arrival v2 velocities in AU/day, or null if no valid trajectory
 */
export function lambertSolve(
  r1: [number, number],
  r2: [number, number],
  tof: number,
  mu: number,
  isRetrograde: boolean = false
): { v1: [number, number]; v2: [number, number] } | null {
  if (tof <= 0 || mu <= 0) {
    return null;
  }

  const [x1, y1] = r1;
  const [x2, y2] = r2;
  const R1 = Math.hypot(x1, y1);
  const R2 = Math.hypot(x2, y2);

  if (R1 < 1e-12 || R2 < 1e-12) {
    return null;
  }

  // Cross and dot products in the 2D plane
  const cross = x1 * y2 - y1 * x2;
  const dot = x1 * x2 + y1 * y2;

  const cosTheta = Math.max(-1, Math.min(1, dot / (R1 * R2)));
  let dtheta = Math.acos(cosTheta);

  if (!isRetrograde) {
    if (cross < 0) {
      dtheta = 2 * Math.PI - dtheta;
    }
  } else {
    if (cross >= 0) {
      dtheta = 2 * Math.PI - dtheta;
    }
  }

  // Near 0 or 2pi transfer angle has no unique solution
  if (dtheta < 1e-6 || dtheta > 2 * Math.PI - 1e-6) {
    return null;
  }

  // Handle exact collinear 180 deg singular case with slight numerical perturbation
  if (Math.abs(dtheta - Math.PI) < 1e-6) {
    dtheta = dtheta < Math.PI ? Math.PI - 1e-6 : Math.PI + 1e-6;
  }

  const sinDtheta = Math.sin(dtheta);
  const A = sinDtheta * Math.sqrt((R1 * R2) / (1 - Math.cos(dtheta)));
  if (Math.abs(A) < 1e-12) {
    return null;
  }

  // Determine brackets [zLow, zHigh] where t(z) is valid and brackets tof
  const zMax = 4 * Math.PI * Math.PI - 1e-3;
  let zHigh = zMax;
  let tHigh = evalTof(zHigh, R1, R2, A, mu);

  // If tof exceeds max single-rev time, no single-rev solution
  if (Number.isFinite(tHigh) && tof > tHigh) {
    return null;
  }

  // Check parabolic case z = 0
  const y0 = evalY(0, R1, R2, A);
  let zLow: number;
  let tLow: number;

  if (y0 > 0) {
    const t0 = evalTof(0, R1, R2, A, mu);
    if (tof >= t0) {
      // Elliptic transfer: 0 <= z < 4*pi^2
      zLow = 0;
      tLow = t0;
    } else {
      // Hyperbolic transfer: z < 0
      zHigh = 0;
      tHigh = t0;
      let step = -4;
      let testZ = step;
      while (testZ > -500) {
        const yVal = evalY(testZ, R1, R2, A);
        if (yVal <= 0) {
          break;
        }
        const tVal = evalTof(testZ, R1, R2, A, mu);
        if (tVal <= tof) {
          break;
        }
        step *= 2;
        testZ += step;
      }
      zLow = testZ;
      tLow = evalTof(zLow, R1, R2, A, mu);
      // If y went <= 0, bisect to find positive boundary
      if (!Number.isFinite(tLow) || evalY(zLow, R1, R2, A) <= 0) {
        let bLow = zLow;
        let bHigh = zHigh;
        for (let b = 0; b < 40; b++) {
          const mid = 0.5 * (bLow + bHigh);
          if (evalY(mid, R1, R2, A) > 0) {
            bHigh = mid;
          } else {
            bLow = mid;
          }
        }
        zLow = bHigh + 1e-5;
        tLow = evalTof(zLow, R1, R2, A, mu);
      }
    }
  } else {
    // y(0) <= 0: Root must be in z > 0 where y(z) > 0
    let bLow = 0;
    let bHigh = zMax;
    for (let b = 0; b < 40; b++) {
      const mid = 0.5 * (bLow + bHigh);
      if (evalY(mid, R1, R2, A) > 0) {
        bHigh = mid;
      } else {
        bLow = mid;
      }
    }
    zLow = bHigh + 1e-5;
    tLow = evalTof(zLow, R1, R2, A, mu);
  }

  // Check if target tof is reachable within valid range
  if (!Number.isFinite(tLow) || tof < tLow) {
    return null;
  }

  // Bracketed Newton-Raphson / Bisection hybrid root finding
  let z = 0.5 * (zLow + zHigh);
  const maxIter = 80;
  const tolTof = 1e-10;

  for (let iter = 0; iter < maxIter; iter++) {
    const tCurrent = evalTof(z, R1, R2, A, mu);
    if (!Number.isFinite(tCurrent)) {
      z = 0.5 * (zLow + zHigh);
      continue;
    }

    const err = tCurrent - tof;
    if (Math.abs(err) < tolTof || Math.abs(zHigh - zLow) < 1e-11) {
      break;
    }

    if (err < 0) {
      zLow = z;
    } else {
      zHigh = z;
    }

    const df = evalDtDz(z, R1, R2, A, mu);
    let nextZ = NaN;
    if (Number.isFinite(df) && df > 0) {
      const newtonZ = z - err / df;
      if (newtonZ > zLow && newtonZ < zHigh) {
        nextZ = newtonZ;
      }
    }

    if (Number.isNaN(nextZ)) {
      nextZ = 0.5 * (zLow + zHigh);
    }

    z = nextZ;
  }

  const yFinal = evalY(z, R1, R2, A);
  if (yFinal <= 0) {
    return null;
  }

  // Lagrange f, g, gDot coefficients
  const f = 1 - yFinal / R1;
  const g = A * Math.sqrt(yFinal / mu);
  const gDot = 1 - yFinal / R2;

  if (Math.abs(g) < 1e-12) {
    return null;
  }

  const v1: [number, number] = [
    (x2 - f * x1) / g,
    (y2 - f * y1) / g,
  ];

  const v2: [number, number] = [
    (gDot * x2 - x1) / g,
    (gDot * y2 - y1) / g,
  ];

  return { v1, v2 };
}
