/**
 * AEGIS TRANSIT — Library Builder & Knowledge Graph Compiler
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * SYNTHETIC: NOT REAL MEDICAL OR FLIGHT PROCEDURES
 * 
 * Compiles medical decision trees, clinical pharmacology formulary,
 * subsystem knowledge graph modules, and procedure sets into verifiable
 * JSON modules with SHA-256 checksums in data/.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { fileURLToPath } from 'url';
import { HYPOXIA_TREE, CO2_TREE, DECOMPRESSION_TREE, MEDICAL_CPT, SYNTHETIC_FORMULARY } from '../src/ai/medical.js';
import { KnowledgeGraph } from '../src/ai/tier2.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const KG_DIR = path.join(DATA_DIR, 'kg-modules');

console.log('===============================================================');
console.log('AEGIS TRANSIT — Reference Library & Knowledge Base Compiler');
console.log('SIMULATION: NOT FLIGHT SOFTWARE | SYNTHETIC PROCEDURES');
console.log('===============================================================\n');

if (!fs.existsSync(KG_DIR)) {
  fs.mkdirSync(KG_DIR, { recursive: true });
}

function computeSha256(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

// 1. Export Medical Decision Trees
console.log('[1/4] Compiling synthetic medical decision trees...');
const medTreesData = {
  version: '1.0.0-synthetic',
  disclaimer: 'SYNTHETIC: NOT REAL MEDICAL PROCEDURES. NOT MEDICAL ADVICE.',
  trees: {
    hypoxia: HYPOXIA_TREE,
    co2: CO2_TREE,
    decompression: DECOMPRESSION_TREE
  }
};
const medTreesJson = JSON.stringify(medTreesData, null, 2);
const medTreesPath = path.join(DATA_DIR, 'med-trees.json');
fs.writeFileSync(medTreesPath, medTreesJson, 'utf-8');
const medTreesHash = computeSha256(medTreesJson);
console.log(`✓ Wrote ${medTreesPath} (SHA-256: ${medTreesHash.slice(0, 16)}...)`);

// 2. Export Clinical Formulary & CPT
console.log('[2/4] Compiling synthetic medical formulary and CPT table...');
const formularyData = {
  version: '1.0.0-synthetic',
  disclaimer: 'SYNTHETIC: NOT REAL MEDICAL PROCEDURES. NOT MEDICAL ADVICE.',
  formulary: SYNTHETIC_FORMULARY,
  conditionalProbabilityTable: MEDICAL_CPT
};
const formularyJson = JSON.stringify(formularyData, null, 2);
const formularyPath = path.join(DATA_DIR, 'formulary.json');
fs.writeFileSync(formularyPath, formularyJson, 'utf-8');
const formularyHash = computeSha256(formularyJson);
console.log(`✓ Wrote ${formularyPath} (SHA-256: ${formularyHash.slice(0, 16)}...)`);

// 3. Compile Knowledge Graph Subsystem Modules
console.log('[3/4] Compiling domain-specific Knowledge Graph modules...');
const kg = new KnowledgeGraph();
const allNodes = [...kg.nodes.values()];

// Domain categorization
const domains: Record<string, string[]> = {
  thermal: ['loop', 'temp', 'radiator', 'accumulator', 'flow', 'coolant'],
  eclss: ['o2', 'co2', 'cabin', 'decomp', 'scrubber', 'regulator', 'seal', 'pressure'],
  power: ['power', 'solar', 'battery', 'shed', 'bus'],
  gnc: ['rcs', 'engine', 'moi', 'edl', 'prop', 'attitude', 'orbit', 'trajectory'],
  medical: ['hypoxia', 'decompression', 'rad', 'shelter', 'medical']
};

const moduleManifest: Record<string, { nodes: number; sha256: string }> = {};

for (const [domain, keywords] of Object.entries(domains)) {
  const domainNodes = allNodes.filter(n => {
    const textToMatch = `${n.id} ${n.name} ${n.text}`.toLowerCase();
    return keywords.some(kw => textToMatch.includes(kw));
  });

  const moduleData = {
    domain,
    version: '1.0.0-synthetic',
    nodeCount: domainNodes.length,
    nodes: domainNodes
  };

  const moduleJson = JSON.stringify(moduleData, null, 2);
  const modulePath = path.join(KG_DIR, `${domain}.json`);
  fs.writeFileSync(modulePath, moduleJson, 'utf-8');
  const hash = computeSha256(moduleJson);
  moduleManifest[domain] = { nodes: domainNodes.length, sha256: hash };
  console.log(`✓ Module [${domain.padEnd(8)}]: ${domainNodes.length} nodes → kg-modules/${domain}.json (${hash.slice(0, 16)}...)`);
}

// 4. Generate Library Checksums & Manifest
console.log('[4/4] Generating R1/LIB signed manifest for bootloader verification...');
const libraryManifest = {
  buildTimestamp: new Date().toISOString(),
  syntheticWarning: 'SYNTHETIC: NOT REAL FLIGHT OR MEDICAL PROCEDURES',
  artifacts: {
    'med-trees.json': { sha256: medTreesHash, size: fs.statSync(medTreesPath).size },
    'formulary.json': { sha256: formularyHash, size: fs.statSync(formularyPath).size },
    ...Object.fromEntries(
      Object.entries(moduleManifest).map(([domain, info]) => [
        `kg-modules/${domain}.json`,
        { sha256: info.sha256, size: fs.statSync(path.join(KG_DIR, `${domain}.json`)).size }
      ])
    )
  }
};

const manifestPath = path.join(DATA_DIR, 'library-manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(libraryManifest, null, 2), 'utf-8');
console.log(`✓ Wrote library manifest to ${manifestPath}`);

console.log('\n===============================================================');
console.log('Knowledge base library compilation complete.');
console.log('===============================================================');
