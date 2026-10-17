/**
 * AEGIS TRANSIT — AI Autonomy Console UI Component
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * TRAINED ON SYNTHETIC DATA
 * Advisory Only — Proposals must pass Tier 0 Safety Gate
 * NOT MEDICAL ADVICE banner
 * 
 * Features:
 * - Tier 1: Random Forest Diagnostics + Exact Shapley Attribution Bars (6px sharp) + CBR + OOD
 * - Tier 2: Grounded Knowledge Graph & BM25 Procedure Search with Citations
 * - Medical CDSS: Decision Tree Walkthrough + Naive Bayes Differential + Synthetic Formulary
 * - Safety Gate Two-Stage Arm & Execute Panel
 */

import type { EventBus } from '../core/event-bus.js';
import type { AegisEventMap } from '../core/types.js';
import {
  RandomForest,
  computeExactShapley,
  findSimilarCases,
  computeOODScore,
  featurize,
  FAULT_CLASSES,
  type ShapleyValue,
} from '../ai/tier1.js';
import { KnowledgeGraph, BM25Retriever, renderTier2Response } from '../ai/tier2.js';
import { runMedicalAssessment, type MedicalAssessment } from '../ai/medical.js';
import type { SafetyGate } from '../fsw/safety-gate.js';

export interface DiagnosticReport {
  predictedClass: string;
  confidence: number;
  rawFeatures: number[];
  shapley: ShapleyValue[];
  baseline: number;
  prediction: number;
  additivityError: number;
  similarCases: { caseId: string; faultClass: string; outcome: string; similarity: number }[];
  isOOD: boolean;
  oodDistance: number;
  oodThreshold: number;
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
  private explainRequested: boolean = false;
  private currentTier1Mode: 'empty' | 'monitoring' | 'attribution' | 'invalid' = 'empty';

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
          grid-template-columns: 140px 1fr 75px;
          align-items: center;
          gap: 8px;
          height: 24px;
          font-size: 10px;
        }
        .shapley-name {
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .shapley-track {
          height: 12px;
          background: var(--bg-canvas);
          border: 1px solid var(--border-subtle);
          border-radius: 2px;
          position: relative;
          overflow: hidden;
        }
        .shapley-center-line {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 1px;
          background: var(--border-primary);
          z-index: 2;
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
        <div class="badge phase-badge">PROPOSE-ONLY</div>
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
  diagnose(featuresInput: unknown, backgroundData?: number[][]): void {
    const rawFeatures = featurize(featuresInput);
    const rfPred = this.rf.predict(rawFeatures);
    const bg = backgroundData && backgroundData.length > 0 ? backgroundData : this.rf.background;
    const ood = computeOODScore(rawFeatures, bg, 5, this.rf);

    const classIdx = Math.max(0, FAULT_CLASSES.indexOf(rfPred.predictedClass));
    const shap = computeExactShapley(this.rf, rawFeatures, bg, classIdx);

    const cbr = findSimilarCases(
      rawFeatures.slice(0, 3),
      ['flow_rate', 'pump_dp', 'outlet_temp'],
      [
        { id: 'case-041', features: { flow_rate: 0.15, pump_dp: 77.5, outlet_temp: 312 }, faultClass: 'pump_failure', outcome: 'Executed Loop B failover. Temperature stabilized in 3.2m.', timestamp: 1000, synthetic: true },
        { id: 'case-088', features: { flow_rate: 0.45, pump_dp: 155.0, outlet_temp: 292.5 }, faultClass: 'nominal', outcome: 'Nominal cruise operations maintained.', timestamp: 2000, synthetic: true },
        { id: 'case-112', features: { flow_rate: 0.45, pump_dp: 155.0, outlet_temp: 292.5 }, faultClass: 'leak', outcome: 'Isolated secondary loop. Pressurized accumulator.', timestamp: 3000, synthetic: true },
      ],
      2
    );

    this.latestDiagnostic = {
      predictedClass: ood.isOOD ? 'unknown' : rfPred.predictedClass,
      confidence: ood.isOOD ? 0 : rfPred.confidence,
      rawFeatures,
      shapley: shap.shapley,
      baseline: shap.baseline,
      prediction: shap.prediction,
      additivityError: shap.additivityError,
      similarCases: cbr,
      isOOD: ood.isOOD,
      oodDistance: ood.score,
      oodThreshold: ood.threshold,
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

  private _renderTier1(forceRebuild = false): void {
    if (!this.latestDiagnostic) {
      this.contentEl.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 20px;">
          AWAITING TELEMETRY SAMPLING...
        </div>
      `;
      this.currentTier1Mode = 'empty';
      return;
    }

    const d = this.latestDiagnostic;
    const isFault = d.predictedClass !== 'nominal' || d.isOOD;
    const showAttribution = isFault || this.explainRequested;
    const targetMode = !showAttribution ? 'monitoring' : (d.additivityError > 1e-6 ? 'invalid' : 'attribution');

    // In-place dynamic update if DOM structure is already established
    if (!forceRebuild && this.currentTier1Mode === targetMode) {
      const inferBadge = this.contentEl.querySelector('#diag-infer-badge');
      if (inferBadge) {
        inferBadge.textContent = `${d.predictedClass.toUpperCase()} (${(d.confidence * 100).toFixed(1)}%)`;
        inferBadge.setAttribute('style', `background: ${isFault ? 'var(--critical-bg)' : 'var(--nominal-bg)'}; color: ${isFault ? 'var(--critical-text)' : 'var(--nominal-text)'}; border: 1px solid ${isFault ? 'var(--critical-border)' : 'var(--nominal-border)'};`);
      }
      const oodEl = this.contentEl.querySelector('#diag-ood-val');
      if (oodEl) {
        oodEl.textContent = `${d.isOOD ? 'OUT-OF-DISTRIBUTION' : 'IN-DISTRIBUTION'} (dist: ${d.oodDistance.toFixed(2)})`;
        oodEl.setAttribute('style', `color: ${d.isOOD ? 'var(--caution-text)' : 'var(--nominal-text)'}; font-weight: 600;`);
      }
      if (targetMode === 'monitoring') {
        const monConf = this.contentEl.querySelector('#diag-mon-conf');
        if (monConf) monConf.textContent = `NOMINAL (${(d.confidence * 100).toFixed(1)}%)`;
        const monOod = this.contentEl.querySelector('#diag-mon-ood');
        if (monOod) monOod.textContent = d.oodDistance.toFixed(2);
      }
      return;
    }

    this.currentTier1Mode = targetMode;

    const formatRaw = (feat: string, val: number): string => {
      switch (feat) {
        case 'flow_rate': return `${val.toFixed(3)} kg/s`;
        case 'pump_dp': return `${val.toFixed(1)} kPa`;
        case 'pump_rpm': return `${Math.round(val)} RPM`;
        case 'outlet_temp': return `${val.toFixed(1)} K`;
        case 'inlet_temp': return `${val.toFixed(1)} K`;
        case 'accumulator_level': return `${(val * 100).toFixed(1)}%`;
        default: return val.toFixed(2);
      }
    };

    let attributionContent = '';
    if (showAttribution) {
      if (d.additivityError > 1e-6) {
        attributionContent = `
          <div class="ai-card">
            <div class="ai-card-title">EXACT SHAPLEY ATTRIBUTION (2ⁿ COALITIONS)</div>
            <div style="display: flex; align-items: center; gap: 8px; padding: 8px;">
              <span class="badge" style="background: var(--critical-bg); color: var(--critical-text); border: 1px solid var(--critical-border); font-weight: 700;">
                ATTRIBUTION INVALID
              </span>
              <span style="font-size: 10px; color: var(--text-muted);">
                Additivity residual (${d.additivityError.toExponential(2)}) exceeds 1e-6 tolerance.
              </span>
            </div>
          </div>
        `;
      } else {
        const sortedShapley = [...d.shapley].sort((a, b) => Math.abs(b.phi) - Math.abs(a.phi));
        const maxAbsPhi = Math.max(0.05, ...sortedShapley.map(s => Math.abs(s.phi)));

        attributionContent = `
          <div class="ai-card">
            <div style="display: flex; justify-content: space-between; align-items: center;" class="ai-card-title">
              <span>EXACT SHAPLEY ATTRIBUTION (2ⁿ COALITIONS)</span>
              ${this.explainRequested && !isFault ? `
                <button id="btn-collapse-explain" class="search-btn" style="padding: 2px 6px; font-size: 9px;">
                  COLLAPSE
                </button>
              ` : ''}
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: var(--text-muted); padding: 2px 0;">
              <span>TARGET: <strong style="color: var(--text-primary);">${d.predictedClass.toUpperCase()}</strong> (f(x) = <span class="tabular-nums" style="color: var(--control-text); font-weight: 600;">${d.prediction.toFixed(3)}</span>)</span>
              <span>BASELINE: E[f(x)] = <span class="tabular-nums" style="color: var(--text-secondary); font-weight: 600;">${d.baseline.toFixed(3)}</span></span>
            </div>

            <div style="display: flex; justify-content: space-between; font-size: 9px; color: var(--text-muted); padding: 2px 80px 2px 145px; border-bottom: 1px solid var(--border-subtle);">
              <span>← DECREASES P(${d.predictedClass.toUpperCase()})</span>
              <span>0.0</span>
              <span>INCREASES P(${d.predictedClass.toUpperCase()}) →</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 4px;">
              ${sortedShapley.map((s: ShapleyValue) => {
                const widthPct = Math.min(50, (Math.abs(s.phi) / maxAbsPhi) * 50);
                const isPos = s.phi >= 0;
                const signStr = isPos ? `+${s.phi.toFixed(3)} [▲]` : `${s.phi.toFixed(3)} [▼]`;
                const rawStr = formatRaw(s.feature, s.value);

                return `
                  <div class="shapley-bar-row">
                    <div style="display: flex; flex-direction: column; overflow: hidden;">
                      <span class="shapley-name" title="${s.feature}">${s.feature}</span>
                      <span style="font-size: 9px; color: var(--text-muted); font-variant-numeric: tabular-nums;">(raw: ${rawStr})</span>
                    </div>
                    <div class="shapley-track">
                      <div class="shapley-center-line"></div>
                      ${isPos ? `
                        <div style="position: absolute; left: 50%; top: 1px; bottom: 1px; width: ${widthPct}%; background: var(--critical-text); border-radius: 1px;"></div>
                      ` : `
                        <div style="position: absolute; right: 50%; top: 1px; bottom: 1px; width: ${widthPct}%; background: var(--nominal-text); border-radius: 1px;"></div>
                      `}
                    </div>
                    <div style="text-align: right; font-size: 10px; font-variant-numeric: tabular-nums; font-weight: 600; color: ${isPos ? 'var(--critical-text)' : 'var(--nominal-text)'};">
                      ${signStr}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }
    } else {
      attributionContent = `
        <div class="ai-card" style="border-left: 2px solid var(--nominal-text);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; font-weight: 600; color: var(--nominal-text); display: flex; align-items: center; gap: 6px;">
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--nominal-text);"></span>
              No active fault. Monitoring
            </span>
            <span id="diag-mon-conf" class="badge" style="background: var(--nominal-bg); color: var(--nominal-text); border: 1px solid var(--nominal-border);">
              NOMINAL (${(d.confidence * 100).toFixed(1)}%)
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--text-muted); margin-top: 6px;">
            <span>Anomaly Score (OOD Dist): <span id="diag-mon-ood" class="tabular-nums" style="color: var(--text-primary); font-weight: 600;">${d.oodDistance.toFixed(2)}</span> / threshold ${d.oodThreshold.toFixed(1)}</span>
            <span style="color: var(--nominal-text); font-weight: 600;">IN-DISTRIBUTION</span>
          </div>
          <div style="margin-top: 8px;">
            <button id="explain-state-btn" class="search-btn" style="width: 100%; padding: 5px 8px; font-size: 10px; font-weight: 600;">
              EXPLAIN CURRENT STATE
            </button>
          </div>
        </div>
      `;
    }

    this.contentEl.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div class="ai-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">CLASSIFIER INFERENCE</span>
            <span id="diag-infer-badge" class="badge" style="background: ${isFault ? 'var(--critical-bg)' : 'var(--nominal-bg)'}; color: ${isFault ? 'var(--critical-text)' : 'var(--nominal-text)'}; border: 1px solid ${isFault ? 'var(--critical-border)' : 'var(--nominal-border)'};">
              ${d.predictedClass.toUpperCase()} (${(d.confidence * 100).toFixed(1)}%)
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 4px; font-size: 10px;">
            <span style="color: var(--text-muted);">NOVELTY (OOD):</span>
            <span id="diag-ood-val" style="color: ${d.isOOD ? 'var(--caution-text)' : 'var(--nominal-text)'}; font-weight: 600;">
              ${d.isOOD ? 'OUT-OF-DISTRIBUTION' : 'IN-DISTRIBUTION'} (dist: ${d.oodDistance.toFixed(2)})
            </span>
          </div>
        </div>

        ${attributionContent}

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

    // Wire up explain / collapse buttons
    const explainBtn = this.contentEl.querySelector('#explain-state-btn');
    if (explainBtn) {
      explainBtn.addEventListener('click', () => {
        this.explainRequested = true;
        this._renderTier1(true);
      });
    }

    const collapseBtn = this.contentEl.querySelector('#btn-collapse-explain');
    if (collapseBtn) {
      collapseBtn.addEventListener('click', () => {
        this.explainRequested = false;
        this._renderTier1(true);
      });
    }
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
