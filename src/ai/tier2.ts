/**
 * AEGIS TRANSIT — Tier 2 AI: Knowledge Graph, BM25 Retrieval, Constrained Renderer
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Grounded assistant that retrieves from a typed knowledge graph.
 * No hallucination: empty retrieval returns refusal, never invention.
 * 
 * Fidelity: MEDIUM (hand-authored KG, TF-IDF retrieval)
 */

import type { Tier2Response, Tier2Block } from './gateway.js';

// ============================================================================
// KNOWLEDGE GRAPH
// ============================================================================

export type KGNodeType = 'Procedure' | 'Step' | 'Equipment' | 'Sensor' | 'Hazard' | 'Phase' | 'Medication';

export interface KGNode {
  id: string;
  type: KGNodeType;
  name: string;
  text: string;
  phase?: string[];
  pinned?: boolean;
}

export interface KGEdge {
  from: string;
  to: string;
  relation: 'references' | 'requires' | 'precedes' | 'applies-in-phase' | 'treats' | 'monitors';
}

export class KnowledgeGraph {
  nodes: Map<string, KGNode> = new Map();
  edges: KGEdge[] = [];

  constructor() {
    this._buildDefaultGraph();
  }

  addNode(node: KGNode): void { this.nodes.set(node.id, node); }
  addEdge(edge: KGEdge): void { this.edges.push(edge); }

  getNode(id: string): KGNode | undefined { return this.nodes.get(id); }

  /** Get 1-hop neighbors of a node */
  getNeighbors(nodeId: string): KGNode[] {
    const neighborIds = new Set<string>();
    for (const edge of this.edges) {
      if (edge.from === nodeId) neighborIds.add(edge.to);
      if (edge.to === nodeId) neighborIds.add(edge.from);
    }
    return [...neighborIds].map(id => this.nodes.get(id)).filter((n): n is KGNode => n !== undefined);
  }

  /** Filter nodes by phase */
  getNodesForPhase(phase: string): KGNode[] {
    return [...this.nodes.values()].filter(n =>
      !n.phase || n.phase.length === 0 || n.phase.includes(phase)
    );
  }

  /** Get nodes of a specific type */
  getNodesByType(type: KGNodeType): KGNode[] {
    return [...this.nodes.values()].filter(n => n.type === type);
  }

  private _buildDefaultGraph(): void {
    // 12+ illustrative procedures
    const procedures: [string, string, string, string[]][] = [
      ['proc_loop_failover', 'Cooling Loop Failover', 'Switch from failed coolant loop A to redundant loop B. Verify flow rate and outlet temperature stabilize within 5 minutes. Monitor accumulator level.', ['Cruise', 'MOI', 'MarsOrbit', 'ReturnCruise']],
      ['proc_o2_regulator', 'O2 Regulator Fault Response', 'If O2 regulator is stuck, manually adjust supplemental O2 flow. Monitor ppO2 continuously. Target 21.3 kPa. Alert if ppO2 drops below 19.5 kPa.', ['Cruise', 'MOI', 'MarsOrbit', 'SurfaceOps', 'ReturnCruise']],
      ['proc_cabin_leak', 'Cabin Leak Isolation', 'Isolate affected section. Don emergency O2 masks. Locate leak using pressure differential sensors. Apply emergency patch. Verify cabin pressure recovery.', ['Cruise', 'MOI', 'MarsOrbit', 'ReturnCruise']],
      ['proc_co2_scrubber', 'CO2 Scrubber Maintenance', 'Replace CO2 scrubber cartridge. Verify ppCO2 begins decreasing within 10 minutes. Nominal ppCO2 target: < 0.5 kPa.', ['Cruise', 'MOI', 'MarsOrbit', 'SurfaceOps', 'ReturnCruise']],
      ['proc_moi_abort', 'MOI Abort to Flyby', 'Abort Mars Orbit Insertion burn. Reconfigure for flyby trajectory. Requires minimum 100 m/s delta-v reserve. Crew confirmation required.', ['MOI']],
      ['proc_hypoxia', 'Hypoxia Response Protocol', 'SYNTHETIC: NOT REAL MEDICAL PROCEDURE. Restore O2 supply. Move affected crew to safe volume. Apply supplemental O2. Monitor SpO2 continuously. Target SpO2 > 95%.', ['Cruise', 'MOI', 'MarsOrbit', 'SurfaceOps', 'ReturnCruise']],
      ['proc_rad_shelter', 'Radiation Shelter Protocol', 'Move crew to radiation shelter. Reduce EVA activities. Monitor cumulative dose. Resume normal operations when dose rate returns to baseline.', ['Cruise', 'ReturnCruise']],
      ['proc_power_shed', 'Emergency Power Load Shed', 'Shed non-essential loads. Priority order: science instruments, Tier 2 compute, heating pads, lighting. Maintain life support and comms.', ['Cruise', 'MOI', 'MarsOrbit', 'ReturnCruise']],
      ['proc_edl_abort', 'EDL Abort to Orbit', 'Abort EDL sequence before atmospheric entry interface. Fire abort motors. Return to Mars orbit. Only valid before atmospheric entry.', ['EDL']],
      ['proc_comm_blackout', 'Communication Blackout Procedure', 'Verify spool is filling. Priority-order downlink queue. No configuration changes during blackout. Drain by priority on reacquisition.', ['Cruise', 'ReturnCruise']],
      ['proc_safe_mode', 'Vehicle Safe Mode Entry', 'Shed all non-essential loads. Point solar arrays at Sun. Maintain minimum attitude control. Await crew assessment or ground command.', ['Cruise', 'MOI', 'MarsOrbit', 'ReturnCruise']],
      ['proc_decompression', 'Rapid Decompression Response', 'SYNTHETIC: NOT REAL MEDICAL PROCEDURE. Don emergency suits immediately. Seal affected compartment. Initiate emergency repressurization. Check all crew for decompression symptoms.', ['Cruise', 'MOI', 'MarsOrbit', 'ReturnCruise']],
    ];

    for (const [id, name, text, phases] of procedures) {
      this.addNode({ id, type: 'Procedure', name, text, phase: phases });
    }

    // Equipment nodes
    const equipment: [string, string, string][] = [
      ['eq_loop_a', 'Coolant Loop A', 'Primary thermal control loop with pump, radiator, and accumulator'],
      ['eq_loop_b', 'Coolant Loop B', 'Redundant thermal control loop (backup)'],
      ['eq_o2_reg', 'O2 Regulator', 'Cabin oxygen partial pressure regulator'],
      ['eq_co2_scrub', 'CO2 Scrubber', 'Carbon dioxide removal system'],
      ['eq_solar_array', 'Solar Array', 'Primary power generation from solar irradiance'],
      ['eq_battery', 'Battery Pack', 'Lithium-ion battery for power storage'],
      ['eq_rcs', 'RCS Thrusters', 'Reaction Control System for attitude maintenance'],
      ['eq_main_engine', 'Main Engine', 'Primary propulsion for orbit insertion and major maneuvers'],
    ];

    for (const [id, name, text] of equipment) {
      this.addNode({ id, type: 'Equipment', name, text });
    }

    // Sensor nodes
    const sensors: [string, string][] = [
      ['sens_temp_outlet_a', 'Loop A Outlet Temperature Sensor'],
      ['sens_temp_outlet_b', 'Loop B Outlet Temperature Sensor'],
      ['sens_flow_a', 'Loop A Flow Rate Sensor'],
      ['sens_pump_rpm_a', 'Loop A Pump RPM Sensor'],
      ['sens_ppo2', 'Cabin ppO2 Sensor'],
      ['sens_ppco2', 'Cabin ppCO2 Sensor'],
      ['sens_cabin_press', 'Cabin Pressure Sensor'],
      ['sens_spo2', 'Crew SpO2 Wearable Sensor'],
    ];

    for (const [id, name] of sensors) {
      this.addNode({ id, type: 'Sensor', name, text: `Telemetry sensor: ${name}` });
    }

    // Hazard nodes
    const hazards: [string, string, string][] = [
      ['haz_thermal_runaway', 'Thermal Runaway', 'Uncontrolled temperature rise due to coolant system failure'],
      ['haz_hypoxia', 'Crew Hypoxia', 'Insufficient oxygen partial pressure in cabin'],
      ['haz_co2_toxicity', 'CO2 Toxicity', 'Elevated carbon dioxide partial pressure causing crew impairment'],
      ['haz_decompression', 'Rapid Decompression', 'Loss of cabin pressure due to structural breach'],
      ['haz_radiation', 'Radiation Exposure', 'Elevated radiation dose from solar particle event'],
    ];

    for (const [id, name, text] of hazards) {
      this.addNode({ id, type: 'Hazard', name, text });
    }

    // Edges connecting procedures to equipment, sensors, hazards
    this.addEdge({ from: 'proc_loop_failover', to: 'eq_loop_a', relation: 'references' });
    this.addEdge({ from: 'proc_loop_failover', to: 'eq_loop_b', relation: 'references' });
    this.addEdge({ from: 'proc_loop_failover', to: 'sens_temp_outlet_a', relation: 'monitors' });
    this.addEdge({ from: 'proc_loop_failover', to: 'sens_flow_a', relation: 'monitors' });
    this.addEdge({ from: 'proc_loop_failover', to: 'haz_thermal_runaway', relation: 'treats' });
    this.addEdge({ from: 'proc_o2_regulator', to: 'eq_o2_reg', relation: 'references' });
    this.addEdge({ from: 'proc_o2_regulator', to: 'sens_ppo2', relation: 'monitors' });
    this.addEdge({ from: 'proc_o2_regulator', to: 'haz_hypoxia', relation: 'treats' });
    this.addEdge({ from: 'proc_cabin_leak', to: 'sens_cabin_press', relation: 'monitors' });
    this.addEdge({ from: 'proc_cabin_leak', to: 'haz_decompression', relation: 'treats' });
    this.addEdge({ from: 'proc_co2_scrubber', to: 'eq_co2_scrub', relation: 'references' });
    this.addEdge({ from: 'proc_co2_scrubber', to: 'sens_ppco2', relation: 'monitors' });
    this.addEdge({ from: 'proc_co2_scrubber', to: 'haz_co2_toxicity', relation: 'treats' });
    this.addEdge({ from: 'proc_hypoxia', to: 'sens_spo2', relation: 'monitors' });
    this.addEdge({ from: 'proc_hypoxia', to: 'haz_hypoxia', relation: 'treats' });
    this.addEdge({ from: 'proc_rad_shelter', to: 'haz_radiation', relation: 'treats' });
    this.addEdge({ from: 'proc_power_shed', to: 'eq_solar_array', relation: 'references' });
    this.addEdge({ from: 'proc_power_shed', to: 'eq_battery', relation: 'references' });
  }
}

// ============================================================================
// BM25 RETRIEVAL
// ============================================================================

interface BM25Doc {
  id: string;
  text: string;
  terms: Map<string, number>;
  length: number;
}

/**
 * BM25 text retrieval over KG node text.
 * Implemented in TypeScript — no embedding model required.
 */
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'of', 'at', 'by', 'for', 'with', 'about',
  'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further',
  'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both',
  'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
  'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
]);

export class BM25Retriever {
  private docs: BM25Doc[] = [];
  private avgDl: number = 0;
  private df: Map<string, number> = new Map();
  private k1: number = 1.5;
  private b: number = 0.75;

  /** Index all nodes from the knowledge graph */
  index(nodes: KGNode[]): void {
    this.docs = [];
    this.df.clear();

    for (const node of nodes) {
      const text = `${node.name} ${node.text}`;
      const terms = this._tokenize(text);
      const termFreq = new Map<string, number>();
      for (const term of terms) {
        termFreq.set(term, (termFreq.get(term) ?? 0) + 1);
      }
      this.docs.push({ id: node.id, text, terms: termFreq, length: terms.length });
    }

    this.avgDl = this.docs.reduce((sum, d) => sum + d.length, 0) / (this.docs.length || 1);

    // Compute document frequency
    for (const doc of this.docs) {
      for (const term of doc.terms.keys()) {
        this.df.set(term, (this.df.get(term) ?? 0) + 1);
      }
    }
  }

  /** Search for relevant documents */
  search(query: string, maxResults: number = 5): { id: string; score: number }[] {
    const queryTerms = this._tokenize(query);
    const N = this.docs.length;
    const scores: { id: string; score: number }[] = [];

    for (const doc of this.docs) {
      let score = 0;
      for (const term of queryTerms) {
        const tf = doc.terms.get(term) ?? 0;
        if (tf === 0) continue;
        const docFreq = this.df.get(term) ?? 0;
        const idf = Math.log((N - docFreq + 0.5) / (docFreq + 0.5) + 1);
        const tfNorm = (tf * (this.k1 + 1)) / (tf + this.k1 * (1 - this.b + this.b * doc.length / this.avgDl));
        score += idf * tfNorm;
      }
      if (score > 0) scores.push({ id: doc.id, score });
    }

    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, maxResults);
  }

  private _tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(t => t.length > 1 && !STOP_WORDS.has(t));
  }
}

// ============================================================================
// CONSTRAINED RENDERER
// ============================================================================

/**
 * Render a Tier 2 response with citation validation.
 * Every block must have citations. Citations must be in the retrieved set.
 * Procedure steps are quoted VERBATIM from graph nodes.
 */
export function renderTier2Response(
  query: string,
  kg: KnowledgeGraph,
  retriever: BM25Retriever,
  phase: string,
  configId: string
): Tier2Response {
  // 1. Retrieve relevant nodes
  const results = retriever.search(query, 5);

  // 2. Empty retrieval = refusal
  if (results.length === 0) {
    return {
      blocks: [{
        text: 'No verified procedure found in on-board library. A P1 downlink question has been queued for Earth.',
        cites: [],
        type: 'refusal',
      }],
      configId,
      retrievalSource: 'BM25',
    };
  }

  const retrievedIds = new Set(results.map(r => r.id));
  const blocks: Tier2Block[] = [];

  // 3. Build response blocks from retrieved nodes + 1-hop expansion
  for (const result of results) {
    const node = kg.getNode(result.id);
    if (!node) continue;

    // Filter by phase
    if (node.phase && node.phase.length > 0 && !node.phase.includes(phase)) continue;

    blocks.push({
      text: node.text, // VERBATIM from graph
      cites: [node.id],
      type: node.type === 'Procedure' ? 'procedure' : 'explanation',
    });

    // 1-hop expansion
    const neighbors = kg.getNeighbors(node.id);
    for (const neighbor of neighbors.slice(0, 3)) {
      if (!retrievedIds.has(neighbor.id)) {
        retrievedIds.add(neighbor.id);
        blocks.push({
          text: neighbor.text,
          cites: [neighbor.id],
          type: 'explanation',
        });
      }
    }
  }

  // 4. Validate — reject blocks without citations or with citations outside retrieved set
  const validated = blocks.filter(b => b.cites.length > 0 && b.cites.every(c => retrievedIds.has(c)));

  return {
    blocks: validated.length > 0 ? validated : [{
      text: 'No verified procedure found in on-board library.',
      cites: [],
      type: 'refusal',
    }],
    configId,
    retrievalSource: 'BM25',
  };
}
