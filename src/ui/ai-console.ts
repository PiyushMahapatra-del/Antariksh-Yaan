/**
 * AEGIS TRANSIT — AI Autonomy Console UI Component
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * TRAINED ON SYNTHETIC DATA
 * G4 Enforced: Advisory Only — Proposals must pass Tier 0 Safety Gate
 * G5 Enforced: NOT MEDICAL ADVICE banner
 * 
 * Features:
 * - Tier 1: Random Forest Diagnostics + Exact Shapley Attribution Bars (6px sharp) + CBR + OOD
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
          padding: 10px;
          height: 100%;
          overflow-y: auto;
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-primary);
          background: var(--bg-panel);
        }
        .ai-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-primary);
          padding-bottom: 6px;
        }
        .ai-title {
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 700;
          color: var(--text-secondary);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .ai-subtabs {
          display: flex;
          gap: 3px;
          background: var(--bg-card);
          padding: 3px;
          border-radius: 4px;
          border: 1px solid var(--border-primary);
        }
        .ai-tab-btn {
          flex: 1;
          padding: 4px 6px;
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-muted);
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 2px;
          text-align: center;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .ai-tab-btn:hover {
          color: var(--text-primary);
        }
        .ai-tab-btn.active {
          background: var(--control-bg);
          border-color: var(--control-border);
          color: var(--control-text);
          font-weight: 700;
        }
        .ai-card {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: 4px;
          padding: 8px 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ai-card-title {
          font-family: var(--font-sans);
          font-size: 10px;
          font-weight: 700;
          color: var(--text-secondary);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 4px;
        }
        .shapley-bar-row {
          display: grid;
          grid-template-columns: 110px 1fr 45px;
          align-items: center;
          gap: 8px;
          height: 20px;
          font-size: 10px;
        }
        .shapley-name {
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .shapley-track {
          height: 6px;
          background: var(--bg-canvas);
          border: 1px solid var(--border-primary);
          border-radius: 0px;
          display: flex;
          align-items: center;
          position: relative;
        }
        .shapley-val-bar {
          height: 6px;
          border-radius: 0px;
        }
        .bar-pos { background: var(--critical-text); }
        .bar-neg { background: var(--nominal-text); }
        .medical-banner {
          background: var(--caution-bg);
          border: 1px solid var(--caution-border);
          border-radius: 4px;
          padding: 6px 10px;
          color: var(--caution-text);
          font-family: var(--font-mono);
          font-weight: 600;
          font-size: 10px;
          text-align: center;
          letter-spacing: 0.04em;
        }
        .search-box {
          display: flex;
          gap: 6px;
          margin-bottom: 8px;
        }
        .search-input {
          flex: 1;
          background: var(--bg-canvas);
          border: 1px solid var(--border-primary);
          border-radius: 2px;
          color: var(--text-primary);
          font-family: var(--font-mono);
          padding: 4px 8px;
          font-size: 11px;
        }
        .search-input:focus {
          border-color: var(--control-text);
          outline: none;
        }
        .search-btn {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          color: var(--control-text);
          font-family: var(--font-mono);
          padding: 4px 10px;
          cursor: pointer;
          border-radius: 2px;
          font-weight: 600;
          transition: all 0.15s ease;
        }
        .search-btn:hover {
          background: var(--control-bg);
          border-color: var(--control-border);
        }
        .arm-btn {
          background: var(--caution-bg);
          border: 1px solid var(--caution-border);
          color: var(--caution-text);
          font-family: var(--font-mono);
          padding: 4px 10px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 2px;
          transition: all 0.15s ease;
        }
        .arm-btn:hover {
          background: rgba(245, 158, 11, 0.25);
        }
        .exec-btn {
          background: var(--critical-bg);
          border: 1px solid var(--critical-border);
          color: var(--critical-text);
          font-family: var(--font-mono);
          padding: 4px 10px;
          font-weight: 700;
          cursor: pointer;
          border-radius: 2px;
          transition: all 0.15s ease;
        }
        .exec-btn:hover {
          background: rgba(239, 68, 68, 0.25);
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
        <div style="text-align: center; color: var(--text-muted); padding: 20px;">
          AWAITING TELEMETRY SAMPLING...
        </div>
      `;
      return;
    }

    const d = this.latestDiagnostic;
    const isFault = d.predictedClass !== 'nominal';

    this.contentEl.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div class="ai-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">CLASSIFIER INFERENCE</span>
            <span class="badge" style="background: ${isFault ? 'var(--critical-bg)' : 'var(--nominal-bg)'}; color: ${isFault ? 'var(--critical-text)' : 'var(--nominal-text)'}; border: 1px solid ${isFault ? 'var(--critical-border)' : 'var(--nominal-border)'};">
              ${d.predictedClass.toUpperCase()} (${(d.confidence * 100).toFixed(1)}%)
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 4px; font-size: 10px;">
            <span style="color: var(--text-muted);">NOVELTY (OOD):</span>
            <span style="color: ${d.isOOD ? 'var(--caution-text)' : 'var(--nominal-text)'}; font-weight: 600;">
              ${d.isOOD ? 'OUT-OF-DISTRIBUTION' : 'IN-DISTRIBUTION'} (dist: ${d.oodDistance.toFixed(2)})
            </span>
          </div>
        </div>

        <div class="ai-card">
          <div class="ai-card-title">
            EXACT SHAPLEY ATTRIBUTION (2ⁿ COALITIONS)
          </div>
          <div style="display: flex; flex-direction: column; gap: 2px;">
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
                  <div style="text-align: right; font-size: 10px; font-variant-numeric: tabular-nums; font-weight: 600; color: ${isPos ? 'var(--critical-text)' : 'var(--nominal-text)'};">
                    ${isPos ? '+' : ''}${val.toFixed(3)}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="ai-card">
          <div class="ai-card-title">
            CASE-BASED REASONING (k-NN HISTORICAL ANALOGS)
          </div>
          ${d.similarCases.map((c: any) => `
            <div style="background: var(--bg-canvas); border: 1px solid var(--border-primary); border-left: 2px solid var(--control-text); padding: 4px 6px; margin-bottom: 4px; font-size: 10px;">
              <div style="display: flex; justify-content: space-between; color: var(--control-text); font-weight: 600;">
                <span>${c.caseId} (${c.faultClass})</span>
                <span class="tabular-nums">${(c.similarity * 100).toFixed(0)}% MATCH</span>
              </div>
              <div style="color: var(--text-muted); margin-top: 2px;">${c.outcome}</div>
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
        <div class="ai-card">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px; align-items: center;">
            <span class="badge phase-badge">${b.type.toUpperCase()}</span>
            <span style="font-size: 9px; color: var(--text-muted);">CITES: ${b.cites.join(', ') || 'NONE'}</span>
          </div>
          <div style="font-size: 11px; line-height: 1.4; color: var(--text-primary);">${b.text}</div>
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
        <div style="text-align: center; color: var(--text-muted); padding: 20px;">
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

        <div class="ai-card">
          <div class="ai-card-title">
            DIFFERENTIAL DIAGNOSIS (NAIVE BAYES)
          </div>
          ${m.differentials.slice(0, 3).map((d: any) => `
            <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-canvas); border: 1px solid var(--border-subtle); padding: 4px 6px; border-radius: 2px;">
              <span style="color: ${d.condition === 'Hypoxia' ? 'var(--critical-text)' : 'var(--text-primary)'}; font-weight: 500;">${d.condition}</span>
              <span style="font-weight: 700; font-variant-numeric: tabular-nums;">${(d.likelihood * 100).toFixed(1)}%</span>
            </div>
          `).join('')}
        </div>

        <div class="ai-card">
          <div class="ai-card-title">
            DECISION TREE EVALUATION PATH
          </div>
          <div style="display: flex; flex-direction: column; gap: 3px; font-size: 10px;">
            ${m.decisionTreePath.map((p: any) => `
              <div style="color: var(--text-muted);">
                ▶ Node <span style="color: var(--control-text); font-weight: 600;">${p.nodeId}</span>: <span style="color: var(--caution-text); font-weight: 600;">${p.decision}</span> (value: <span class="tabular-nums">${p.value.toFixed(1)}</span>)
              </div>
            `).join('')}
          </div>
        </div>

        <div class="ai-card">
          <div class="ai-card-title">
            RECOMMENDED PROTOCOLS (FORMULARY)
          </div>
          ${m.recommendations.map((r: any) => `
            <div style="background: var(--bg-canvas); border-left: 2px solid var(--caution-text); padding: 6px; font-size: 10px;">
              <div style="font-weight: 600; color: var(--caution-text);">${r.action}</div>
              ${r.medication ? `<div style="color: var(--nominal-text); margin-top: 2px; font-weight: 500;">Rx: ${r.medication} (${r.dose}, ${r.route})</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private _renderSafety(): void {
    this.contentEl.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div class="ai-card">
          <div class="ai-card-title">TIER 0 SAFETY GATE (TWO-STAGE INTERLOCK)</div>
          <div style="color: var(--text-muted); font-size: 10px; line-height: 1.4;">
            Autonomous AI recommendations can only propose actions. Human flight controller confirmation
            or deterministic FDIR trigger required for actuator commit.
          </div>
        </div>

        <div class="ai-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 600; font-family: var(--font-sans); text-transform: uppercase;">PROCEDURE: LOOP B FAILOVER</span>
            <span class="badge phase-badge">PROC_LOOP_FAILOVER</span>
          </div>
          <div style="color: var(--text-muted); font-size: 10px;">
            Switches active coolant circulation from Loop A to redundant Loop B.
          </div>
          <div style="display: flex; gap: 6px; margin-top: 4px;">
            <button id="arm-failover-btn" class="arm-btn">STAGE 1: ARM</button>
            <button id="exec-failover-btn" class="exec-btn" style="display: ${this.armedCommandId === 'proc_loop_failover' ? 'block' : 'none'};">
              STAGE 2: COMMIT & EXECUTE
            </button>
          </div>
          <div id="safety-status" style="font-size: 10px; margin-top: 4px; color: var(--caution-text); font-weight: 600;"></div>
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
        statusEl.style.color = 'var(--nominal-text)';
        statusEl.textContent = 'SAFETY GATE PASSED: COMMAND COMMITTED TO ACTUATORS';
        this.bus.emit('safety:actionCommitted', {
          procedureId: 'proc_loop_failover',
          actor: 'crew',
          timestamp: Date.now(),
        });
      } else {
        statusEl.style.color = 'var(--critical-text)';
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
