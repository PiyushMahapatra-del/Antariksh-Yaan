/**
 * AEGIS TRANSIT — AI Module Index
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * AI tier can only PROPOSE. No path to actuators except through the safety gate.
 * This module runs in a Web Worker (isolated from Tier 0 FSW).
 */

export { validateAIMessage } from './gateway.js';
export type {
  AIOutboundMessage, AIInboundMessage,
  DiagnosisObject, ShapleyValue, SimilarCase, SensorHealthReport, Counterfactual,
  DownlinkPacket, Tier2Response, Tier2Block,
  MedicalAssessment, MedicalRecommendation,
} from './gateway.js';

export {
  RandomForest, FAULT_CLASSES, THERMAL_FEATURES,
  computeExactShapley, findSimilarCases, computeOODScore, checkSensorHealth,
  searchCounterfactuals, runTier1Diagnosis,
} from './tier1.js';
export type { TreeNode, FaultClass, CBRCase } from './tier1.js';

export {
  KnowledgeGraph, BM25Retriever, renderTier2Response,
} from './tier2.js';
export type { KGNode, KGEdge, KGNodeType } from './tier2.js';

export {
  evaluateDecisionTree, computeDifferential, runMedicalAssessment,
  HYPOXIA_TREE, CO2_TREE, DECOMPRESSION_TREE,
  MEDICAL_CPT, SYNTHETIC_FORMULARY,
} from './medical.js';
export type { DecisionTreeNode, CPTEntry, FormularyEntry } from './medical.js';
