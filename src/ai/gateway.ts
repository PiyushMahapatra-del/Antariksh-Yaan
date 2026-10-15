/**
 * AEGIS TRANSIT — AI Gateway API
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * The ONLY communication interface between the AI Web Worker and the main thread.
 * All messages are schema-validated. AI stays unprivileged.
 * 
 * Fidelity: HIGH (enforced architectural boundary)
 */

/** Gateway message types from AI worker → main thread */
export type AIOutboundMessage =
  | { type: 'HEARTBEAT'; timestamp: number }
  | { type: 'QUERY_PROCEDURE'; procedureId: string }
  | { type: 'PROPOSE_ACTION'; procedureId: string; params: Record<string, number>; confidence: number; reasoning: string }
  | { type: 'ENQUEUE_DOWNLINK'; packet: DownlinkPacket }
  | { type: 'DIAGNOSIS_READY'; diagnosis: DiagnosisObject }
  | { type: 'TIER2_RESPONSE'; response: Tier2Response }
  | { type: 'MEDICAL_ASSESSMENT'; assessment: MedicalAssessment };

/** Gateway message types from main thread → AI worker */
export type AIInboundMessage =
  | { type: 'TELEMETRY_UPDATE'; channels: Record<string, number>; timestamp: number }
  | { type: 'PHASE_UPDATE'; phase: string; flags: Record<string, boolean> }
  | { type: 'FAULT_NOTIFICATION'; faultType: string; params: Record<string, number> }
  | { type: 'CREW_QUERY'; query: string; context: string }
  | { type: 'MEDICAL_INPUT'; symptoms: string[]; vitals: Record<string, number> }
  | { type: 'CONFIG_UPDATE'; configId: string; data: unknown }
  | { type: 'GATE_TIER2'; gated: boolean }
  | { type: 'FREEZE'; frozen: boolean };

/** Downlink packet for DTN */
export interface DownlinkPacket {
  id: string;
  priority: 0 | 1 | 2;
  type: string;
  payload: Record<string, unknown>;
  size: number;
  timestamp: number;
}

/** Tier 1 Diagnosis Object */
export interface DiagnosisObject {
  faultClass: string;
  confidence: number;
  oodScore: number;
  shapley: ShapleyValue[];
  similarCases: SimilarCase[];
  sensorHealth: SensorHealthReport[];
  counterfactuals: Counterfactual[];
  configId: string;
  inputHash: string;
  timestamp: number;
}

export interface ShapleyValue {
  feature: string;
  value: number;
  phi: number;         // Shapley value
  baseline: number;
}

export interface SimilarCase {
  caseId: string;
  similarity: number;
  faultClass: string;
  outcome: string;
  features: Record<string, number>;
}

export interface SensorHealthReport {
  sensorId: string;
  status: 'OK' | 'SUSPECT' | 'FAILED';
  reason: string;
}

export interface Counterfactual {
  description: string;
  actions: { procedureId: string; params: Record<string, number> }[];
  predictedOutcome: string;
  marginToLimit: number;
}

/** Tier 2 response */
export interface Tier2Response {
  blocks: Tier2Block[];
  configId: string;
  retrievalSource: string;
}

export interface Tier2Block {
  text: string;
  cites: string[];
  type: 'procedure' | 'explanation' | 'warning' | 'refusal';
}

/** Medical assessment */
export interface MedicalAssessment {
  differentials: { condition: string; likelihood: number; reasoning: string }[];
  recommendations: MedicalRecommendation[];
  decisionTreePath: { nodeId: string; decision: string; value: number }[];
  lookalikes: string[];
  requiresFlightSurgeonReview: boolean;
  synthetic: true; // Always true — this is SYNTHETIC data
}

export interface MedicalRecommendation {
  action: string;
  medication?: string;
  dose?: string;
  route?: string;
  notes: string;
  fromFormulary: boolean;
  requiresCMOConfirm: boolean;
}

/** Validate an outbound AI message against the schema */
export function validateAIMessage(msg: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!msg || typeof msg !== 'object') {
    return { valid: false, errors: ['Message must be a non-null object'] };
  }

  const m = msg as Record<string, unknown>;
  if (typeof m.type !== 'string') {
    errors.push('Message must have a string "type" field');
  }

  const validTypes = ['HEARTBEAT', 'QUERY_PROCEDURE', 'PROPOSE_ACTION', 'ENQUEUE_DOWNLINK', 'DIAGNOSIS_READY', 'TIER2_RESPONSE', 'MEDICAL_ASSESSMENT'];
  if (!validTypes.includes(m.type as string)) {
    errors.push(`Unknown message type: ${m.type}`);
  }

  if (m.type === 'PROPOSE_ACTION') {
    if (typeof m.procedureId !== 'string') errors.push('PROPOSE_ACTION requires procedureId string');
    if (typeof m.confidence !== 'number') errors.push('PROPOSE_ACTION requires confidence number');
  }

  if (m.type === 'DIAGNOSIS_READY') {
    const d = m.diagnosis as Record<string, unknown> | undefined;
    if (!d) errors.push('DIAGNOSIS_READY requires diagnosis object');
    else {
      if (typeof d.faultClass !== 'string') errors.push('diagnosis.faultClass must be string');
      if (typeof d.confidence !== 'number') errors.push('diagnosis.confidence must be number');
      if (typeof d.configId !== 'string') errors.push('diagnosis.configId must be string');
    }
  }

  return { valid: errors.length === 0, errors };
}
