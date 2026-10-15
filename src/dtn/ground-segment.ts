/**
 * AEGIS TRANSIT — Earth Ground Segment Simulator
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Simulates the Earth-based mission control center:
 * - Computes telemetry age: "DATA IS xx.x MIN OLD"
 * - Maintains historical ground telemetry view
 * - Provides uplink command generation and advisory telemetry packets
 * - Simulates Flight Director & Flight Surgeon reviews
 * 
 * Fidelity: HIGH (Realistic ground lag, advisory queue, telemetry replay)
 */

import { type Bundle, createBundle } from './bundle.js';
import { BundleVerifier } from './bundle-verifier.js';

export interface GroundTelemetrySnapshot {
  receivedSimTime: number;
  shipCreationSimTime: number;
  telemetryAgeSec: number;
  data: any;
}

export interface GroundAdvisory {
  id: string;
  sourceRole: 'FLIGHT_DIRECTOR' | 'FLIGHT_SURGEON' | 'EECOM' | 'GNC_OFFICER';
  title: string;
  message: string;
  recommendedProcedureId?: string;
  severity: 'INFO' | 'ADVISORY' | 'CRITICAL';
  createdSimTime: number;
}

export class GroundSegment {
  private verifier: BundleVerifier = new BundleVerifier();
  private receivedBundles: Bundle[] = [];
  private latestTelemetry: GroundTelemetrySnapshot | null = null;
  private pendingUplinkQueue: Bundle[] = [];
  private advisories: GroundAdvisory[] = [];

  /**
   * Processes a bundle that has arrived at Earth ground station.
   */
  async receiveDownlinkBundle(bundle: Bundle, currentSimTime: number): Promise<boolean> {
    const verification = await this.verifier.verifyBundle(bundle, currentSimTime);
    if (!verification.valid) {
      console.warn(`GROUND: Rejected downlink bundle ${bundle.header.id}: ${verification.reason}`);
      return false;
    }

    this.receivedBundles.push(bundle);

    // If telemetry or health payload, update latest ground view
    if (bundle.header.payloadType === 'telemetry' || bundle.header.payloadType === 'health') {
      const ageSec = Math.max(0, currentSimTime - bundle.header.creationSimTime);
      this.latestTelemetry = {
        receivedSimTime: currentSimTime,
        shipCreationSimTime: bundle.header.creationSimTime,
        telemetryAgeSec: ageSec,
        data: bundle.payload,
      };
    }

    // Auto-generate advisories for specific alarms
    if (bundle.header.payloadType === 'fdir_alert') {
      this._generateGroundAlertAdvisory(bundle.payload, currentSimTime);
    } else if (bundle.header.payloadType === 'medical_report') {
      this._generateFlightSurgeonAdvisory(bundle.payload, currentSimTime);
    }

    return true;
  }

  /**
   * Generates formatted "DATA IS xx MIN OLD" string.
   */
  getTelemetryAgeString(currentSimTime: number): string {
    if (!this.latestTelemetry) {
      return 'NO GROUND TELEMETRY (AWAITING ACQUISITION)';
    }

    const currentAgeSec = Math.max(0, currentSimTime - this.latestTelemetry.shipCreationSimTime);
    const minutes = (currentAgeSec / 60).toFixed(1);
    return `DATA IS ${minutes} MIN OLD (TRANSMITTED MET ${Math.floor(this.latestTelemetry.shipCreationSimTime)}s)`;
  }

  /**
   * Creates an uplink command bundle from Earth to Ship.
   */
  async createUplinkCommand(
    commandType: string,
    payload: any,
    currentSimTime: number,
    priority: 0 | 1 | 2 | 3 = 1
  ): Promise<Bundle> {
    const bundle = await createBundle(
      'earth',
      'ship',
      priority,
      commandType,
      payload,
      currentSimTime
    );

    this.pendingUplinkQueue.push(bundle);
    return bundle;
  }

  /**
   * Dequeues next uplink bundle ready to be transmitted to ship.
   */
  dequeueUplink(): Bundle | null {
    return this.pendingUplinkQueue.shift() ?? null;
  }

  /**
   * Returns list of ground-issued advisories.
   */
  getAdvisories(): GroundAdvisory[] {
    return [...this.advisories];
  }

  private _generateGroundAlertAdvisory(_payload: any, simTime: number): void {
    this.advisories.unshift({
      id: `adv-${Date.now().toString(36)}`,
      sourceRole: 'EECOM',
      title: 'GROUND ADVISORY: THERMAL LOOP ANOMALY CONFIRMED',
      message: 'Ground MCC telemetry analysis correlates high outlet temperature with pump cavitation. Concur with Loop B failover proposal.',
      recommendedProcedureId: 'proc_loop_failover',
      severity: 'ADVISORY',
      createdSimTime: simTime,
    });
  }

  private _generateFlightSurgeonAdvisory(_payload: any, simTime: number): void {
    this.advisories.unshift({
      id: `adv-${Date.now().toString(36)}`,
      sourceRole: 'FLIGHT_SURGEON',
      title: 'FLIGHT SURGEON: HYPOXIA CLINICAL DIRECTIVE',
      message: 'SYNTHETIC: Reviewing crew vitals. Concur with supplemental O2 administration. Monitor SpO2 recovery curve.',
      recommendedProcedureId: 'proc_hypoxia',
      severity: 'CRITICAL',
      createdSimTime: simTime,
    });
  }

  /**
   * Returns latest telemetry snapshot received by Earth.
   */
  getLatestTelemetry(): GroundTelemetrySnapshot | null {
    return this.latestTelemetry;
  }

  /**
   * Clear state
   */
  clear(): void {
    this.receivedBundles = [];
    this.latestTelemetry = null;
    this.pendingUplinkQueue = [];
    this.advisories = [];
    this.verifier.reset();
  }
}
