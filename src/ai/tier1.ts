/**
 * AEGIS TRANSIT — Tier 1 AI: Random Forest Classifier & Diagnostics
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * TRAINED ON SYNTHETIC DATA
 * 
 * Implements a random forest classifier for thermal fault diagnostics,
 * EXACT Shapley values, case-based reasoning, counterfactuals, and OOD detection.
 * 
 * Fidelity: HIGH (real ML inference, exact explanations)
 */

import { SeededRng } from '../sim/rng.js';
import type { DiagnosisObject, ShapleyValue, SimilarCase, SensorHealthReport, Counterfactual } from './gateway.js';
export type { ShapleyValue } from './gateway.js';
import rawModelData from '../../data/model.json';

// ============================================================================
// FAULT CLASSES & PHYSICAL FEATURE SPECS
// ============================================================================

/** Fault classes */
export const FAULT_CLASSES = ['nominal', 'pump_failure', 'leak', 'blockage', 'sensor_fault', 'unknown'] as const;
export type FaultClass = typeof FAULT_CLASSES[number];

/** Feature names for the thermal domain */
export const THERMAL_FEATURES = [
  'flow_rate',
  'pump_dp',
  'pump_rpm',
  'outlet_temp',
  'inlet_temp',
  'accumulator_level',
] as const;
export type ThermalFeature = typeof THERMAL_FEATURES[number];

export const FEATURE_UNITS: Record<string, string> = {
  flow_rate: 'kg/s',
  pump_dp: 'kPa',
  pump_rpm: 'RPM',
  outlet_temp: 'K',
  inlet_temp: 'K',
  accumulator_level: 'frac',
};

export interface StandardizationParams {
  means: number[];
  stds: number[];
}

/** Default empirical means and standard deviations for nominal physical operations */
export const DEFAULT_STANDARDIZATION: StandardizationParams = {
  means: [0.45, 155.0, 3600.0, 292.5, 290.0, 0.88],
  stds: [0.02, 5.0, 50.0, 3.0, 2.0, 0.03],
};

// ============================================================================
// SINGLE FEATURIZE & STANDARDIZE PIPELINE
// ============================================================================

/**
 * Universal featurize function: extracts the 6 physical thermal features
 * from telemetry maps, subsystem state objects, or raw vectors.
 */
export function featurize(state: unknown): number[] {
  if (Array.isArray(state)) {
    return state.slice(0, 6).map(v => typeof v === 'number' && Number.isFinite(v) ? v : 0);
  }

  if (state instanceof Map) {
    const flow = state.get('thermal_loopA_flow')?.measured ?? 0.45;
    const dp = state.get('thermal_loopA_pumpDeltaP')?.measured
      ?? state.get('thermal_loopA_pressure')?.measured
      ?? 155.0;
    const rpm = state.get('thermal_loopA_pumpRpm')?.measured ?? 3600.0;
    const tout = state.get('thermal_loopA_tempOut')?.measured ?? 292.5;
    const tin = state.get('thermal_loopA_tempIn')?.measured ?? 290.0;
    const rawAccum = state.get('thermal_loopA_accum')?.measured ?? 88.0;
    const accum = rawAccum > 1.0 ? rawAccum / 100.0 : rawAccum;

    return [flow, dp, rpm, tout, tin, accum];
  }

  if (state && typeof state === 'object') {
    const s = state as Record<string, unknown>;
    if ('loopA' in s) {
      return featurize(s.loopA);
    }
    if ('flowRate' in s && 'pumpDeltaP' in s) {
      const loop = s as { flowRate?: number; pumpDeltaP?: number; pumpRpm?: number; coolantTempOut?: number; coolantTempIn?: number; accumulatorLevel?: number };
      const accum = (loop.accumulatorLevel ?? 0.88) > 1.0 ? (loop.accumulatorLevel! / 100.0) : (loop.accumulatorLevel ?? 0.88);
      return [
        loop.flowRate ?? 0.45,
        loop.pumpDeltaP ?? 155.0,
        loop.pumpRpm ?? 3600.0,
        loop.coolantTempOut ?? 292.5,
        loop.coolantTempIn ?? 290.0,
        accum,
      ];
    }
    const rec = s as Record<string, number | undefined>;
    const flow = rec.flow_rate ?? rec.flowRate ?? 0.45;
    const dp = rec.pump_dp ?? rec.pumpDeltaP ?? rec.pump_pressure ?? 155.0;
    const rpm = rec.pump_rpm ?? rec.pumpRpm ?? 3600.0;
    const tout = rec.outlet_temp ?? rec.coolantTempOut ?? 292.5;
    const tin = rec.inlet_temp ?? rec.coolantTempIn ?? 290.0;
    let accum = rec.accumulator_level ?? rec.accumulatorLevel ?? 0.88;
    if (accum > 1.0) accum = accum / 100.0;

    return [flow, dp, rpm, tout, tin, accum];
  }

  return [0.45, 155.0, 3600.0, 292.5, 290.0, 0.88];
}

/**
 * Standardize features: z = (x - mean) / std.
 */
export function standardize(
  features: number[],
  means: number[] = DEFAULT_STANDARDIZATION.means,
  stds: number[] = DEFAULT_STANDARDIZATION.stds
): number[] {
  return features.map((val, i) => {
    const mean = means[i] ?? 0;
    const std = stds[i] && stds[i] > 0 ? stds[i] : 1;
    return (val - mean) / std;
  });
}

// ============================================================================
// RANDOM FOREST CLASSIFIER (CART DECISION TREES)
// ============================================================================

/** A single decision tree node */
export interface TreeNode {
  featureIndex: number;
  threshold: number;
  left: TreeNode | null;
  right: TreeNode | null;
  classProbs: number[] | null; // leaf: probability distribution over classes
}

export interface ModelArtifact {
  features?: string[];
  units?: string[];
  standardization?: StandardizationParams;
  trees: TreeNode[];
  background?: number[][];
}

/**
 * Recursive CART decision tree training on standardized data using Gini impurity.
 */
function trainCARTNode(
  samples: { features: number[]; classIdx: number }[],
  maxDepth: number,
  minSamplesLeaf: number,
  rng: SeededRng,
  featuresPerSplit: number = 4
): TreeNode {
  const nClasses = FAULT_CLASSES.length;
  const nSamples = samples.length;

  // Calculate class probabilities
  const classCounts = new Array(nClasses).fill(0);
  for (const s of samples) {
    if (s.classIdx >= 0 && s.classIdx < nClasses) {
      classCounts[s.classIdx]++;
    }
  }
  const classProbs = classCounts.map(c => nSamples > 0 ? c / nSamples : 0);

  const isPure = classCounts.filter(c => c > 0).length <= 1;
  if (maxDepth <= 0 || nSamples <= minSamplesLeaf || isPure) {
    return { featureIndex: 0, threshold: 0, left: null, right: null, classProbs };
  }

  // Feature subspace selection
  const allIndices = [0, 1, 2, 3, 4, 5];
  for (let i = allIndices.length - 1; i > 0; i--) {
    const j = rng.randInt(0, i);
    [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]];
  }
  const candidateFeatures = allIndices.slice(0, featuresPerSplit);

  let bestGini = Infinity;
  let bestFeature = -1;
  let bestThreshold = 0;
  let bestLeft: typeof samples = [];
  let bestRight: typeof samples = [];

  for (const fIdx of candidateFeatures) {
    const values = samples.map(s => s.features[fIdx]).sort((a, b) => a - b);
    if (values[0] === values[values.length - 1]) continue;

    // Test candidate split thresholds
    const step = Math.max(1, Math.floor(values.length / 12));
    for (let k = step; k < values.length; k += step) {
      const thresh = (values[k - 1] + values[k]) / 2;
      const left: typeof samples = [];
      const right: typeof samples = [];

      for (const s of samples) {
        if (s.features[fIdx] <= thresh) left.push(s);
        else right.push(s);
      }

      if (left.length < minSamplesLeaf || right.length < minSamplesLeaf) continue;

      const giniLeft = computeGini(left, nClasses);
      const giniRight = computeGini(right, nClasses);
      const weightedGini = (left.length / nSamples) * giniLeft + (right.length / nSamples) * giniRight;

      if (weightedGini < bestGini) {
        bestGini = weightedGini;
        bestFeature = fIdx;
        bestThreshold = thresh;
        bestLeft = left;
        bestRight = right;
      }
    }
  }

  if (bestFeature === -1 || bestLeft.length === 0 || bestRight.length === 0) {
    return { featureIndex: 0, threshold: 0, left: null, right: null, classProbs };
  }

  return {
    featureIndex: bestFeature,
    threshold: bestThreshold,
    left: trainCARTNode(bestLeft, maxDepth - 1, minSamplesLeaf, rng, featuresPerSplit),
    right: trainCARTNode(bestRight, maxDepth - 1, minSamplesLeaf, rng, featuresPerSplit),
    classProbs: null,
  };
}

function computeGini(samples: { classIdx: number }[], nClasses: number): number {
  const counts = new Array(nClasses).fill(0);
  for (const s of samples) counts[s.classIdx]++;
  const n = samples.length;
  let sumSq = 0;
  for (let c = 0; c < nClasses; c++) {
    const p = counts[c] / n;
    sumSq += p * p;
  }
  return 1 - sumSq;
}

/**
 * Random Forest Classifier.
 * 30-60 trees, depth <= 8. Trained on standardized thermal features.
 */
export class RandomForest {
  private trees: TreeNode[] = [];
  private _nClasses: number = FAULT_CLASSES.length;
  public standardization: StandardizationParams = { ...DEFAULT_STANDARDIZATION };
  public background: number[][] = [];

  constructor() {
    const data = rawModelData as unknown as ModelArtifact;
    if (data && data.trees && data.trees.length > 0) {
      this.loadFromJSON(data);
    } else {
      this.buildSyntheticForest(30, 6, 42);
    }
  }

  get numTrees(): number { return this.trees.length; }
  get numClasses(): number { return this._nClasses; }

  /** Standardize raw features using model standardization parameters */
  standardize(rawFeatures: number[]): number[] {
    return standardize(rawFeatures, this.standardization.means, this.standardization.stds);
  }

  /** Build and train forest from physics-aligned synthetic samples */
  buildSyntheticForest(nTrees: number = 30, maxDepth: number = 6, seed: number = 42): void {
    const rng = new SeededRng(seed);
    const samplesPerClass = 200;
    const allSamples: { features: number[]; classIdx: number }[] = [];

    // Synthesize physical samples
    for (let c = 0; c < 5; c++) {
      for (let s = 0; s < samplesPerClass; s++) {
        let flow = 0.45 + rng.gaussian(0, 0.015);
        let dp = 155.0 + rng.gaussian(0, 4.0);
        let rpm = 3600 + rng.gaussian(0, 30);
        let tout = 292.5 + rng.gaussian(0, 2.0);
        const tin = 290.0 + rng.gaussian(0, 1.5);
        let accum = 0.88 + rng.gaussian(0, 0.02);

        if (c === 1) { // pump_failure
          flow = 0.15 + rng.gaussian(0, 0.02);
          dp = 77.5 + rng.gaussian(0, 5.0);
          rpm = 2400 + rng.gaussian(0, 60);
          tout = 312.0 + rng.gaussian(0, 6.0);
        } else if (c === 2) { // leak
          accum = 0.15 + rng.random() * 0.25;
        } else if (c === 3) { // blockage
          flow = 0.01 + rng.gaussian(0, 0.003);
          dp = 320.0 + rng.gaussian(0, 15.0);
          rpm = 3200 + rng.gaussian(0, 60);
          tout = 325.0 + rng.gaussian(0, 8.0);
        } else if (c === 4) { // sensor_fault
          tout = 373.15 + rng.gaussian(0, 0.5);
        }

        const raw = [flow, dp, rpm, tout, tin, accum];
        const std = this.standardize(raw);
        allSamples.push({ features: std, classIdx: c });
      }
    }

    // Train trees
    this.trees = [];
    const n = allSamples.length;
    for (let t = 0; t < nTrees; t++) {
      const bag: typeof allSamples = [];
      for (let i = 0; i < n; i++) {
        bag.push(allSamples[rng.randInt(0, n - 1)]);
      }
      this.trees.push(trainCARTNode(bag, maxDepth, 4, rng, 4));
    }

    // Build nominal standardized background dataset
    this.background = [];
    for (let i = 0; i < 30; i++) {
      const rawNominal = [
        0.45 + rng.gaussian(0, 0.015),
        155.0 + rng.gaussian(0, 4.0),
        3600 + rng.gaussian(0, 30),
        292.5 + rng.gaussian(0, 2.0),
        290.0 + rng.gaussian(0, 1.5),
        0.88 + rng.gaussian(0, 0.02),
      ];
      this.background.push(this.standardize(rawNominal));
    }
  }

  /** Predict class probabilities for a feature vector (raw or standardized) */
  predict(features: number[], isStandardized: boolean = false): { classProbs: number[]; predictedClass: FaultClass; confidence: number } {
    const stdFeatures = isStandardized ? features : this.standardize(features);
    return this.predictStandardized(stdFeatures);
  }

  /** Direct inference on standardized features */
  predictStandardized(stdFeatures: number[]): { classProbs: number[]; predictedClass: FaultClass; confidence: number } {
    if (this.trees.length === 0) {
      return { classProbs: Array(this._nClasses).fill(1 / this._nClasses), predictedClass: 'unknown', confidence: 0 };
    }

    const avgProbs = Array(this._nClasses).fill(0);
    for (const tree of this.trees) {
      const probs = this._traverseTree(tree, stdFeatures);
      if (probs) {
        for (let i = 0; i < this._nClasses; i++) {
          avgProbs[i] += probs[i] / this.trees.length;
        }
      }
    }

    let maxIdx = 0;
    for (let i = 1; i < avgProbs.length; i++) {
      if (avgProbs[i] > avgProbs[maxIdx]) maxIdx = i;
    }

    return {
      classProbs: avgProbs,
      predictedClass: FAULT_CLASSES[maxIdx],
      confidence: avgProbs[maxIdx],
    };
  }

  /** High-level diagnosis on raw state or features */
  diagnose(state: unknown): { faultClass: FaultClass; confidence: number; classProbs: number[]; oodScore: number } {
    const raw = featurize(state);
    const std = this.standardize(raw);
    const pred = this.predict(std);
    const ood = computeOODScore(raw, this.background, 5, this);
    return {
      faultClass: pred.predictedClass as FaultClass,
      confidence: pred.confidence,
      classProbs: pred.classProbs,
      oodScore: ood.score,
    };
  }

  /** Load forest from serialized JSON */
  loadFromJSON(data: ModelArtifact): void {
    if (data.trees) this.trees = data.trees;
    if (data.standardization) this.standardization = data.standardization;
    if (data.background) this.background = data.background;
  }

  /** Serialize forest to JSON */
  toJSON(): ModelArtifact {
    return {
      features: [...THERMAL_FEATURES],
      units: Object.values(FEATURE_UNITS),
      standardization: this.standardization,
      trees: this.trees,
      background: this.background,
    };
  }

  private _traverseTree(node: TreeNode, features: number[]): number[] | null {
    if (node.classProbs !== null) return node.classProbs;
    if (node.left === null || node.right === null) return null;

    if (features[node.featureIndex] <= node.threshold) {
      return this._traverseTree(node.left, features);
    } else {
      return this._traverseTree(node.right, features);
    }
  }
}

// ============================================================================
// EXACT SHAPLEY VALUES (EFFICIENCY-PRESERVING INTERVENTIONAL TreeSHAP)
// ============================================================================

/**
 * Compute EXACT Shapley values for a physical feature vector.
 * Sum(phi) + baseline = prediction (efficiency invariant preserved < 1e-6).
 */
export function computeExactShapley(
  model: RandomForest,
  rawFeatures: number[],
  background?: number[][],
  classIdx: number = 0
): { shapley: ShapleyValue[]; baseline: number; prediction: number; additivityError: number } {
  const n = Math.min(rawFeatures.length, 6);
  const nCoalitions = 1 << n; // 2^6 = 64
  const bg = background && background.length > 0 ? background : model.background;
  const nBackground = Math.min(bg && bg.length > 0 ? bg.length : 1, 30);
  const bgData = bg && bg.length > 0 ? bg : [new Array(n).fill(0)];

  const stdFeatures = model.standardize(rawFeatures.slice(0, n));
  const prediction = model.predictStandardized(stdFeatures).classProbs[classIdx];

  // Precompute coalition weights
  const weights = new Float64Array(n);
  for (let s = 0; s < n; s++) {
    weights[s] = (factorial(s) * factorial(n - s - 1)) / factorial(n);
  }

  // Precompute v(S) for each coalition across background
  const v = new Float64Array(nCoalitions);
  const inputBuffer = new Float64Array(n);

  for (let S = 0; S < nCoalitions; S++) {
    let sum = 0;
    for (let b = 0; b < nBackground; b++) {
      const bg = bgData[b];
      for (let i = 0; i < n; i++) {
        inputBuffer[i] = (S & (1 << i)) ? stdFeatures[i] : (bg ? bg[i] : 0);
      }
      sum += model.predictStandardized(Array.from(inputBuffer)).classProbs[classIdx];
    }
    v[S] = sum / nBackground;
  }

  const baseline = v[0];
  const phi = new Float64Array(n);

  for (let i = 0; i < n; i++) {
    const bitI = 1 << i;
    let phiI = 0;
    for (let S = 0; S < nCoalitions; S++) {
      if (S & bitI) continue;
      const sizeS = countBits(S);
      phiI += weights[sizeS] * (v[S | bitI] - v[S]);
    }
    phi[i] = phiI;
  }

  const phiSum = phi.reduce((a, b) => a + b, 0);
  const additivityError = Math.abs(phiSum + baseline - prediction);

  const shapley: ShapleyValue[] = Array.from(phi).map((p, i) => ({
    feature: THERMAL_FEATURES[i] ?? `feature_${i}`,
    value: rawFeatures[i],
    phi: p,
    baseline,
  }));

  return { shapley, baseline, prediction, additivityError };
}

function countBits(n: number): number {
  let count = 0;
  while (n) { count += n & 1; n >>= 1; }
  return count;
}

function factorial(n: number): number {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

// ============================================================================
// CASE-BASED REASONING
// ============================================================================

export interface CBRCase {
  id: string;
  features: Record<string, number>;
  faultClass: string;
  outcome: string;
  timestamp: number;
  synthetic: boolean;
}

export function findSimilarCases(
  query: number[],
  featureNames: string[],
  caseBase: CBRCase[],
  k: number = 3
): SimilarCase[] {
  if (caseBase.length === 0) return [];

  const scored = caseBase.map(c => {
    const caseFeatures = featureNames.map(f => c.features[f] ?? 0);
    const dist = euclideanDistance(query, caseFeatures);
    const similarity = 1 / (1 + dist);
    return { case: c, similarity };
  });

  scored.sort((a, b) => b.similarity - a.similarity);

  return scored.slice(0, k).map(s => ({
    caseId: s.case.id,
    similarity: s.similarity,
    faultClass: s.case.faultClass,
    outcome: s.case.outcome,
    features: s.case.features,
  }));
}

function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = (a[i] ?? 0) - (b[i] ?? 0);
    sum += d * d;
  }
  return Math.sqrt(sum);
}

// ============================================================================
// OUT-OF-DISTRIBUTION (OOD) DETECTION
// ============================================================================

export function computeOODScore(
  features: number[],
  background: number[][],
  k: number = 5,
  model?: RandomForest
): { score: number; isOOD: boolean; threshold: number } {
  const threshold = 3.5;
  const bgData = background && background.length > 0 ? background : (model ? model.background : []);
  if (!bgData || bgData.length === 0) {
    return { score: 0, isOOD: false, threshold };
  }

  const stdQuery = model ? model.standardize(features) : features;
  const distances = bgData.map(sample => euclideanDistance(stdQuery, sample));
  distances.sort((a, b) => a - b);

  const kDistances = distances.slice(0, Math.min(k, distances.length));
  const avgDist = kDistances.reduce((a, b) => a + b, 0) / kDistances.length;

  return { score: avgDist, isOOD: avgDist > threshold, threshold };
}

// ============================================================================
// SENSOR HEALTH CHECKS
// ============================================================================

export function checkSensorHealth(
  current: Record<string, number>,
  history: Record<string, number[]>
): SensorHealthReport[] {
  const reports: SensorHealthReport[] = [];

  for (const [sensorId, value] of Object.entries(current)) {
    const hist = history[sensorId] ?? [];
    let status: 'OK' | 'SUSPECT' | 'FAILED' = 'OK';
    let reason = 'Normal operation';

    if (hist.length >= 10) {
      const allSame = hist.slice(-10).every(v => v === value);
      if (allSame) {
        status = 'SUSPECT';
        reason = 'Sensor appears stuck at constant value';
      }
    }

    if (!Number.isFinite(value)) {
      status = 'FAILED';
      reason = 'Non-finite value detected';
    }

    reports.push({ sensorId, status, reason });
  }

  return reports;
}

// ============================================================================
// COUNTERFACTUAL SEARCH
// ============================================================================

export function searchCounterfactuals(
  currentFeatures: number[],
  model: RandomForest,
  limits: { featureIdx: number; limitValue: number }[]
): Counterfactual[] {
  const counterfactuals: Counterfactual[] = [];
  const controllableIdx = [0, 5]; // flow_rate and accumulator_level

  for (const idx of controllableIdx) {
    const original = currentFeatures[idx];
    const steps = [original * 0.5, original * 0.75, original * 1.25, original * 1.5];

    for (const newVal of steps) {
      const modified = [...currentFeatures];
      modified[idx] = newVal;

      const result = model.predict(modified);
      if (result.predictedClass === 'nominal' && result.confidence > 0.5) {
        const margin = limits.length > 0
          ? Math.min(...limits.map(l => Math.abs(modified[l.featureIdx] - l.limitValue)))
          : result.confidence;

        counterfactuals.push({
          description: `Adjust ${THERMAL_FEATURES[idx]} to ${newVal.toFixed(2)}`,
          actions: [{ procedureId: 'PROC_LOOP_SWITCH', params: { [THERMAL_FEATURES[idx]]: newVal } }],
          predictedOutcome: `Nominal (${(result.confidence * 100).toFixed(1)}% confidence)`,
          marginToLimit: margin,
        });
      }
    }
  }

  counterfactuals.sort((a, b) => b.marginToLimit - a.marginToLimit);
  return counterfactuals.slice(0, 5);
}

// ============================================================================
// FULL TIER 1 DIAGNOSIS
// ============================================================================

export function runTier1Diagnosis(
  featuresInput: unknown,
  model: RandomForest,
  background: number[][],
  caseBase: CBRCase[],
  sensorValues: Record<string, number>,
  sensorHistory: Record<string, number[]>,
  configId: string
): DiagnosisObject {
  const rawFeatures = featurize(featuresInput);
  const prediction = model.predict(rawFeatures);
  const bgData = background && background.length > 0 ? background : model.background;
  const ood = computeOODScore(rawFeatures, bgData, 5, model);

  const classIdx = FAULT_CLASSES.indexOf(prediction.predictedClass);
  const shapleyResult = computeExactShapley(model, rawFeatures, bgData, classIdx >= 0 ? classIdx : 0);

  const featureNames = THERMAL_FEATURES.slice(0, rawFeatures.length) as unknown as string[];
  const similarCases = findSimilarCases(rawFeatures, featureNames, caseBase, 3);
  const sensorHealth = checkSensorHealth(sensorValues, sensorHistory);
  const counterfactuals = searchCounterfactuals(rawFeatures, model, [
    { featureIdx: 3, limitValue: 340 }, // outlet_temp warning
  ]);

  const inputHash = rawFeatures.map(f => f.toFixed(6)).join(',');
  const faultClass = ood.isOOD ? 'unknown' : prediction.predictedClass;
  const confidence = ood.isOOD ? 0 : prediction.confidence;

  return {
    faultClass,
    confidence,
    oodScore: ood.score,
    shapley: shapleyResult.shapley,
    similarCases,
    sensorHealth,
    counterfactuals,
    configId,
    inputHash,
    timestamp: Date.now(),
  };
}
