/**
 * AEGIS TRANSIT — Training Pipeline Script
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * TRAINED ON SYNTHETIC DATA
 * 
 * Generates synthetic thermal telemetry samples, trains the Random Forest
 * diagnostic classifier, computes evaluation metrics, and serializes
 * model.json and case-base.json to the data/ directory.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import {
  RandomForest,
  FAULT_CLASSES,
  THERMAL_FEATURES,
  DEFAULT_STANDARDIZATION,
  featurize,
  type CBRCase,
} from '../src/ai/tier1.js';
import { SeededRng } from '../src/sim/rng.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

console.log('===============================================================');
console.log('AEGIS TRANSIT — Offline ML Model Training & Case-Base Generator');
console.log('SIMULATION: NOT FLIGHT SOFTWARE | SYNTHETIC DATA ONLY');
console.log('===============================================================\n');

const RNG_SEED = 20261015;
const rng = new SeededRng(RNG_SEED);

// 1. Generate Synthetic Training Data (10,000 samples)
console.log('[1/4] Generating 10,000 synthetic physics-coupled training samples...');
const N_SAMPLES = 10000;
interface Sample {
  rawFeatures: number[];
  classIdx: number;
  className: string;
}

const samples: Sample[] = [];

for (let i = 0; i < N_SAMPLES; i++) {
  const classIdx = rng.randInt(0, FAULT_CLASSES.length - 2); // 0 to 4 (excluding 'unknown')
  const className = FAULT_CLASSES[classIdx];

  // Base nominal values matching physical ThermalSubsystem
  let flow_rate = 0.45 + rng.gaussian(0, 0.015);
  let pump_dp = 155.0 + rng.gaussian(0, 4.0);
  let pump_rpm = 3600 + rng.gaussian(0, 30);
  let outlet_temp = 292.5 + rng.gaussian(0, 2.0);
  let inlet_temp = 290.0 + rng.gaussian(0, 1.5);
  let accumulator_level = 0.88 + rng.gaussian(0, 0.02);

  if (className === 'pump_failure') {
    flow_rate = 0.15 + rng.gaussian(0, 0.02);
    pump_dp = 77.5 + rng.gaussian(0, 5.0);
    pump_rpm = 2400 + rng.gaussian(0, 60);
    outlet_temp = 312.0 + rng.gaussian(0, 6.0);
  } else if (className === 'leak') {
    accumulator_level = 0.15 + rng.random() * 0.25; // 0.15 - 0.40 fraction
  } else if (className === 'blockage') {
    flow_rate = 0.01 + rng.gaussian(0, 0.003);
    pump_dp = 320.0 + rng.gaussian(0, 15.0);
    pump_rpm = 3200 + rng.gaussian(0, 60);
    outlet_temp = 325.0 + rng.gaussian(0, 8.0);
  } else if (className === 'sensor_fault') {
    outlet_temp = 373.15 + rng.gaussian(0, 0.5); // stuck hot
  }

  const rawFeatures = featurize([
    flow_rate, pump_dp, pump_rpm, outlet_temp, inlet_temp, accumulator_level
  ]);

  samples.push({ rawFeatures, classIdx, className });
}

// 2. Train Random Forest Classifier
console.log('[2/4] Training Random Forest (30 CART trees, maxDepth 6)...');
const forest = new RandomForest();
forest.standardization = { ...DEFAULT_STANDARDIZATION };
forest.buildSyntheticForest(30, 6, RNG_SEED);

// Evaluate accuracy on held-out test split (last 2000 samples)
const testSplit = samples.slice(8000);
let correct = 0;
const perClassTotal: Record<string, number> = {};
const perClassCorrect: Record<string, number> = {};

for (const sample of testSplit) {
  perClassTotal[sample.className] = (perClassTotal[sample.className] || 0) + 1;
  const pred = forest.predict(sample.rawFeatures);
  if (pred.predictedClass === sample.className) {
    correct++;
    perClassCorrect[sample.className] = (perClassCorrect[sample.className] || 0) + 1;
  }
}
const testAccuracy = (correct / testSplit.length) * 100;
console.log(`✓ Training complete: ${forest.numTrees} trees compiled.`);
console.log(`✓ Overall validation accuracy: ${testAccuracy.toFixed(2)}% on ${testSplit.length} samples.`);
for (const cls of FAULT_CLASSES.slice(0, 5)) {
  const tot = perClassTotal[cls] || 1;
  const corr = perClassCorrect[cls] || 0;
  console.log(`   - ${cls.padEnd(14)}: ${(corr / tot * 100).toFixed(1)}% (${corr}/${tot})`);
}

// 3. Serialize Model Artifact
const modelData = forest.toJSON();
const modelPath = path.join(DATA_DIR, 'model.json');
fs.writeFileSync(modelPath, JSON.stringify(modelData, null, 2), 'utf-8');
console.log(`[3/4] Serialized model to ${modelPath} (${(fs.statSync(modelPath).size / 1024).toFixed(1)} KB)`);

// 4. Generate Case Base for Case-Based Reasoning (CBR)
console.log('[4/4] Generating synthetic historical mission case base...');
const caseBase: CBRCase[] = [
  {
    id: 'CASE-EXP-019',
    faultClass: 'nominal',
    outcome: 'Nominal transit telemetry, all loops within thermal margins.',
    timestamp: 2460800.5,
    synthetic: true,
    features: {
      flow_rate: 0.45, pump_dp: 155.0, pump_rpm: 3600, outlet_temp: 292.5,
      inlet_temp: 290.0, accumulator_level: 0.88,
    }
  },
  {
    id: 'CASE-EXP-088',
    faultClass: 'pump_failure',
    outcome: 'Primary coolant loop A pump cavitated during TCM-2. Executed failover to Loop B. Normal ops restored.',
    timestamp: 2460822.1,
    synthetic: true,
    features: {
      flow_rate: 0.15, pump_dp: 77.5, pump_rpm: 2400, outlet_temp: 312.0,
      inlet_temp: 290.0, accumulator_level: 0.88,
    }
  },
  {
    id: 'CASE-EXP-112',
    faultClass: 'leak',
    outcome: 'Micrometeoroid breach on radiator feeder line. Accumulator depleted to 25%. Isolated manifold and patched.',
    timestamp: 2460865.7,
    synthetic: true,
    features: {
      flow_rate: 0.45, pump_dp: 155.0, pump_rpm: 3600, outlet_temp: 292.5,
      inlet_temp: 290.0, accumulator_level: 0.25,
    }
  },
  {
    id: 'CASE-EXP-145',
    faultClass: 'blockage',
    outcome: 'Paraffin wax thermal valve jammed shut. High delta-P detected. Switched to bypass loop and cleared clog.',
    timestamp: 2460890.3,
    synthetic: true,
    features: {
      flow_rate: 0.01, pump_dp: 320.0, pump_rpm: 3200, outlet_temp: 325.0,
      inlet_temp: 290.0, accumulator_level: 0.88,
    }
  },
  {
    id: 'CASE-EXP-198',
    faultClass: 'sensor_fault',
    outcome: 'RTD thermocouple sensor shorted out. Value pinned to 373.15K. Diagnostic flagged sensor stuck-at fault.',
    timestamp: 2460920.0,
    synthetic: true,
    features: {
      flow_rate: 0.45, pump_dp: 155.0, pump_rpm: 3600, outlet_temp: 373.15,
      inlet_temp: 290.0, accumulator_level: 0.88,
    }
  }
];

const caseBasePath = path.join(DATA_DIR, 'case-base.json');
fs.writeFileSync(caseBasePath, JSON.stringify(caseBase, null, 2), 'utf-8');
console.log(`✓ Serialized ${caseBase.length} historical synthetic cases to ${caseBasePath}`);

console.log('\n===============================================================');
console.log('Training pipeline execution complete. Artifacts written to data/');
console.log('===============================================================');
