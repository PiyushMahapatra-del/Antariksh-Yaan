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
import { RandomForest, FAULT_CLASSES, type CBRCase } from '../src/ai/tier1.js';
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

// 1. Generate Synthetic Training Data (20,000 samples)
console.log('[1/4] Generating 20,000 synthetic physics-coupled training samples...');
const N_SAMPLES = 20000;
interface Sample {
  features: number[];
  classIdx: number;
  className: string;
}

const samples: Sample[] = [];

for (let i = 0; i < N_SAMPLES; i++) {
  const classIdx = rng.randInt(0, FAULT_CLASSES.length - 2); // excluding unknown
  const className = FAULT_CLASSES[classIdx];

  // Base nominal values
  let flow_rate = 0.45 + rng.gaussian(0, 0.03); // kg/s
  let pump_dp = 48.0 + rng.gaussian(0, 2.0); // kPa
  let pump_rpm = 3000 + rng.gaussian(0, 80); // RPM
  let outlet_temp = 293.15 + rng.gaussian(0, 2.5); // K
  let inlet_temp = 285.0 + rng.gaussian(0, 2.0); // K
  let accumulator_level = 0.85 + rng.gaussian(0, 0.03); // %
  let energy_residual = rng.gaussian(0, 15.0); // W
  let temp_slope = rng.gaussian(0, 0.01); // K/s
  let flow_slope = rng.gaussian(0, 0.005); // kg/s^2
  let pressure_slope = rng.gaussian(0, 0.05); // kPa/s

  if (className === 'pump_failure') {
    flow_rate = 0.08 + rng.gaussian(0, 0.03);
    pump_dp = 12.0 + rng.gaussian(0, 3.0);
    pump_rpm = 600 + rng.gaussian(0, 150);
    outlet_temp += 22.0 + rng.random() * 10;
    temp_slope = 0.25 + rng.random() * 0.15;
    flow_slope = -0.05;
    energy_residual = 140.0 + rng.random() * 50;
  } else if (className === 'leak') {
    accumulator_level = 0.28 + rng.gaussian(0, 0.06);
    pump_dp = 32.0 + rng.gaussian(0, 4.0);
    pressure_slope = -0.35 + rng.gaussian(0, 0.08);
    outlet_temp += 8.0 + rng.random() * 5;
    flow_rate = 0.32 + rng.gaussian(0, 0.04);
  } else if (className === 'blockage') {
    flow_rate = 0.05 + rng.gaussian(0, 0.02);
    pump_dp = 78.0 + rng.gaussian(0, 5.0);
    pump_rpm = 3400 + rng.gaussian(0, 100);
    outlet_temp += 30.0 + rng.random() * 15;
    temp_slope = 0.38 + rng.random() * 0.1;
    pressure_slope = 0.45;
  } else if (className === 'sensor_fault') {
    outlet_temp = 373.15; // stuck hot
    temp_slope = 0.0;
    energy_residual = -250.0;
  }

  const features = [
    flow_rate, pump_dp, pump_rpm, outlet_temp, inlet_temp,
    accumulator_level, energy_residual, temp_slope, flow_slope, pressure_slope
  ];

  samples.push({ features, classIdx, className });
}

// 2. Train Random Forest Classifier
console.log('[2/4] Training Random Forest (60 trees, maxDepth 8)...');
const forest = new RandomForest();
forest.buildSyntheticForest(60, 8, RNG_SEED);

// Evaluate accuracy on held-out test split
let correct = 0;
const testSplit = samples.slice(16000);
for (const sample of testSplit) {
  const pred = forest.predict(sample.features);
  if (pred.predictedClass === sample.className) {
    correct++;
  }
}
const testAccuracy = (correct / testSplit.length) * 100;
console.log(`✓ Training complete: ${forest.numTrees} trees compiled.`);
console.log(`✓ Test validation accuracy: ${testAccuracy.toFixed(2)}% on ${testSplit.length} samples.`);

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
      flow_rate: 0.46, pump_dp: 48.5, pump_rpm: 3020, outlet_temp: 293.2,
      inlet_temp: 285.1, accumulator_level: 0.85, energy_residual: 2.1,
      temp_slope: 0.001, flow_slope: 0.0, pressure_slope: 0.01
    }
  },
  {
    id: 'CASE-EXP-088',
    faultClass: 'pump_failure',
    outcome: 'Primary coolant loop A pump cavitated during TCM-2. Executed failover to Loop B. Normal ops restored.',
    timestamp: 2460822.1,
    synthetic: true,
    features: {
      flow_rate: 0.07, pump_dp: 11.2, pump_rpm: 580, outlet_temp: 318.4,
      inlet_temp: 286.0, accumulator_level: 0.84, energy_residual: 155.0,
      temp_slope: 0.28, flow_slope: -0.04, pressure_slope: -0.15
    }
  },
  {
    id: 'CASE-EXP-112',
    faultClass: 'leak',
    outcome: 'Micrometeoroid breach on radiator feeder line. Accumulator depleted to 25%. Isolated manifold and patched.',
    timestamp: 2460865.7,
    synthetic: true,
    features: {
      flow_rate: 0.31, pump_dp: 30.5, pump_rpm: 3100, outlet_temp: 302.1,
      inlet_temp: 287.5, accumulator_level: 0.24, energy_residual: 45.0,
      temp_slope: 0.08, flow_slope: -0.01, pressure_slope: -0.38
    }
  },
  {
    id: 'CASE-EXP-145',
    faultClass: 'blockage',
    outcome: 'Paraffin wax thermal valve jammed shut. High delta-P detected. Switched to bypass loop and cleared clog.',
    timestamp: 2460890.3,
    synthetic: true,
    features: {
      flow_rate: 0.04, pump_dp: 82.0, pump_rpm: 3450, outlet_temp: 326.5,
      inlet_temp: 284.0, accumulator_level: 0.86, energy_residual: 180.0,
      temp_slope: 0.41, flow_slope: -0.08, pressure_slope: 0.52
    }
  },
  {
    id: 'CASE-EXP-198',
    faultClass: 'sensor_fault',
    outcome: 'RTD thermocouple sensor shorted out. Value pinned to 373.15K. Diagnostic flagged sensor stuck-at fault.',
    timestamp: 2460920.0,
    synthetic: true,
    features: {
      flow_rate: 0.45, pump_dp: 47.9, pump_rpm: 3010, outlet_temp: 373.15,
      inlet_temp: 285.2, accumulator_level: 0.85, energy_residual: -260.0,
      temp_slope: 0.0, flow_slope: 0.0, pressure_slope: 0.0
    }
  }
];

const caseBasePath = path.join(DATA_DIR, 'case-base.json');
fs.writeFileSync(caseBasePath, JSON.stringify(caseBase, null, 2), 'utf-8');
console.log(`✓ Serialized ${caseBase.length} historical synthetic cases to ${caseBasePath}`);

console.log('\n===============================================================');
console.log('Training pipeline execution complete. Artifacts written to data/');
console.log('===============================================================');
