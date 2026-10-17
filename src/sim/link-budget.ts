/**
 * AEGIS TRANSIT — Unified Deep Space Link Budget Subsystem
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Authoritative mathematical model for RF link budget, free-space propagation loss,
 * solar conjunction attenuation, and adaptive data rate formatting.
 */

import {
  DOWNLINK_RATE_1AU,
  UPLINK_RATE_1AU,
  BLACKOUT_THETA_DEG,
} from './constants.js';

export interface LinkBudgetResult {
  /** Downlink available rate in bits per second */
  downlinkBps: number;
  /** Uplink available rate in bits per second */
  uplinkBps: number;
  /** Downlink rate in kilobits per second */
  downlinkRateKbps: number;
  /** Uplink rate in kilobits per second */
  uplinkRateKbps: number;
  /** Link status classification */
  status: 'NOMINAL' | 'DEGRADED' | 'BLACKOUT';
  /** RF packet loss probability [0, 1] */
  lossProbability: number;
  /** True if link is obstructed by solar blackout cone */
  isBlackout: boolean;
  /** Adaptive unit string for downlink (e.g. '500 kbps', '55.56 kbps') */
  formattedDownlink: string;
  /** Adaptive unit string for uplink (e.g. '100 kbps', '11.11 kbps') */
  formattedUplink: string;
}

/**
 * Computes single authoritative link budget across all panels, DTN simulation, and tactical map.
 * 
 * Mathematical Model:
 * rate = clamp(R_ref * (1 AU / max(d, d_min))^2, R_min, R_max)
 * where d_min = 1.0 AU, R_max = R_ref, R_min = 0.
 *
 * @param distanceAu Earth-spacecraft distance in AU
 * @param thetaDeg Sun-Earth-Ship angle in degrees
 * @returns LinkBudgetResult with rates, status, loss probability, and formatted strings
 */
export function linkBudget(distanceAu: number, thetaDeg: number = 180): LinkBudgetResult {
  // Validate distance to prevent NaN or Infinity
  const safeD = !Number.isFinite(distanceAu) || distanceAu <= 0 ? 1.0 : distanceAu;
  const safeTheta = !Number.isFinite(thetaDeg) ? 180 : thetaDeg;

  // d_min = 1.0 AU; at d <= 1 AU, rate equals the cap R_max = R_ref
  const effectiveD = Math.max(1.0, safeD);
  const geometricFactor = 1.0 / (effectiveD * effectiveD);

  // Unattenuated base rates with inverse-square loss
  let dlBps = Math.min(DOWNLINK_RATE_1AU, Math.max(0, DOWNLINK_RATE_1AU * geometricFactor));
  let ulBps = Math.min(UPLINK_RATE_1AU, Math.max(0, UPLINK_RATE_1AU * geometricFactor));

  const isBlackout = safeTheta <= BLACKOUT_THETA_DEG;
  let status: 'NOMINAL' | 'DEGRADED' | 'BLACKOUT' = 'NOMINAL';
  let lossProbability = 0.001; // 0.1% baseline error rate

  if (isBlackout) {
    status = 'BLACKOUT';
    dlBps = 0;
    ulBps = 0;
    lossProbability = 1.0;
  } else if (safeTheta < BLACKOUT_THETA_DEG + 3.0) {
    // Solar plasma noise within 3 degrees of blackout cone
    status = 'DEGRADED';
    const margin = Math.max(0, safeTheta - BLACKOUT_THETA_DEG); // [0, 3]
    const plasmaFactor = margin / 3.0; // [0, 1]
    lossProbability = 0.1 + (1.0 - plasmaFactor) * 0.8; // 10% to 90%
    dlBps *= plasmaFactor;
    ulBps *= plasmaFactor;
  }

  // Ensure finite and non-negative
  const finalDlBps = Number.isFinite(dlBps) ? Math.max(0, dlBps) : 0;
  const finalUlBps = Number.isFinite(ulBps) ? Math.max(0, ulBps) : 0;

  return {
    downlinkBps: finalDlBps,
    uplinkBps: finalUlBps,
    downlinkRateKbps: finalDlBps / 1000,
    uplinkRateKbps: finalUlBps / 1000,
    status,
    lossProbability,
    isBlackout,
    formattedDownlink: formatLinkRate(finalDlBps),
    formattedUplink: formatLinkRate(finalUlBps),
  };
}

/**
 * Formats a raw bit rate (in bits/second) with adaptive units (bps, kbps, Mbps)
 * and at most 4 significant digits.
 *
 * @param rateBps Raw rate in bits/second
 * @returns Human-readable adaptive rate string
 */
export function formatLinkRate(rateBps: number): string {
  if (!Number.isFinite(rateBps) || rateBps <= 0) {
    return '0 bps';
  }

  let value: number;
  let unit: 'bps' | 'kbps' | 'Mbps';

  if (rateBps >= 1_000_000) {
    value = rateBps / 1_000_000;
    unit = 'Mbps';
  } else if (rateBps >= 1_000) {
    value = rateBps / 1_000;
    unit = 'kbps';
  } else {
    value = rateBps;
    unit = 'bps';
  }

  // At most 4 significant digits
  const formattedNum = parseFloat(value.toPrecision(4));
  return `${formattedNum} ${unit}`;
}
