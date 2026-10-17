/**
 * AEGIS TRANSIT — DTN Deep-Space Link Model & In-Flight Propagation
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Models deep-space link dynamics:
 * - One-way light time (OWLT = d / c, 499.005 s / AU)
 * - Round-trip light time (RTLT = 2 * OWLT)
 * - Rate scaling: 1 / d^2 (500 kbps downlink, 100 kbps uplink at 1 AU)
 * - Solar conjunction blackout when theta < 2.0 degrees
 * - In-flight bundle propagation pipeline with real delivery delay
 * 
 * Fidelity: HIGH (Analytic light-time physics, conjunction geometry, transmission queue)
 */

import { type Bundle } from './bundle.js';
import { LIGHT_TIME_1AU_S } from '../sim/constants.js';
import { linkBudget } from '../sim/link-budget.js';

export interface InFlightBundle {
  bundle: Bundle;
  departureSimTime: number;
  arrivalSimTime: number;
  oneWayDelaySec: number;
  direction: 'downlink' | 'uplink'; // downlink: ship->earth, uplink: earth->ship
  corrupted?: boolean;
}

export interface LinkStateSnapshot {
  status: 'NOMINAL' | 'DEGRADED' | 'BLACKOUT' | 'OVERRIDE';
  distanceAu: number;
  distanceKm: number;
  thetaDeg: number;
  oneWayLightTimeSec: number;
  roundTripLightTimeSec: number;
  downlinkRateKbps: number;
  uplinkRateKbps: number;
  lossProbability: number;
  inFlightCount: number;
  overrideActive: boolean;
  forcedLatencyMin?: number;
}

export class DeepSpaceLinkModel {
  private inFlightQueue: InFlightBundle[] = [];
  private forcedLatencyMin: number | null = null;
  private overrideActive: boolean = false;

  // Contact schedule windows (DSN Goldstone/Madrid/Canberra passes)
  // Simple cyclic contact window: 8 hrs pass, 0.5 hr handover
  private contactCycleSec: number = 8.5 * 3600;
  private handoverDurationSec: number = 0.5 * 3600;

  /**
   * Toggles scenario latency override (SIM-05)
   */
  setLatencyOverride(enabled: boolean, delayMinutes: number = 15): void {
    this.overrideActive = enabled;
    this.forcedLatencyMin = enabled ? Math.max(3, Math.min(22, delayMinutes)) : null;
  }

  isOverrideActive(): boolean {
    return this.overrideActive;
  }

  getForcedLatencyMin(): number | null {
    return this.forcedLatencyMin;
  }

  /**
   * Calculates instantaneous link parameters based on geometry.
   */
  computeLinkState(
    distanceAu: number,
    thetaDeg: number,
    currentSimSeconds: number
  ): LinkStateSnapshot {
    let owltSec: number;

    if (this.overrideActive && this.forcedLatencyMin !== null) {
      owltSec = this.forcedLatencyMin * 60;
    } else {
      owltSec = distanceAu * LIGHT_TIME_1AU_S;
    }

    const rtltSec = owltSec * 2;

    // Contact window check (DSN ground station handover gap)
    const phaseInCycle = (currentSimSeconds % this.contactCycleSec);
    const isHandover = phaseInCycle > (this.contactCycleSec - this.handoverDurationSec);

    // Unified link budget calculation
    const budget = linkBudget(distanceAu, thetaDeg);
    let dlRate = budget.downlinkRateKbps;
    let ulRate = budget.uplinkRateKbps;
    let status: 'NOMINAL' | 'DEGRADED' | 'BLACKOUT' | 'OVERRIDE' = budget.status;
    const lossProb = budget.lossProbability;

    if (this.overrideActive) {
      status = 'OVERRIDE';
    } else if (isHandover && status !== 'BLACKOUT') {
      status = 'DEGRADED';
      dlRate *= 0.2;
      ulRate *= 0.2;
    }

    return {
      status,
      distanceAu,
      distanceKm: distanceAu * 149597870.7,
      thetaDeg,
      oneWayLightTimeSec: owltSec,
      roundTripLightTimeSec: rtltSec,
      downlinkRateKbps: dlRate,
      uplinkRateKbps: ulRate,
      lossProbability: lossProb,
      inFlightCount: this.inFlightQueue.length,
      overrideActive: this.overrideActive,
      forcedLatencyMin: this.forcedLatencyMin ?? undefined,
    };
  }

  /**
   * Transmits a bundle across the link, queuing it into the in-flight propagation pipeline.
   */
  transmit(
    bundle: Bundle,
    currentSimSeconds: number,
    linkState: LinkStateSnapshot
  ): boolean {
    if (linkState.status === 'BLACKOUT') {
      return false; // Physical blackout blocks transmission
    }

    const arrivalSimTime = currentSimSeconds + linkState.oneWayLightTimeSec;
    bundle.transmittedAtSimTime = currentSimSeconds;

    const inFlight: InFlightBundle = {
      bundle,
      departureSimTime: currentSimSeconds,
      arrivalSimTime,
      oneWayDelaySec: linkState.oneWayLightTimeSec,
      direction: bundle.header.source === 'ship' ? 'downlink' : 'uplink',
      corrupted: Math.random() < linkState.lossProbability,
    };

    this.inFlightQueue.push(inFlight);
    return true;
  }

  /**
   * Advances propagation time and returns all bundles that have arrived at their destination.
   */
  step(currentSimSeconds: number): { delivered: Bundle[]; corrupted: Bundle[] } {
    const delivered: Bundle[] = [];
    const corrupted: Bundle[] = [];
    const remaining: InFlightBundle[] = [];

    for (const item of this.inFlightQueue) {
      if (currentSimSeconds >= item.arrivalSimTime) {
        item.bundle.receivedAtSimTime = currentSimSeconds;
        if (item.corrupted) {
          corrupted.push(item.bundle);
        } else {
          delivered.push(item.bundle);
        }
      } else {
        remaining.push(item);
      }
    }

    this.inFlightQueue = remaining;
    return { delivered, corrupted };
  }

  /**
   * Returns list of currently propagating bundles.
   */
  getInFlightBundles(): InFlightBundle[] {
    return [...this.inFlightQueue];
  }

  /**
   * Clears in-flight queue.
   */
  clear(): void {
    this.inFlightQueue = [];
  }
}
