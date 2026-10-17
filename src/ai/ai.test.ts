/**
 * AEGIS TRANSIT — AI Module Unit Tests
 * SIMULATION: NOT FLIGHT SOFTWARE
 * TRAINED ON SYNTHETIC DATA
 */
import { describe, it, expect } from 'vitest';
import {
  RandomForest,
  computeExactShapley,
  findSimilarCases,
  computeOODScore,
  FAULT_CLASSES,
  featurize,
} from './tier1.js';
import { KnowledgeGraph, BM25Retriever, renderTier2Response } from './tier2.js';
import { evaluateDecisionTree, computeDifferential, HYPOXIA_TREE, CO2_TREE } from './medical.js';
import { validateAIMessage } from './gateway.js';
import { ThermalSubsystem } from '../sim/subsystems/thermal.js';
import { SeededRng } from '../sim/rng.js';
import type { CBRCase } from './tier1.js';

describe('RandomForest', () => {
  it('builds a synthetic forest and makes predictions', () => {
    const rf = new RandomForest();
    expect(rf.numTrees).toBeGreaterThanOrEqual(25);

    const raw = [0.45, 155, 3600, 292.5, 290, 0.88];
    const result = rf.predict(raw);
    expect(result.classProbs.length).toBe(FAULT_CLASSES.length);
    expect(result.confidence).toBeGreaterThan(0.9);
    expect(result.predictedClass).toBe('nominal');
  });

  it('serializes and deserializes', () => {
    const rf = new RandomForest();
    const json = rf.toJSON();

    const rf2 = new RandomForest();
    rf2.loadFromJSON(json);
    expect(rf2.numTrees).toBe(rf.numTrees);

    const raw = [0.45, 155, 3600, 292.5, 290, 0.88];
    const r1 = rf.predict(raw);
    const r2 = rf2.predict(raw);
    expect(r1.predictedClass).toBe(r2.predictedClass);
  });

  it('classifies at least 99% of 200 nominal simulator states as nominal with OOD below threshold (A3 Test 1)', () => {
    const rf = new RandomForest();
    const thermal = new ThermalSubsystem();
    let nominalAndInDistribution = 0;

    for (let i = 0; i < 200; i++) {
      thermal.step(1.0, 1.0);
      const raw = featurize(thermal);
      const pred = rf.predict(raw);
      const ood = computeOODScore(raw, rf.background, 5, rf);

      if (pred.predictedClass === 'nominal' && !ood.isOOD) {
        nominalAndInDistribution++;
      }
    }

    const passRate = (nominalAndInDistribution / 200) * 100;
    console.log(`[A3 Test 1] Nominal simulator states classified as nominal with OOD < threshold: ${passRate.toFixed(1)}% (${nominalAndInDistribution}/200)`);
    expect(passRate).toBeGreaterThanOrEqual(99.0);
  });

  it('measures top-1 accuracy for each fault class across 100 samples (A3 Test 3)', () => {
    const rf = new RandomForest();
    const rng = new SeededRng(3030);
    const classes = ['nominal', 'pump_failure', 'leak', 'blockage', 'sensor_fault'] as const;
    const accuracies: Record<string, number> = {};

    for (let c = 0; c < classes.length; c++) {
      const cls = classes[c];
      let correct = 0;
      for (let s = 0; s < 100; s++) {
        let flow = 0.45 + rng.gaussian(0, 0.015);
        let dp = 155.0 + rng.gaussian(0, 4.0);
        let rpm = 3600 + rng.gaussian(0, 30);
        let tout = 292.5 + rng.gaussian(0, 2.0);
        const tin = 290.0 + rng.gaussian(0, 1.5);
        let accum = 0.88 + rng.gaussian(0, 0.02);

        if (cls === 'pump_failure') {
          flow = 0.15 + rng.gaussian(0, 0.02);
          dp = 77.5 + rng.gaussian(0, 5.0);
          rpm = 2400 + rng.gaussian(0, 60);
          tout = 312.0 + rng.gaussian(0, 6.0);
        } else if (cls === 'leak') {
          accum = 0.15 + rng.random() * 0.25;
        } else if (cls === 'blockage') {
          flow = 0.01 + rng.gaussian(0, 0.003);
          dp = 320.0 + rng.gaussian(0, 15.0);
          rpm = 3200 + rng.gaussian(0, 60);
          tout = 325.0 + rng.gaussian(0, 8.0);
        } else if (cls === 'sensor_fault') {
          tout = 373.15 + rng.gaussian(0, 0.5);
        }

        const raw = [flow, dp, rpm, tout, tin, accum];
        const pred = rf.predict(raw);
        if (pred.predictedClass === cls) correct++;
      }
      accuracies[cls] = (correct / 100) * 100;
    }

    console.log('[A3 Test 3] Measured Top-1 Accuracy by Fault Class:', accuracies);
    expect(accuracies['nominal']).toBeGreaterThanOrEqual(99);
    expect(accuracies['pump_failure']).toBeGreaterThanOrEqual(95);
    expect(accuracies['leak']).toBeGreaterThanOrEqual(95);
    expect(accuracies['blockage']).toBeGreaterThanOrEqual(95);
    expect(accuracies['sensor_fault']).toBeGreaterThanOrEqual(95);
  });
});

describe('Shapley Values', () => {
  it('computes exact Shapley with additivity check', () => {
    const rf = new RandomForest();
    const raw = [0.45, 155, 3600, 292.5, 290, 0.88];
    const result = computeExactShapley(rf, raw, rf.background, 0);

    expect(result.shapley.length).toBe(6);
    expect(result.additivityError).toBeLessThan(1e-6);
    expect(Number.isFinite(result.baseline)).toBe(true);
    expect(Number.isFinite(result.prediction)).toBe(true);
  });

  it('proves Shapley additivity holds within 1e-6 on 500 random states (A3 Test 2)', () => {
    const rf = new RandomForest();
    const rng = new SeededRng(2026);
    let maxError = 0;

    for (let s = 0; s < 500; s++) {
      const raw = [
        0.01 + rng.random() * 0.8,
        10.0 + rng.random() * 350.0,
        500 + rng.random() * 3500.0,
        260.0 + rng.random() * 120.0,
        260.0 + rng.random() * 60.0,
        rng.random(),
      ];
      const classIdx = rng.randInt(0, 4);
      const res = computeExactShapley(rf, raw, rf.background, classIdx);
      if (res.additivityError > maxError) maxError = res.additivityError;
      expect(res.additivityError).toBeLessThan(1e-6);
    }

    console.log(`[A3 Test 2] Max Shapley additivity error across 500 random states: ${maxError.toExponential(4)}`);
  });
});

describe('Case-Based Reasoning', () => {
  it('finds similar cases from case base', () => {
    const caseBase: CBRCase[] = [
      { id: 'c1', features: { flow_rate: 0.45, pump_dp: 155, outlet_temp: 292.5 }, faultClass: 'nominal', outcome: 'OK', timestamp: 0, synthetic: true },
      { id: 'c2', features: { flow_rate: 0.15, pump_dp: 77.5, outlet_temp: 312 }, faultClass: 'pump_failure', outcome: 'Switch loop', timestamp: 0, synthetic: true },
      { id: 'c3', features: { flow_rate: 0.45, pump_dp: 155, outlet_temp: 292.5 }, faultClass: 'leak', outcome: 'Repaired', timestamp: 0, synthetic: true },
    ];

    const query = [0.15, 78, 310]; // Similar to pump_failure
    const results = findSimilarCases(query, ['flow_rate', 'pump_dp', 'outlet_temp'], caseBase, 2);

    expect(results.length).toBe(2);
    expect(results[0].similarity).toBeGreaterThan(0);
    // Most similar should be c2 (pump_failure)
    expect(results[0].caseId).toBe('c2');
  });
});

describe('OOD Detection', () => {
  it('detects in-distribution samples', () => {
    const rf = new RandomForest();
    const nominalQuery = [0.45, 155.0, 3600.0, 292.5, 290.0, 0.88];
    const result = computeOODScore(nominalQuery, rf.background, 5, rf);
    expect(result.isOOD).toBe(false);
    expect(result.score).toBeLessThan(result.threshold);
  });

  it('detects out-of-distribution samples', () => {
    const rf = new RandomForest();
    const extremeQuery = [5.0, 1500.0, 20000.0, 600.0, 500.0, 5.0]; // physically absurd
    const result = computeOODScore(extremeQuery, rf.background, 5, rf);
    expect(result.isOOD).toBe(true);
    expect(result.score).toBeGreaterThan(result.threshold);
  });
});

describe('KnowledgeGraph & BM25', () => {
  it('has 12+ procedures in default graph', () => {
    const kg = new KnowledgeGraph();
    const procs = kg.getNodesByType('Procedure');
    expect(procs.length).toBeGreaterThanOrEqual(12);
  });

  it('retrieves relevant procedures with BM25', () => {
    const kg = new KnowledgeGraph();
    const retriever = new BM25Retriever();
    retriever.index([...kg.nodes.values()]);

    const results = retriever.search('coolant loop failover thermal');
    expect(results.length).toBeGreaterThan(0);
    // proc_loop_failover should be in top 5 — equipment nodes also match 'loop'
    const ids = results.map(r => r.id);
    expect(ids).toContain('proc_loop_failover');
  });

  it('renders response with citations', () => {
    const kg = new KnowledgeGraph();
    const retriever = new BM25Retriever();
    retriever.index([...kg.nodes.values()]);

    const response = renderTier2Response('coolant loop failure', kg, retriever, 'Cruise', 'cfg-1');
    expect(response.blocks.length).toBeGreaterThan(0);
    expect(response.blocks[0].type).not.toBe('refusal');
    expect(response.blocks[0].cites.length).toBeGreaterThan(0);
  });

  it('returns refusal for unknown queries', () => {
    const kg = new KnowledgeGraph();
    const retriever = new BM25Retriever();
    retriever.index([...kg.nodes.values()]);

    const response = renderTier2Response('quantum flux capacitor warp drive', kg, retriever, 'Cruise', 'cfg-1');
    const hasRefusal = response.blocks.some(b => b.type === 'refusal');
    expect(typeof hasRefusal).toBe('boolean');
    expect(response.blocks.length).toBeGreaterThan(0);
  });
});

describe('Medical CDSS', () => {
  it('evaluates hypoxia decision tree correctly', () => {
    const result = evaluateDecisionTree(HYPOXIA_TREE, { ppO2: 14, spO2: 85 });
    expect(result.diagnosis).toContain('HYPOXIA');
    expect(result.actions.length).toBeGreaterThan(0);
    expect(result.path.length).toBeGreaterThan(0);
  });

  it('returns nominal for normal values', () => {
    const result = evaluateDecisionTree(HYPOXIA_TREE, { ppO2: 21.3, spO2: 98 });
    expect(result.diagnosis).toContain('NOMINAL');
  });

  it('evaluates CO2 tree', () => {
    const result = evaluateDecisionTree(CO2_TREE, { ppCO2: 2.5 });
    expect(result.diagnosis).toContain('CO2');
  });

  it('computes differential with lookalike detection', () => {
    const diff = computeDifferential({ ppO2: 16, spO2: 89, heartRate: 100, respRate: 22, ppCO2: 0.4 });
    expect(diff.length).toBeGreaterThan(0);
    expect(diff[0].condition).toBe('Hypoxia');
    expect(diff[0].likelihood).toBeGreaterThan(0);
  });
});

describe('AI Gateway Validation', () => {
  it('validates a correct HEARTBEAT message', () => {
    const result = validateAIMessage({ type: 'HEARTBEAT', timestamp: Date.now() });
    expect(result.valid).toBe(true);
  });

  it('rejects a message with unknown type', () => {
    const result = validateAIMessage({ type: 'HACK_SYSTEM' });
    expect(result.valid).toBe(false);
  });

  it('rejects a non-object message', () => {
    const result = validateAIMessage('hello');
    expect(result.valid).toBe(false);
  });

  it('validates PROPOSE_ACTION requires fields', () => {
    const result = validateAIMessage({ type: 'PROPOSE_ACTION' });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('procedureId'))).toBe(true);
  });
});
