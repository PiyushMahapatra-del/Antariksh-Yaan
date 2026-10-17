/**
 * AEGIS TRANSIT — Communication Geometry & Link Analysis
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Calculates line-of-sight communication metrics, light-time delays,
 * solar exclusion angle blackout states, and signal loss probabilities.
 */

import {
  BLACKOUT_THETA_DEG,
  LIGHT_TIME_1AU_S,
  radToDeg,
} from '@sim/constants';

/**
 * Computes one-way light-time in seconds for a given distance in AU.
 *
 * @param distAU Distance in Astronomical Units
 * @returns One-way light-time delay in seconds
 */
export function lightTimeAU(distAU: number): number {
  return distAU * LIGHT_TIME_1AU_S;
}

/**
 * Computes the 2D Euclidean communication distance between spacecraft and Earth in AU.
 *
 * @param shipPos Spacecraft position [x, y] in AU
 * @param earthPos Earth position [x, y] in AU
 * @returns Separation distance in AU
 */
export function commDistance(
  shipPos: [number, number],
  earthPos: [number, number]
): number {
  return Math.hypot(shipPos[0] - earthPos[0], shipPos[1] - earthPos[1]);
}

/**
 * Computes the Sun-Earth-Ship solar elongation angle theta in degrees.
 * The vertex is located at Earth, with rays towards the Sun (at origin [0,0])
 * and towards the spacecraft.
 *
 * When theta approaches 0 degrees, the line-of-sight passes directly through
 * solar coronal plasma, causing RF blackout.
 *
 * @param shipPos Spacecraft position [x, y] in AU
 * @param earthPos Earth position [x, y] in AU
 * @returns Sun-Earth-Ship angle theta in degrees, in [0, 180]
 */
export function sunEarthShipAngle(
  shipPos: [number, number],
  earthPos: [number, number]
): number {
  // Vector from Earth to Sun (Sun is at origin [0, 0])
  const esx = -earthPos[0];
  const esy = -earthPos[1];
  const distES = Math.hypot(esx, esy);

  // Vector from Earth to Spacecraft
  const epx = shipPos[0] - earthPos[0];
  const epy = shipPos[1] - earthPos[1];
  const distEP = Math.hypot(epx, epy);

  if (distES < 1e-12 || distEP < 1e-12) {
    return 0;
  }

  const dot = (esx * epx + esy * epy) / (distES * distEP);
  const clampedDot = Math.max(-1, Math.min(1, dot));
  return radToDeg(Math.acos(clampedDot));
}

/**
 * Determines whether communications are in solar blackout based on the Sun-Earth-Ship angle.
 *
 * @param theta Sun-Earth-Ship angle in degrees
 * @param thresholdDeg Solar exclusion threshold in degrees (defaults to BLACKOUT_THETA_DEG = 2.0)
 * @returns True if the link is obstructed by solar blackout
 */
export function isInBlackout(
  theta: number,
  thresholdDeg: number = BLACKOUT_THETA_DEG
): boolean {
  return theta <= thresholdDeg;
}

/**
 * Computes the available telemetry / communications link data rate using the
 * free-space inverse-square loss law (1 / d^2).
 *
 * @param distAU Earth-spacecraft distance in AU
 * @param baseRate Base data rate at 1 AU (bits/second)
 * @returns Available data rate in bits/second
 */
export { linkBudget, formatLinkRate, type LinkBudgetResult } from './link-budget.js';

export function linkRate(distAU: number, baseRate: number): number {
  if (!Number.isFinite(distAU) || distAU <= 0) {
    return baseRate;
  }
  const effectiveD = Math.max(1.0, distAU);
  return baseRate / (effectiveD * effectiveD);
}

/**
 * Computes RF packet loss probability based on the Sun-Earth-Ship angle theta.
 * Loss is 1.0 (100%) when within the blackout exclusion angle, and falls off
 * continuously as theta moves away from the solar exclusion cone.
 *
 * @param theta Sun-Earth-Ship angle in degrees
 * @param thresholdDeg Solar exclusion threshold in degrees (defaults to BLACKOUT_THETA_DEG = 2.0)
 * @returns Packet loss probability in the range [0, 1]
 */
export function packetLossProbability(
  theta: number,
  thresholdDeg: number = BLACKOUT_THETA_DEG
): number {
  if (theta <= thresholdDeg) {
    return 1.0;
  }

  const transitionBand = Math.max(thresholdDeg * 2, 5.0);
  if (theta >= thresholdDeg + transitionBand) {
    return 0.0;
  }

  const t = (theta - thresholdDeg) / transitionBand;
  // Non-linear quadratic roll-off near threshold
  return Math.max(0, Math.min(1, Math.pow(1 - t, 2)));
}
