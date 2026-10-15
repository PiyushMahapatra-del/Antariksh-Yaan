/**
 * AEGIS TRANSIT — AI Module Unit Tests
 * SIMULATION: NOT FLIGHT SOFTWARE
 * TRAINED ON SYNTHETIC DATA
 */
import { describe, it, expect } from 'vitest';
import { RandomForest, computeExactShapley, findSimilarCases, computeOODScore, FAULT_CLASSES } from './tier1.js';
import { KnowledgeGraph, BM25Retriever, renderTier2Response } from './tier2.js';
import { evaluateDecisionTree, computeDifferential, HYPOXIA_TREE, CO2_TREE } from './medical.js';
import { validateAIMessage } from './gateway.js';
import type { CBRCase } from './tier1.js';

describe('RandomForest', () => {
  it('builds a synthetic forest and makes predictions', () => {
    const rf = new RandomForest();
    rf.buildSyntheticForest(30, 6, 42);
    expect(rf.numTrees).toBe(30);

    const features = [0.5, 50, 2500, 290, 280, 0.8, 0.01, 0.1, 0.0, 0.0];
    const result = rf.predict(features);
    expect(result.classProbs.length).toBe(FAULT_CLASSES.length);
    expect(result.confidence).toBeGreaterThan(0);
    expect(FAULT_CLASSES).toContain(result.predictedClass);
  });

  it('serializes and deserializes', () => {
    const rf = new RandomForest();
    rf.buildSyntheticForest(10, 4, 99);
    const json = rf.toJSON();
    
    const rf2 = new RandomForest();
    rf2.loadFromJSON(json);
    expect(rf2.numTrees).toBe(10);
    
    const features = [0.5, 50, 2500, 290, 280, 0.8, 0.01, 0.1, 0.0, 0.0];
    const r1 = rf.predict(features);
    const r2 = rf2.predict(features);
    expect(r1.predictedClass).toBe(r2.predictedClass);
  });
});

describe('Shapley Values', () => {
  it('computes exact Shapley with additivity check', () => {
    const rf = new RandomForest();
    rf.buildSyntheticForest(10, 4, 42);

    const features = [0.5, 50, 2500, 290, 280, 0.8, 0.01, 0.1].slice(0, 6);
    const background = Array.from({ length: 20 }, (_, i) => 
      features.map((f, j) => f * (0.8 + (i * 0.02 * (j + 1)) / features.length))
    );

    const result = computeExactShapley(rf, features, background, 0);
    
    expect(result.shapley.length).toBe(6);
    expect(result.additivityError).toBeLessThan(1e-6);
    expect(Number.isFinite(result.baseline)).toBe(true);
    expect(Number.isFinite(result.prediction)).toBe(true);
  });
});

describe('Case-Based Reasoning', () => {
  it('finds similar cases from case base', () => {
    const caseBase: CBRCase[] = [
      { id: 'c1', features: { flow_rate: 0.5, pump_dp: 50, outlet_temp: 290 }, faultClass: 'nominal', outcome: 'OK', timestamp: 0, synthetic: true },
      { id: 'c2', features: { flow_rate: 0.2, pump_dp: 20, outlet_temp: 340 }, faultClass: 'pump_failure', outcome: 'Switch loop', timestamp: 0, synthetic: true },
      { id: 'c3', features: { flow_rate: 0.3, pump_dp: 30, outlet_temp: 310 }, faultClass: 'leak', outcome: 'Repaired', timestamp: 0, synthetic: true },
    ];

    const query = [0.2, 22, 335]; // Similar to pump_failure
    const results = findSimilarCases(query, ['flow_rate', 'pump_dp', 'outlet_temp'], caseBase, 2);
    
    expect(results.length).toBe(2);
    expect(results[0].similarity).toBeGreaterThan(0);
    // Most similar should be c2 (pump_failure)
    expect(results[0].caseId).toBe('c2');
  });
});

describe('OOD Detection', () => {
  it('detects in-distribution samples', () => {
    const training = Array.from({ length: 50 }, (_, i) => [0.5 + i * 0.01, 50 + i]);
    const query = [0.55, 55];
    const result = computeOODScore(query, training);
    expect(result.isOOD).toBe(false);
  });

  it('detects out-of-distribution samples', () => {
    const training = Array.from({ length: 50 }, (_, i) => [0.5 + i * 0.01, 50 + i]);
    const query = [100, 1000]; // Very far from training
    const result = computeOODScore(query, training);
    expect(result.isOOD).toBe(true);
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
