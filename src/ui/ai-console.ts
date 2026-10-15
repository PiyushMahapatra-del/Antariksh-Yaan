/**
 * AEGIS TRANSIT — AI Autonomy Console UI Component
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * TRAINED ON SYNTHETIC DATA
 * G4 Enforced: Advisory Only — Proposals must pass Tier 0 Safety Gate
 * G5 Enforced: NOT MEDICAL ADVICE banner
 * 
 * Features:
 * - Tier 1: Random Forest Diagnostics + Exact Shapley Attribution Bars + CBR + OOD
 * - Tier 2: Grounded Knowledge Graph & BM25 Procedure Search with Citations
 * - Medical CDSS: Decision Tree Walkthrough + Naive Bayes Differential + Synthetic Formulary
 * - Safety Gate Two-Stage Arm & Execute Panel
 */

import type { EventBus } from '../core/event-bus.js';
import type { AegisEventMap } from '../core/types.js';
import { RandomForest, computeExactShapley, findSimilarCases, computeOODScore, THERMAL_FEATURES } from '../ai/tier1.js';
import { KnowledgeGraph, BM25Retriever, renderTier2Response } from '../ai/tier2.js';
import { runMedicalAssessment, type MedicalAssessment } from '../ai/medical.js';
import type { SafetyGate } from '../fsw/safety-gate.js';

export interface DiagnosticReport {
  predictedClass: string;
  confidence: number;
  shapley: number[];
  similarCases: { caseId: string; faultClass: string; outcome: string; similarity: number }[];
  isOOD: boolean;
  oodDistance: number;
}

export class AIConsole {
  private container: HTMLElement;
  private bus: EventBus<AegisEventMap>;
  private safetyGate: SafetyGate;

  // AI Engines
  private rf: RandomForest;
  private kg: KnowledgeGraph;
  private retriever: BM25Retriever;

  // Tabs
  private activeSubTab: 'TIER1' | 'TIER2' | 'MEDICAL' | 'SAFETY' = 'TIER1';

  // DOM
  private contentEl!: HTMLElement;
  private latestDiagnostic: DiagnosticReport | null = null;
  private latestMedical: MedicalAssessment | null = null;
  private armedCommandId: string | null = null;

  constructor(parent: HTMLElement, bus: EventBus<AegisEventMap>, safetyGate: SafetyGate) {
    this.bus = bus;
    this.safetyGate = safetyGate;

    // Initialize AI engines
    this.rf = new RandomForest();
    this.rf.buildSyntheticForest(25, 5, 42);

    this.kg = new KnowledgeGraph();
    this.retriever = new BM25Retriever();
    this.retriever.index([...this.kg.nodes.values()]);

    this.container = document.createElement('div');
    this.container.className = 'ai-console-panel';
    parent.appendChild(this.container);

    this._buildUI();
  }

  private _buildUI(): void {
    this.container.innerHTML = `
      <style>
        .ai-console-panel {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 12px;
          height: 100%;
          overflow-y: auto;
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-primary);
          background: rgba(10, 16, 26, 0.95);
        }
        .ai-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(0, 229, 255, 0.2);
          padding-bottom: 6px;
        }
        .ai-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--cyan);
          letter-spacing: 1px;
        }
        .ai-subtabs {
          display: flex;
          gap: 4px;
          background: rgba(0, 0, 0, 0.5);
          padding: 3px;
          border-radius: 4px;
        }
        .ai-tab-btn {
          flex: 1;
          padding: 5px 8px;
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-dim);
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          border-radius: 3px;
          text-align: center;
          transition: all 0.2s ease;
        }
        .ai-tab-btn.active {
          background: rgba(0, 229, 255, 0.15);
          border-color: var(--cyan);
          color: var(--cyan);
          text-shadow: var(--glow-cyan);
        }
        .shapley-bar-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 4px 0;
          font-size: 10px;
        }
        .shapley-name {
          width: 110px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: var(--text-dim);
        }
        .shapley-track {
          flex: 1;
          height: 8px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          display: flex;
          align-items: center;
          position: relative;
        }
        .shapley-val-bar {
          height: 100%;
          border-radius: 4px;
        }
        .bar-pos { background: var(--red); }
        .bar-neg { background: var(--green); }
        .medical-banner {
          background: rgba(255, 82, 82, 0.12);
          border: 1px solid var(--red);
          border-radius: 4px;
          padding: 6px 10px;
          color: #ff8a80;
          font-weight: 700;
          font-size: 10px;
          text-align: center;
          letter-spacing: 0.5px;
        }
        .search-box {
          display: flex;
          gap: 6px;
          margin-bottom: 8px;
        }
        .search-input {
          flex: 1;
          background: #000;
          border: 1px solid rgba(0, 229, 255, 0.3);
          border-radius: 3px;
          color: #fff;
          font-family: var(--font-mono);
          padding: 5px 8px;
          font-size: 11px;
        }
        .search-btn {
          background: rgba(0, 229, 255, 0.2);
          border: 1px solid var(--cyan);
          color: var(--cyan);
          font-family: var(--font-mono);
          padding: 5px 12px;
          cursor: pointer;
          border-radius: 3px;
          font-weight: 700;
        }
        .action-card {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(0, 229, 255, 0.2);
          border-radius: 4px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .arm-btn {
          background: rgba(255, 171, 0, 0.2);
          border: 1px solid var(--amber);
          color: var(--amber);
          font-family: var(--font-mono);
          padding: 6px 12px;
          font-weight: 700;
          cursor: pointer;
          border-radius: 3px;
        }
        .exec-btn {
          background: rgba(255, 23, 68, 0.3);
          border: 1px solid var(--red);
          color: #fff;
          font-family: var(--font-mono);
          padding: 6px 12px;
          font-weight: 800;
          cursor: pointer;
          border-radius: 3px;
          animation: pulse 1s infinite alternate;
        }
        @keyframes pulse {
          from { box-shadow: 0 0 5px rgba(255, 23, 68, 0.5); }
          to { box-shadow: 0 0 15px rgba(255, 23, 68, 0.9); }
        }
      </style>

      <div class="ai-header">
        <div class="ai-title">AUTONOMOUS ADVISORY STACK</div>
        <div class="badge phase-badge">PROPOSE-ONLY (G4)</div>
      </div>

      <div class="ai-subtabs">
        <button class="ai-tab-btn active" data-tab="TIER1">TIER 1 (DIAG)</button>
        <button class="ai-tab-btn" data-tab="TIER2">TIER 2 (DOCS)</button>
        <button class="ai-tab-btn" data-tab="MEDICAL">CDSS (MED)</button>
        <button class="ai-tab-btn" data-tab="SAFETY">SAFETY GATE</button>
      </div>

      <div id="ai-content-area" style="flex: 1; overflow-y: auto;">
        <!-- Filled based on active tab -->
      </div>
    `;

    this.contentEl = this.container.querySelector('#ai-content-area')!;

    // Wire up tab buttons
    const tabBtns = this.container.querySelectorAll('.ai-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeSubTab = (btn as HTMLElement).dataset.tab as any;
        this._renderActiveTab();
      });
    });

    this._renderActiveTab();
  }

  /**
   * Run diagnosis on telemetry values
   */
  diagnose(features: number[], backgroundData: number[][]): void {
    const rfPred = this.rf.predict(features);
    const shap = computeExactShapley(this.rf, features.slice(0, 6), backgroundData, 0);

    const cbr = findSimilarCases(
      features.slice(0, 3),
      ['flow_rate', 'pump_dp', 'outlet_temp'],
      [
        { id: 'case-041', features: { flow_rate: 0.15, pump_dp: 18, outlet_temp: 345 }, faultClass: 'pump_failure', outcome: 'Executed Loop B failover. Temperature stabilized in 3.2m.', timestamp: 1000, synthetic: true },
        { id: 'case-088', features: { flow_rate: 0.48, pump_dp: 52, outlet_temp: 292 }, faultClass: 'nominal', outcome: 'Nominal cruise operations maintained.', timestamp: 2000, synthetic: true },
        { id: 'case-112', features: { flow_rate: 0.28, pump_dp: 35, outlet_temp: 315 }, faultClass: 'leak', outcome: 'Isolated secondary loop. Pressurized accumulator.', timestamp: 3000, synthetic: true },
      ],
      2
    );

    const ood = computeOODScore(features.slice(0, 4), backgroundData.map(b => b.slice(0, 4)));

    this.latestDiagnostic = {
      predictedClass: rfPred.predictedClass,
      confidence: rfPred.confidence,
      shapley: shap.shapley.map(s => s.value),
      similarCases: cbr,
      isOOD: ood.isOOD,
      oodDistance: ood.score,
    };

    if (this.activeSubTab === 'TIER1') {
      this._renderTier1();
    }
  }

  /**
   * Run medical assessment
   */
  assessMedical(vitals: Record<string, number>, cabin: Record<string, number>): void {
    this.latestMedical = runMedicalAssessment(['Dyspnea', 'Tachycardia'], vitals, cabin);
    if (this.activeSubTab === 'MEDICAL') {
      this._renderMedical();
    }
  }

  private _renderActiveTab(): void {
    switch (this.activeSubTab) {
      case 'TIER1': this._renderTier1(); break;
      case 'TIER2': this._renderTier2(); break;
      case 'MEDICAL': this._renderMedical(); break;
      case 'SAFETY': this._renderSafety(); break;
    }
  }

  private _renderTier1(): void {
    if (!this.latestDiagnostic) {
      this.contentEl.innerHTML = `
        <div style="text-align: center; color: var(--text-dim); padding: 20px;">
          AWAITING TELEMETRY SAMPLING...
        </div>
      `;
      return;
    }

    const d = this.latestDiagnostic;
    const isFault = d.predictedClass !== 'nominal';

    this.contentEl.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(0,229,255,0.2); border-radius: 4px; padding: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 10px; color: var(--text-dim);">CLASSIFIER INFERENCE</span>
            <span class="badge" style="background: ${isFault ? 'var(--red)' : 'var(--green)'}; color: #fff;">
              ${d.predictedClass.toUpperCase()} (${(d.confidence * 100).toFixed(1)}%)
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 6px; font-size: 10px;">
            <span style="color: var(--text-dim);">NOVELTY (OOD):</span>
            <span style="color: ${d.isOOD ? 'var(--amber)' : 'var(--green)'};">
              ${d.isOOD ? '⚠ OUT-OF-DISTRIBUTION' : 'IN-DISTRIBUTION'} (dist: ${d.oodDistance.toFixed(2)})
            </span>
          </div>
        </div>

        <div>
          <div style="font-size: 10px; font-weight: 700; color: var(--cyan); margin-bottom: 4px;">
            EXACT SHAPLEY ATTRIBUTION (2ⁿ COALITIONS)
          </div>
          ${d.shapley.map((val: number, idx: number) => {
            const name = THERMAL_FEATURES[idx] || `feature_${idx}`;
            const pct = Math.min(100, Math.abs(val) * 200);
            const isPos = val >= 0;
            return `
              <div class="shapley-bar-row">
                <div class="shapley-name" title="${name}">${name}</div>
                <div class="shapley-track">
                  <div class="shapley-val-bar ${isPos ? 'bar-pos' : 'bar-neg'}" style="width: ${pct}%;"></div>
                </div>
                <div style="width: 45px; text-align: right; font-size: 9px; color: ${isPos ? '#ff8a80' : '#b9f6ca'};">
                  ${isPos ? '+' : ''}${val.toFixed(3)}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div>
          <div style="font-size: 10px; font-weight: 700; color: var(--cyan); margin-bottom: 4px;">
            CASE-BASED REASONING (k-NN HISTORICAL ANALOGS)
          </div>
          ${d.similarCases.map((c: any) => `
            <div style="background: rgba(0,0,0,0.3); border-left: 2px solid var(--cyan); padding: 4px 6px; margin-bottom: 4px; font-size: 10px;">
              <div style="display: flex; justify-content: space-between; color: var(--cyan);">
                <span>${c.caseId} (${c.faultClass})</span>
                <span>${(c.similarity * 100).toFixed(0)}% MATCH</span>
              </div>
              <div style="color: var(--text-dim); margin-top: 2px;">${c.outcome}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private _renderTier2(): void {
    this.contentEl.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div class="search-box">
          <input type="text" id="bm25-query" class="search-input" placeholder="Search procedures (e.g. coolant loop, hypoxia)..." value="coolant loop failover" />
          <button id="bm25-search-btn" class="search-btn">SEARCH</button>
        </div>
        <div id="bm25-results" style="display: flex; flex-direction: column; gap: 6px;"></div>
      </div>
    `;

    const searchInput = this.contentEl.querySelector('#bm25-query') as HTMLInputElement;
    const searchBtn = this.contentEl.querySelector('#bm25-search-btn')!;
    const resultsContainer = this.contentEl.querySelector('#bm25-results')!;

    const doSearch = () => {
      const q = searchInput.value.trim();
      if (!q) return;

      const resp = renderTier2Response(q, this.kg, this.retriever, 'Cruise', 'cfg-default');
      resultsContainer.innerHTML = resp.blocks.map(b => `
        <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(0,229,255,0.2); border-radius: 4px; padding: 8px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span class="badge ${b.type === 'procedure' ? 'phase-badge' : ''}">${b.type.toUpperCase()}</span>
            <span style="font-size: 9px; color: var(--text-dim);">CITES: ${b.cites.join(', ') || 'NONE'}</span>
          </div>
          <div style="font-size: 11px; line-height: 1.4; color: var(--text-bright);">${b.text}</div>
        </div>
      `).join('');
    };

    searchBtn.addEventListener('click', doSearch);
    searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
    doSearch(); // Initial query
  }

  private _renderMedical(): void {
    if (!this.latestMedical) {
      this.contentEl.innerHTML = `
        <div class="medical-banner">
          SYNTHETIC: NOT REAL MEDICAL PROCEDURES • NOT MEDICAL ADVICE
        </div>
        <div style="text-align: center; color: var(--text-dim); padding: 20px;">
          AWAITING CREW VITALS SAMPLING...
        </div>
      `;
      return;
    }

    const m = this.latestMedical;

    this.contentEl.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div class="medical-banner">
          SYNTHETIC: NOT REAL MEDICAL PROCEDURES • NOT MEDICAL ADVICE
        </div>

        <div style="font-weight: 700; color: var(--cyan); font-size: 11px;">
          DIFFERENTIAL DIAGNOSIS (NAIVE BAYES)
        </div>
        ${m.differentials.slice(0, 3).map((d: any) => `
          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); padding: 4px 6px; border-radius: 3px;">
            <span style="color: ${d.condition === 'Hypoxia' ? 'var(--red)' : 'var(--text-primary)'};">${d.condition}</span>
            <span style="font-weight: 700;">${(d.likelihood * 100).toFixed(1)}%</span>
          </div>
        `).join('')}

        <div style="font-weight: 700; color: var(--cyan); font-size: 11px; margin-top: 4px;">
          DECISION TREE EVALUATION PATH
        </div>
        <div style="display: flex; flex-direction: column; gap: 3px; font-size: 10px;">
          ${m.decisionTreePath.map((p: any) => `
            <div style="color: var(--text-dim);">
              ▶ Node <span style="color: var(--cyan);">${p.nodeId}</span>: <span style="color: var(--amber);">${p.decision}</span> (value: ${p.value.toFixed(1)})
            </div>
          `).join('')}
        </div>

        <div style="font-weight: 700; color: var(--cyan); font-size: 11px; margin-top: 4px;">
          RECOMMENDED PROTOCOLS (FORMULARY)
        </div>
        ${m.recommendations.map((r: any) => `
          <div style="background: rgba(0,0,0,0.4); border-left: 2px solid var(--amber); padding: 6px; font-size: 10px;">
            <div style="font-weight: 700; color: var(--amber);">${r.action}</div>
            ${r.medication ? `<div style="color: var(--green); margin-top: 2px;">Rx: ${r.medication} (${r.dose}, ${r.route})</div>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  private _renderSafety(): void {
    this.contentEl.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div class="action-card">
          <div style="font-weight: 700; color: var(--cyan);">TIER 0 SAFETY GATE (TWO-STAGE INTERLOCK)</div>
          <div style="color: var(--text-dim); font-size: 10px; line-height: 1.3;">
            Autonomous AI recommendations can only propose actions. Human flight controller confirmation
            or deterministic FDIR trigger required for actuator commit.
          </div>
        </div>

        <div class="action-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700;">PROCEDURE: LOOP B FAILOVER</span>
            <span class="badge phase-badge">PROC_LOOP_FAILOVER</span>
          </div>
          <div style="color: var(--text-dim); font-size: 10px;">
            Switches active coolant circulation from Loop A to redundant Loop B.
          </div>
          <div style="display: flex; gap: 8px; margin-top: 6px;">
            <button id="arm-failover-btn" class="arm-btn">STAGE 1: ARM</button>
            <button id="exec-failover-btn" class="exec-btn" style="display: ${this.armedCommandId === 'proc_loop_failover' ? 'block' : 'none'};">
              STAGE 2: COMMIT & EXECUTE
            </button>
          </div>
          <div id="safety-status" style="font-size: 10px; margin-top: 4px; color: var(--amber);"></div>
        </div>
      </div>
    `;

    const armBtn = this.contentEl.querySelector('#arm-failover-btn') as HTMLButtonElement;
    const execBtn = this.contentEl.querySelector('#exec-failover-btn') as HTMLButtonElement;
    const statusEl = this.contentEl.querySelector('#safety-status') as HTMLElement;

    armBtn.addEventListener('click', () => {
      this.armedCommandId = 'proc_loop_failover';
      const evalResult = this.safetyGate.evaluate('proc_loop_failover', {});
      execBtn.style.display = 'block';
      statusEl.textContent = evalResult.requiresCrewConfirm
        ? 'INTERLOCK ARMED. OPERATOR CONFIRMATION REQUIRED.'
        : `STATUS: ${evalResult.approved ? 'READY' : evalResult.reasons.join(', ')}`;
    });

    execBtn.addEventListener('click', () => {
      const confirmResult = this.safetyGate.confirmPending();
      if (confirmResult && confirmResult.approved) {
        statusEl.style.color = 'var(--green)';
        statusEl.textContent = 'SAFETY GATE PASSED: COMMAND COMMITTED TO ACTUATORS';
        this.bus.emit('safety:actionCommitted', {
          procedureId: 'proc_loop_failover',
          actor: 'crew',
          timestamp: Date.now(),
        });
      } else {
        statusEl.style.color = 'var(--red)';
        statusEl.textContent = 'SAFETY GATE: CONFIRMATION FAILED OR REJECTED';
      }
      this.armedCommandId = null;
      execBtn.style.display = 'none';
    });
  }

  show(): void {
    this.container.style.display = 'flex';
  }

  hide(): void {
    this.container.style.display = 'none';
  }
}
