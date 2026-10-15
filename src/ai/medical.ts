/**
 * AEGIS TRANSIT — Medical Console (Illustrative CDSS)
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * SYNTHETIC: NOT REAL MEDICAL PROCEDURES
 * NOT MEDICAL ADVICE
 * 
 * Layer 1: R0 decision trees (hypoxia, decompression, CO2 toxicity)
 * Layer 2: Differential ranking via weighted likelihood (naive Bayes)
 * 
 * Fidelity: MEDIUM
 */

import type { MedicalAssessment, MedicalRecommendation } from './gateway.js';
export type { MedicalAssessment, MedicalRecommendation };

// ============================================================================
// R0 DECISION TREES
// ============================================================================

export interface DecisionTreeNode {
  id: string;
  question?: string;
  variable?: string;   // telemetry variable to check
  threshold?: number;
  yesChild?: DecisionTreeNode;
  noChild?: DecisionTreeNode;
  diagnosis?: string;
  actions?: string[];
}

/** Hypoxia decision tree */
export const HYPOXIA_TREE: DecisionTreeNode = {
  id: 'hyp_root',
  question: 'Is ppO2 < 19.5 kPa?',
  variable: 'ppO2',
  threshold: 19.5,
  yesChild: {
    id: 'hyp_severe',
    question: 'Is ppO2 < 16.0 kPa?',
    variable: 'ppO2',
    threshold: 16.0,
    yesChild: {
      id: 'hyp_critical',
      question: 'Is SpO2 < 90%?',
      variable: 'spO2',
      threshold: 90,
      yesChild: {
        id: 'hyp_emergency',
        diagnosis: 'CRITICAL HYPOXIA',
        actions: [
          'SYNTHETIC: Immediately restore O2 supply',
          'SYNTHETIC: Move crew to safe volume with O2',
          'SYNTHETIC: Apply supplemental O2 mask',
          'SYNTHETIC: Monitor SpO2 continuously',
          'SYNTHETIC: Queue flight surgeon review packet',
        ],
      },
      noChild: {
        id: 'hyp_moderate',
        diagnosis: 'MODERATE HYPOXIA',
        actions: [
          'SYNTHETIC: Increase O2 flow rate',
          'SYNTHETIC: Monitor ppO2 and SpO2',
          'SYNTHETIC: Check O2 regulator status',
        ],
      },
    },
    noChild: {
      id: 'hyp_mild',
      diagnosis: 'MILD HYPOXIA WARNING',
      actions: [
        'SYNTHETIC: Check O2 regulator',
        'SYNTHETIC: Verify cabin seal integrity',
        'SYNTHETIC: Monitor ppO2 trend',
      ],
    },
  },
  noChild: {
    id: 'hyp_nominal',
    diagnosis: 'ppO2 NOMINAL',
    actions: ['Continue monitoring'],
  },
};

/** CO2 toxicity decision tree */
export const CO2_TREE: DecisionTreeNode = {
  id: 'co2_root',
  question: 'Is ppCO2 > 1.0 kPa?',
  variable: 'ppCO2',
  threshold: 1.0,
  yesChild: {
    id: 'co2_elevated',
    question: 'Is ppCO2 > 2.0 kPa?',
    variable: 'ppCO2',
    threshold: 2.0,
    yesChild: {
      id: 'co2_danger',
      diagnosis: 'DANGEROUS CO2 LEVEL',
      actions: [
        'SYNTHETIC: Replace CO2 scrubber cartridge immediately',
        'SYNTHETIC: Increase cabin ventilation',
        'SYNTHETIC: Monitor crew for headache, dizziness',
        'SYNTHETIC: Consider supplemental O2',
      ],
    },
    noChild: {
      id: 'co2_caution',
      diagnosis: 'ELEVATED CO2',
      actions: [
        'SYNTHETIC: Check CO2 scrubber efficiency',
        'SYNTHETIC: Plan scrubber cartridge replacement',
        'SYNTHETIC: Monitor ppCO2 trend',
      ],
    },
  },
  noChild: {
    id: 'co2_nominal',
    diagnosis: 'ppCO2 NOMINAL',
    actions: ['Continue monitoring'],
  },
};

/** Decompression decision tree */
export const DECOMPRESSION_TREE: DecisionTreeNode = {
  id: 'decomp_root',
  question: 'Is cabin pressure < 95 kPa?',
  variable: 'cabinPressure',
  threshold: 95,
  yesChild: {
    id: 'decomp_loss',
    question: 'Is pressure rate of change < -0.5 kPa/min?',
    variable: 'pressureRate',
    threshold: -0.5,
    yesChild: {
      id: 'decomp_rapid',
      diagnosis: 'RAPID DECOMPRESSION',
      actions: [
        'SYNTHETIC: Don emergency pressure suits',
        'SYNTHETIC: Seal affected compartment',
        'SYNTHETIC: Initiate emergency repressurization',
        'SYNTHETIC: All crew report to safe haven',
      ],
    },
    noChild: {
      id: 'decomp_slow',
      diagnosis: 'SLOW PRESSURE LEAK',
      actions: [
        'SYNTHETIC: Locate leak with pressure differential',
        'SYNTHETIC: Apply emergency patch',
        'SYNTHETIC: Monitor cabin pressure recovery',
      ],
    },
  },
  noChild: {
    id: 'decomp_nominal',
    diagnosis: 'CABIN PRESSURE NOMINAL',
    actions: ['Continue monitoring'],
  },
};

/** Evaluate a decision tree and return the path taken */
export function evaluateDecisionTree(
  tree: DecisionTreeNode,
  values: Record<string, number>
): { diagnosis: string; actions: string[]; path: { nodeId: string; decision: string; value: number }[] } {
  const path: { nodeId: string; decision: string; value: number }[] = [];
  let node: DecisionTreeNode | undefined = tree;

  while (node) {
    if (node.diagnosis) {
      return { diagnosis: node.diagnosis, actions: node.actions ?? [], path };
    }

    const value: number = (node.variable && values[node.variable] !== undefined) ? values[node.variable] : 0;
    const threshold: number = node.threshold ?? 0;
    
    // For "Is X < threshold?" questions
    const meetsCondition: boolean = node.question ? (node.question.includes('<') ? value < threshold : value > threshold) : false;
    
    path.push({ nodeId: node.id, decision: meetsCondition ? 'YES' : 'NO', value });
    node = meetsCondition ? node.yesChild : node.noChild;
  }

  return { diagnosis: 'UNKNOWN', actions: ['Escalate to flight surgeon'], path };
}

// ============================================================================
// DIFFERENTIAL RANKING (Naive Bayes)
// ============================================================================

/** Conditional probability table entry */
export interface CPTEntry {
  condition: string;
  features: Record<string, { mean: number; std: number }>;
  priorProbability: number;
}

/** Default CPT for space medical conditions */
export const MEDICAL_CPT: CPTEntry[] = [
  {
    condition: 'Hypoxia',
    features: {
      ppO2: { mean: 15, std: 3 },
      spO2: { mean: 88, std: 5 },
      heartRate: { mean: 100, std: 15 },
      respRate: { mean: 22, std: 4 },
    },
    priorProbability: 0.15,
  },
  {
    condition: 'CO2 Toxicity',
    features: {
      ppCO2: { mean: 2.5, std: 0.8 },
      spO2: { mean: 94, std: 3 },
      heartRate: { mean: 90, std: 12 },
      respRate: { mean: 24, std: 5 },
    },
    priorProbability: 0.10,
  },
  {
    condition: 'Decompression Exposure',
    features: {
      cabinPressure: { mean: 70, std: 15 },
      spO2: { mean: 85, std: 8 },
      heartRate: { mean: 110, std: 20 },
      ppO2: { mean: 10, std: 5 },         // decompression drops ppO2 significantly
      respRate: { mean: 28, std: 6 },      // rapid breathing expected
    },
    priorProbability: 0.05,
  },
  {
    condition: 'Radiation Sickness',
    features: {
      radiationDose: { mean: 500, std: 200 },
      heartRate: { mean: 80, std: 15 },
      ppO2: { mean: 21.3, std: 1.5 },   // expects nominal ppO2 — hypoxic values penalize
      spO2: { mean: 97, std: 2 },        // expects nominal SpO2 — low SpO2 penalizes
    },
    priorProbability: 0.03,
  },
  {
    condition: 'Nominal',
    features: {
      ppO2: { mean: 21.3, std: 1 },
      ppCO2: { mean: 0.4, std: 0.2 },
      spO2: { mean: 98, std: 1 },
      heartRate: { mean: 70, std: 10 },
      respRate: { mean: 16, std: 3 },
    },
    priorProbability: 0.67,
  },
];

/** Compute differential ranking using naive Bayes */
export function computeDifferential(
  observations: Record<string, number>,
  cpt: CPTEntry[] = MEDICAL_CPT
): { condition: string; likelihood: number; reasoning: string }[] {
  const results: { condition: string; likelihood: number; reasoning: string }[] = [];

  for (const entry of cpt) {
    let logLikelihood = Math.log(entry.priorProbability);
    const reasons: string[] = [];

    for (const [feature, { mean, std }] of Object.entries(entry.features)) {
      const obs = observations[feature];
      if (obs === undefined) continue;

      // Gaussian likelihood
      const z = (obs - mean) / std;
      const ll = -0.5 * z * z - Math.log(std * Math.sqrt(2 * Math.PI));
      logLikelihood += ll;

      if (Math.abs(z) > 1.5) {
        reasons.push(`${feature}=${obs.toFixed(1)} (${z > 0 ? 'above' : 'below'} expected ${mean.toFixed(1)})`);
      }
    }

    results.push({
      condition: entry.condition,
      likelihood: Math.exp(logLikelihood),
      reasoning: reasons.length > 0 ? reasons.join('; ') : 'Values within expected range',
    });
  }

  // Normalize
  const total = results.reduce((sum, r) => sum + r.likelihood, 0);
  if (total > 0) {
    for (const r of results) r.likelihood /= total;
  }

  results.sort((a, b) => b.likelihood - a.likelihood);
  return results;
}

// ============================================================================
// MEDICAL CONSOLE
// ============================================================================

/** SYNTHETIC formulary entry */
export interface FormularyEntry {
  name: string;
  indication: string;
  dose: string;
  route: string;
  notes: string;
  inKit: boolean;
}

export const SYNTHETIC_FORMULARY: FormularyEntry[] = [
  { name: 'Supplemental O2', indication: 'Hypoxia', dose: '2-4 L/min', route: 'Inhalation', notes: 'SYNTHETIC: First-line for low SpO2', inKit: true },
  { name: 'Acetazolamide (illustrative)', indication: 'Altitude sickness analog', dose: '250mg', route: 'Oral', notes: 'SYNTHETIC: Illustrative only', inKit: true },
  { name: 'Ondansetron (illustrative)', indication: 'Nausea/vomiting', dose: '4mg', route: 'Oral', notes: 'SYNTHETIC: Illustrative only', inKit: true },
  { name: 'Potassium iodide (illustrative)', indication: 'Radiation exposure', dose: '130mg', route: 'Oral', notes: 'SYNTHETIC: Illustrative thyroid protection', inKit: true },
];

/**
 * Run the full medical assessment pipeline.
 * SYNTHETIC: NOT REAL MEDICAL PROCEDURE. NOT MEDICAL ADVICE.
 */
export function runMedicalAssessment(
  _symptoms: string[],
  vitals: Record<string, number>,
  cabinState: Record<string, number>
): MedicalAssessment {
  const allValues = { ...vitals, ...cabinState };

  // Layer 1: Decision trees
  const hypoxiaResult = evaluateDecisionTree(HYPOXIA_TREE, allValues);
  const co2Result = evaluateDecisionTree(CO2_TREE, allValues);
  const decompResult = evaluateDecisionTree(DECOMPRESSION_TREE, allValues);

  // Use the most severe tree result for the path
  const treeResults = [hypoxiaResult, co2Result, decompResult];
  const activeTree = treeResults.find(r => !r.diagnosis.includes('NOMINAL')) ?? hypoxiaResult;

  // Layer 2: Differential ranking
  const differentials = computeDifferential(allValues);

  // Flag lookalikes
  const lookalikes: string[] = [];
  if (differentials.length >= 2) {
    const top = differentials[0];
    const second = differentials[1];
    if (top.likelihood > 0 && second.likelihood / top.likelihood > 0.3) {
      lookalikes.push(`${top.condition} vs ${second.condition}: similar presentations — verify with additional data`);
    }
  }

  // Build recommendations constrained to formulary
  const recommendations: MedicalRecommendation[] = [];
  for (const action of activeTree.actions) {
    const matchingMed = SYNTHETIC_FORMULARY.find(f =>
      action.toLowerCase().includes(f.indication.toLowerCase()) ||
      action.toLowerCase().includes('o2') && f.name.includes('O2')
    );

    recommendations.push({
      action,
      medication: matchingMed?.name,
      dose: matchingMed?.dose,
      route: matchingMed?.route,
      notes: 'SYNTHETIC: NOT REAL MEDICAL PROCEDURE',
      fromFormulary: !!matchingMed,
      requiresCMOConfirm: true,
    });
  }

  return {
    differentials,
    recommendations,
    decisionTreePath: activeTree.path,
    lookalikes,
    requiresFlightSurgeonReview: true,
    synthetic: true,
  };
}
