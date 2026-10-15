/**
 * AEGIS TRANSIT — Live Communication State Manager
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Calculates and caches line-of-sight communication metrics, propagation delays,
 * solar blackout states, and operator manual delay overrides.
 */

import { DOWNLINK_RATE_1AU } from './constants.js';
import {
  commDistance,
  isInBlackout,
  lightTimeAU,
  linkRate,
  packetLossProbability,
  sunEarthShipAngle,
} from './comms-geometry.js';
import type { CommState, LinkState } from '../core/types.js';

/** Minimum operator override delay in minutes (3 min = 180 s) */
const MIN_OVERRIDE_MINUTES = 3;

/** Maximum operator override delay in minutes (22 min = 1320 s) */
const MAX_OVERRIDE_MINUTES = 22;

/**
 * Manages live communication link parameters and manual test overrides.
 */
export class CommsStateManager {
  /** Current deep space communication link state */
  public state: CommState;

  /** Whether the operator has engaged manual delay override */
  public overrideEnabled: boolean;

  /** Manual override delay in seconds (clamped to 3–22 minutes = 180–1320 s) */
  public overrideDelaySec: number;

  /**
   * Initializes the communication state manager with nominal default parameters.
   */
  constructor() {
    this.overrideEnabled = false;
    this.overrideDelaySec = 600; // 10 minutes nominal default

    this.state = {
      distanceAU: 0,
      oneWayLightTimeSec: 0,
      roundTripSec: 0,
      thetaDeg: 180,
      linkState: 'NOMINAL',
      linkRateBps: DOWNLINK_RATE_1AU,
      packetLossProb: 0,
      isOverridden: false,
      overrideDelaySec: this.overrideDelaySec,
    };
  }

  /**
   * Updates communication metrics based on current spacecraft and Earth positions.
   *
   * @param shipPos Spacecraft position [x, y] in AU
   * @param earthPos Earth position [x, y] in AU
   */
  update(shipPos: [number, number], earthPos: [number, number]): void {
    const distAU = commDistance(shipPos, earthPos);
    const oneWaySec = lightTimeAU(distAU);
    const roundTripSec = 2 * oneWaySec;
    const thetaDeg = sunEarthShipAngle(shipPos, earthPos);
    const inBlackout = isInBlackout(thetaDeg);
    const lossProb = packetLossProbability(thetaDeg);
    const baseRate = linkRate(distAU, DOWNLINK_RATE_1AU);
    const effectiveRate = inBlackout ? 0 : baseRate * (1 - lossProb);

    let linkState: LinkState;
    if (this.overrideEnabled) {
      linkState = 'OVERRIDE';
    } else if (inBlackout) {
      linkState = 'BLACKOUT';
    } else if (lossProb > 0.001) {
      linkState = 'DEGRADED';
    } else {
      linkState = 'NOMINAL';
    }

    this.state = {
      distanceAU: distAU,
      oneWayLightTimeSec: oneWaySec,
      roundTripSec: roundTripSec,
      thetaDeg: thetaDeg,
      linkState,
      linkRateBps: effectiveRate,
      packetLossProb: lossProb,
      isOverridden: this.overrideEnabled,
      overrideDelaySec: this.overrideDelaySec,
    };
  }

  /**
   * Sets manual override state and optional override delay in minutes.
   * Delay is clamped strictly between 3 and 22 minutes (180 s to 1320 s).
   *
   * @param enabled Whether override is active
   * @param delayMinutes Delay in minutes (clamped between 3 and 22)
   */
  setOverride(enabled: boolean, delayMinutes?: number): void {
    this.overrideEnabled = enabled;

    if (delayMinutes !== undefined) {
      const clampedMinutes = Math.max(
        MIN_OVERRIDE_MINUTES,
        Math.min(MAX_OVERRIDE_MINUTES, delayMinutes)
      );
      this.overrideDelaySec = clampedMinutes * 60;
    }

    this.state.isOverridden = this.overrideEnabled;
    this.state.overrideDelaySec = this.overrideDelaySec;

    if (this.overrideEnabled) {
      this.state.linkState = 'OVERRIDE';
    } else if (this.state.linkState === 'OVERRIDE') {
      const blackout = isInBlackout(this.state.thetaDeg);
      if (blackout) {
        this.state.linkState = 'BLACKOUT';
      } else if (this.state.packetLossProb > 0.001) {
        this.state.linkState = 'DEGRADED';
      } else {
        this.state.linkState = 'NOMINAL';
      }
    }
  }

  /**
   * Returns the effective communication latency in seconds.
   * Returns operator override delay if override is active, else actual physical one-way light time.
   */
  get effectiveDelaySec(): number {
    return this.overrideEnabled ? this.overrideDelaySec : this.state.oneWayLightTimeSec;
  }
}
