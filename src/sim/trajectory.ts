/**
 * AEGIS TRANSIT — Mission Trajectory Manager
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Solves interplanetary transfer windows via porkchop Lambert grid search,
 * propagates spacecraft orbital state using universal variables, and tracks
 * planetary encounters (e.g., Mars Sphere of Influence entry).
 */

import {
  AU_M,
  J2000_JD,
  MARS_SOI_M,
  MU_SUN_AU3D2,
} from './constants.js';
import { earthPosition, marsPosition } from './ephemeris.js';
import { lambertSolve } from './lambert.js';
import { propagateKepler } from './propagate.js';
import type { ShipState } from '../core/types.js';

/**
 * Manages mission trajectory planning, Lambert solutions, and real-time Keplerian propagation.
 */
export class TrajectoryManager {
  /** Spacecraft physical, kinematic, and phase state */
  public shipState!: ShipState;

  /** Julian Date of departure from Earth */
  public departureJD!: number;

  /** Julian Date of arrival at Mars */
  public arrivalJD!: number;

  /** Transfer duration in days */
  public tofDays!: number;

  /** Departure position [x, y] in AU */
  public departurePos!: [number, number];

  /** Arrival position [x, y] in AU */
  public arrivalPos!: [number, number];

  /** Heliocentric departure velocity [vx, vy] in AU/day */
  public departureVel!: [number, number];

  /** Heliocentric arrival velocity [vx, vy] in AU/day */
  public arrivalVel!: [number, number];

  /** Current simulation Julian Date for caching */
  private currentSimTimeJD: number = J2000_JD;

  /**
   * Constructs the TrajectoryManager and runs the porkchop search to find the optimal transfer window.
   */
  constructor() {
    this.initialize();
  }

  /**
   * Searches for optimal Earth-Mars launch window within J2000 + 5yr to + 8yr,
   * solves Lambert's problem, and sets up initial trajectory parameters.
   */
  initialize(): void {
    const startDepJD = J2000_JD + 365 * 5;
    const endDepJD = J2000_JD + 365 * 8;
    const depStepDays = 5;
    const tofMinDays = 180;
    const tofMaxDays = 300;
    const tofStepDays = 5;

    let bestDepJD = startDepJD;
    let bestArrJD = startDepJD + tofMinDays;
    let bestTof = tofMinDays;
    let bestR1: [number, number] = [1, 0];
    let bestR2: [number, number] = [1.5, 0];
    let bestV1: [number, number] = [0, 0];
    let bestV2: [number, number] = [0, 0];
    let minDv = Infinity;

    const velDt = 1e-4; // Finite difference step for Earth orbital velocity

    for (let depJD = startDepJD; depJD <= endDepJD; depJD += depStepDays) {
      const pEarth = earthPosition(depJD);
      const r1: [number, number] = [pEarth.x, pEarth.y];

      // Central difference Earth velocity in AU/day
      const pE1 = earthPosition(depJD - velDt);
      const pE2 = earthPosition(depJD + velDt);
      const vEarth: [number, number] = [
        (pE2.x - pE1.x) / (2 * velDt),
        (pE2.y - pE1.y) / (2 * velDt),
      ];

      for (let tof = tofMinDays; tof <= tofMaxDays; tof += tofStepDays) {
        const arrJD = depJD + tof;
        const pMars = marsPosition(arrJD);
        const r2: [number, number] = [pMars.x, pMars.y];

        const sol = lambertSolve(r1, r2, tof, MU_SUN_AU3D2);
        if (!sol) {
          continue;
        }

        // Hyperbolic excess departure delta-v: |v1 - vEarth|
        const dvDep = Math.hypot(sol.v1[0] - vEarth[0], sol.v1[1] - vEarth[1]);
        if (dvDep < minDv) {
          minDv = dvDep;
          bestDepJD = depJD;
          bestArrJD = arrJD;
          bestTof = tof;
          bestR1 = r1;
          bestR2 = r2;
          bestV1 = sol.v1;
          bestV2 = sol.v2;
        }
      }
    }

    this.departureJD = bestDepJD;
    this.arrivalJD = bestArrJD;
    this.tofDays = bestTof;
    this.departurePos = bestR1;
    this.arrivalPos = bestR2;
    this.departureVel = bestV1;
    this.arrivalVel = bestV2;
    this.currentSimTimeJD = bestDepJD;

    this.shipState = {
      pos: [this.departurePos[0], this.departurePos[1]],
      vel: [this.departureVel[0], this.departureVel[1]],
      phase: 'Cruise',
      attitudeQuat: [1, 0, 0, 0],
      deltaVRemaining: 4200,
      mass: 45000,
    };
  }

  /**
   * Updates spacecraft position and velocity for the given simulation Julian Date.
   *
   * @param simTimeJD Target Julian Date
   */
  update(simTimeJD: number): void {
    this.currentSimTimeJD = simTimeJD;
    const dt = simTimeJD - this.departureJD;

    const state = propagateKepler(this.departurePos, this.departureVel, dt, MU_SUN_AU3D2);
    this.shipState.pos = state.r;
    this.shipState.vel = state.v;

    // Check Mars proximity and transition mission phase
    const mars = marsPosition(simTimeJD);
    const marsDistAU = this.distanceToMars([mars.x, mars.y]);
    const marsSoiAU = MARS_SOI_M / AU_M;

    if (marsDistAU <= marsSoiAU) {
      this.shipState.phase = 'MOI';
    } else if (simTimeJD < this.departureJD) {
      this.shipState.phase = 'Cruise';
    } else if (simTimeJD >= this.arrivalJD) {
      this.shipState.phase = 'MarsOrbit';
    } else {
      this.shipState.phase = 'Cruise';
    }
  }

  /**
   * Predicts spacecraft position at a future Julian Date without mutating state.
   *
   * @param futureJD Future Julian Date
   * @returns Predicted position [x, y] in AU
   */
  predictPosition(futureJD: number): [number, number] {
    const dt = futureJD - this.departureJD;
    const state = propagateKepler(this.departurePos, this.departureVel, dt, MU_SUN_AU3D2);
    return state.r;
  }

  /**
   * Determines if the spacecraft has entered the Martian Sphere of Influence (SOI).
   *
   * @param marsPos Optional Mars position [x, y] in AU. If omitted, computed from current JD.
   * @returns True if distance to Mars <= Mars SOI radius
   */
  isInMarsSOI(marsPos?: [number, number]): boolean {
    const targetPos = marsPos ?? (() => {
      const m = marsPosition(this.currentSimTimeJD);
      return [m.x, m.y] as [number, number];
    })();

    const distAU = this.distanceToMars(targetPos);
    return distAU <= MARS_SOI_M / AU_M;
  }

  /**
   * Computes Euclidean distance from the spacecraft to Mars in AU.
   *
   * @param marsPos Mars position [x, y] in AU
   * @returns Separation distance in AU
   */
  distanceToMars(marsPos: [number, number]): number {
    return Math.hypot(
      this.shipState.pos[0] - marsPos[0],
      this.shipState.pos[1] - marsPos[1]
    );
  }
}
