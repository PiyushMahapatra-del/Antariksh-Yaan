/**
 * AEGIS TRANSIT — Core Type Definitions
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Comprehensive type definitions for simulation state, telemetry, communication,
 * safety gates, AI diagnostic proposals, and event bus contracts.
 */

import type { RingBuffer } from './store.js';

// ============================================================================
// Mission & Simulation
// ============================================================================

/**
 * Valid mission phases for the AEGIS TRANSIT Mars mission profile.
 */
export type MissionPhase =
  | 'Cruise'
  | 'MOI'
  | 'MarsOrbit'
  | 'EDL'
  | 'SurfaceOps'
  | 'Ascent'
  | 'TEI'
  | 'ReturnCruise'
  | 'EarthEntry';

/**
 * Subsystem fidelity level for engineering compliance.
 * - HIGH: Physics-derived numerical integration / real differential equations
 * - MEDIUM: Parametric / empirical model
 * - SCRIPTED: Sequence or table driven
 */
export type FidelityLevel = 'HIGH' | 'MEDIUM' | 'SCRIPTED';

/**
 * Standard telemetry and subsystem alert levels.
 */
export type AlertLevel = 'NOMINAL' | 'CAUTION' | 'WARNING' | 'CRITICAL';

/**
 * Deep space network link state between transit vehicle and Earth.
 */
export type LinkState = 'NOMINAL' | 'DEGRADED' | 'BLACKOUT' | 'OVERRIDE';

/**
 * Time acceleration warp presets (multiplier over real time).
 * 1x (1s/s), 10x, 60x (1m/s), 600x (10m/s), 3600x (1h/s), 86400x (1d/s), 604800x (7d/s).
 */
export type WarpPreset = 1 | 10 | 60 | 600 | 3600 | 86400 | 604800;

/**
 * 2D vector representation on the ecliptic plane.
 */
export interface Vec2 {
  x: number;
  y: number;
}

/**
 * 3D vector representation.
 */
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/**
 * Mission Elapsed Time representation broken down into components.
 */
export interface METTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  formatted: string;
}

/**
 * Vehicle kinematic and physical state.
 */
export interface ShipState {
  /** Heliocentric position in AU [x, y] */
  pos: [number, number];
  /** Heliocentric velocity in AU/day [vx, vy] */
  vel: [number, number];
  /** Current active mission phase */
  phase: MissionPhase;
  /** Attitude quaternion [w, x, y, z] */
  attitudeQuat: [number, number, number, number];
  /** Remaining delta-V capacity in m/s */
  deltaVRemaining: number;
  /** Current vehicle mass in kg (wet mass minus spent propellant) */
  mass: number;
}

// ============================================================================
// Telemetry & Sensors
// ============================================================================

/**
 * Monitored telemetry channel with alert limits and history buffer.
 */
export interface TelemetryChannel {
  id: string;
  name: string;
  value: number;
  unit: string;
  alertLevel: AlertLevel;
  cautionLow?: number;
  cautionHigh?: number;
  warningLow?: number;
  warningHigh?: number;
  fidelity: FidelityLevel;
  history: RingBuffer<number>;
  noiseσ: number;
  bias: number;
  quantization: number;
}

/**
 * Sensor reading after applying stochastic sensor modeling
 * (noise, bias, quantization, dropout, stuck values).
 */
export interface SensorReading {
  /** True uncorrupted physical simulation value */
  raw: number;
  /** Measured value after noise, bias, and quantization */
  measured: number;
  /** Sensor hardware operational status */
  status: 'OK' | 'DROPOUT' | 'STUCK';
  /** Simulation timestamp in Julian Date */
  timestamp: number;
}

/**
 * Subsystem health and channel aggregation.
 */
export interface SubsystemStatus {
  name: string;
  fidelity: FidelityLevel;
  alertLevel: AlertLevel;
  channels: TelemetryChannel[];
}

// ============================================================================
// Communications & DTN
// ============================================================================

/**
 * Deep space communication geometry and link performance metrics.
 */
export interface CommState {
  /** Heliocentric distance to Earth in AU */
  distanceAU: number;
  /** One-way light time in seconds */
  oneWayLightTimeSec: number;
  /** Round-trip light time in seconds */
  roundTripSec: number;
  /** Sun-Earth-Probe angle in degrees */
  thetaDeg: number;
  /** Communication link state */
  linkState: LinkState;
  /** Effective link data rate in bits per second */
  linkRateBps: number;
  /** Packet loss probability [0, 1] */
  packetLossProb: number;
  /** Whether operator has manually overridden link parameters */
  isOverridden: boolean;
  /** Delay applied during manual override in seconds */
  overrideDelaySec: number;
}

/**
 * Disruption-Tolerant Networking (DTN) bundle definition.
 */
export interface DtnBundle {
  bundleId: string;
  source: string;
  destination: string;
  creationTimeJD: number;
  ttlSeconds: number;
  priority: number;
  sizeBytes: number;
  payload: unknown;
  status: 'QUEUED' | 'TRANSMITTING' | 'DELIVERED' | 'EXPIRED';
}

// ============================================================================
// FSW, Safety Gate, & AI Diagnostic Proposals
// ============================================================================

/**
 * AI tier diagnostic or action proposal.
 * Per safety architecture: AI tier can ONLY PROPOSE, never actuate directly.
 */
export interface AiProposal {
  proposalId: string;
  timestampJD: number;
  faultClass: string;
  confidence: number;
  title: string;
  summary: string;
  recommendedAction: string;
  justification: string;
  requiresGroundAck: boolean;
  acceptedBySafetyGate?: boolean;
  executed?: boolean;
}

/**
 * Safety gate verification result for proposed commands/procedures.
 */
export interface SafetyGateVerification {
  procedureId: string;
  allowed: boolean;
  reason?: string;
  timestamp: number;
}

/**
 * Injectable fault description.
 */
export interface FaultDefinition {
  faultId: string;
  name: string;
  subsystem: string;
  description: string;
  severity: AlertLevel;
  params: Record<string, number>;
  active: boolean;
}

// ============================================================================
// Global Event Bus Event Map
// ============================================================================

/**
 * Typed event map for the global EventBus instance.
 */
export interface AegisEventMap extends Record<string, unknown> {
  'sim:tick': { dt: number; simTimeJD: number; warp: number };
  'sim:warpChanged': { warp: number; paused: boolean };
  'sim:phaseChanged': { from: MissionPhase; to: MissionPhase };
  'alert:raised': { subsystem: string; channel: string; level: AlertLevel; value: number; limit: number };
  'alert:cleared': { subsystem: string; channel: string };
  'fault:injected': { faultId: string; params: Record<string, number> };
  'fault:cleared': { faultId: string };
  'telemetry:update': {
    telemetry: Map<string, SensorReading>;
    alerts: { channel: string; subsystem: string; level: AlertLevel; value: number; limit: number }[];
  };
  'comm:stateChanged': CommState;
  'dtn:bundleSent': { bundleId: string; priority: number; size: number };
  'dtn:bundleReceived': { bundleId: string };
  'dtn:blackoutStart': { thetaDeg: number };
  'dtn:blackoutEnd': { thetaDeg: number };
  'fsw:safetyGateReject': { procedureId: string; reason: string };
  'fsw:safetyGateAccept': { procedureId: string };
  'ai:diagnosisReady': { faultClass: string; confidence: number };
  'memory:swapStarted': { phase: MissionPhase };
  'memory:swapComplete': { phase: MissionPhase; success: boolean };
  'memory:seuDetected': { moduleId: string };
  'render:frame': { fps: number };
}
