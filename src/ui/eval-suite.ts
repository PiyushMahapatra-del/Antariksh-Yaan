/**
 * AEGIS TRANSIT — Automated Verification & Evaluation Suite UI Component
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Displays real-time and cached benchmark evaluation metrics:
 * 1. Time to first diagnosis
 * 2. Refusal rate on 20 out-of-knowledge questions
 * 3. Maximum Shapley additivity error
 * 4. Explanation rank-stability
 * 5. Spool delivery stats
 * 6. Swap verification
 * 7. Kepler solver precision
 * 8. Sensor noise & Gaussian distribution
 * 
 * Runs non-blockingly via Web Worker on load, cached in IndexedDB with
 * timestamp, RNG seed, and build-time injected git commit hash.
 */

import { getLatestEvalResults, saveEvalResults, type CachedEvalRecord } from './eval-storage.js';
import { runEvalBenchmarks } from './eval-runner.js';

export class EvalSuite {
  private container: HTMLElement;
  private currentRecord: CachedEvalRecord | null = null;
  private isRunning: boolean = false;
  private worker: Worker | null = null;

  // DOM elements
  private reportContainer!: HTMLElement;
  private runBtn!: HTMLButtonElement;
  private summaryBadge!: HTMLElement;
  private metaBanner!: HTMLElement;

  constructor(parent: HTMLElement) {
    this.container = document.createElement('div');
    this.container.className = 'eval-suite-panel';
    parent.appendChild(this.container);

    this._buildUI();
    this._initWorker();
    this._loadInitialData();
  }

  private _buildUI(): void {
    this.container.innerHTML = `
      <style>
        .eval-suite-panel {
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
        .eval-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-primary);
          padding-bottom: 6px;
        }
        .eval-title {
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 700;
          color: var(--text-secondary);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .eval-controls-row {
          display: flex;
          gap: 8px;
          align-items: center;
          justify-content: space-between;
        }
        .eval-run-btn {
          background: var(--control-bg);
          border: 1px solid var(--control-border);
          color: var(--control-text);
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .eval-run-btn:hover:not(:disabled) {
          background: rgba(56, 189, 248, 0.25);
        }
        .eval-run-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .eval-meta-banner {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 16px;
          padding: 6px 10px;
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: 4px;
          font-size: 10px;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }
        .eval-meta-item {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .eval-meta-val {
          color: var(--text-primary);
          font-weight: 600;
          font-variant-numeric: tabular-nums;
        }
        .eval-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
          font-family: var(--font-mono);
        }
        .eval-table th {
          text-align: left;
          color: var(--text-muted);
          font-family: var(--font-sans);
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 6px 8px;
          background: var(--bg-card);
          border-bottom: 1px solid var(--border-primary);
          position: sticky;
          top: 0;
          z-index: 1;
        }
        .eval-table td {
          padding: 6px 8px;
          border-bottom: 1px solid rgba(30, 41, 59, 0.4);
          vertical-align: middle;
        }
        .eval-badge-pass {
          color: var(--nominal-text);
          font-weight: 700;
        }
        .eval-badge-fail {
          color: var(--critical-text);
          font-weight: 700;
        }
        .eval-report-box {
          flex: 1;
          overflow-y: auto;
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: 4px;
          padding: 4px;
        }
      </style>

      <div class="eval-header">
        <div class="eval-title">AUTOMATED VERIFICATION & BENCHMARK SUITE</div>
        <div id="eval-summary-badge" class="badge phase-badge">INITIALIZING...</div>
      </div>

      <div class="eval-controls-row">
        <button id="run-eval-btn" class="eval-run-btn">
          RE-RUN BENCHMARKS ▶
        </button>
        <span style="color: var(--text-muted); font-size: 10px;">
          Non-blocking background worker evaluation. Cached in IndexedDB.
        </span>
      </div>

      <div id="eval-meta-banner" class="eval-meta-banner" style="display: none;"></div>

      <div id="eval-report-container" class="eval-report-box">
        <div style="color: var(--text-muted); text-align: center; padding: 30px;">
          Loading automated verification benchmark results...
        </div>
      </div>
    `;

    this.reportContainer = this.container.querySelector('#eval-report-container')!;
    this.runBtn = this.container.querySelector('#run-eval-btn') as HTMLButtonElement;
    this.summaryBadge = this.container.querySelector('#eval-summary-badge')!;
    this.metaBanner = this.container.querySelector('#eval-meta-banner')!;

    this.runBtn.addEventListener('click', () => this.runAllTests(Date.now() % 100000));
  }

  private _initWorker(): void {
    if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
      try {
        this.worker = new Worker(new URL('./eval-worker.js', import.meta.url), { type: 'module' });
        this.worker.onmessage = async (e: MessageEvent) => {
          const { type, data } = e.data || {};
          if (type === 'EVAL_COMPLETE' && data) {
            await saveEvalResults(data);
            this.currentRecord = data;
            this._renderResults(data);
            this._setRunningState(false);
          } else if (type === 'EVAL_ERROR') {
            this._setRunningState(false);
          }
        };
      } catch {
        this.worker = null;
      }
    }
  }

  private async _loadInitialData(): Promise<void> {
    try {
      const cached = await getLatestEvalResults();
      if (cached && cached.results && cached.results.length > 0) {
        this.currentRecord = cached;
        this._renderResults(cached);
      } else {
        // No cached results yet: run quick evaluation immediately
        await this.runAllTests(42);
      }
    } catch {
      await this.runAllTests(42);
    }
  }

  async runAllTests(seed: number = 42): Promise<CachedEvalRecord> {
    if (this.isRunning) {
      return this.currentRecord ?? runEvalBenchmarks(seed);
    }

    this._setRunningState(true);

    if (this.worker) {
      this.worker.postMessage({ type: 'RUN_EVAL', seed });
      // Worker will post back EVAL_COMPLETE
      // Return a temporary record or await
      return new Promise<CachedEvalRecord>((resolve) => {
        const handler = (e: MessageEvent) => {
          if (e.data?.type === 'EVAL_COMPLETE') {
            this.worker?.removeEventListener('message', handler);
            resolve(e.data.data);
          }
        };
        this.worker?.addEventListener('message', handler);
      });
    }

    // Direct synchronous fallback (e.g. Node tests or worker-unsupported browsers)
    try {
      const record = await runEvalBenchmarks(seed);
      await saveEvalResults(record);
      this.currentRecord = record;
      this._renderResults(record);
      this._setRunningState(false);
      return record;
    } catch (err) {
      this._setRunningState(false);
      throw err;
    }
  }

  private _setRunningState(running: boolean): void {
    this.isRunning = running;
    this.runBtn.disabled = running;
    if (running) {
      this.summaryBadge.textContent = 'RUNNING BENCHMARKS...';
      this.summaryBadge.className = 'badge';
      this.summaryBadge.style.background = 'var(--caution-bg)';
      this.summaryBadge.style.border = '1px solid var(--caution-border)';
      this.summaryBadge.style.color = 'var(--caution-text)';
    }
  }

  private _renderResults(record: CachedEvalRecord): void {
    const { results, summary, timestamp, gitCommitHash, rngSeed } = record;
    const allPassed = summary.allPassed;

    this.summaryBadge.textContent = allPassed
      ? `ALL PASSED (${summary.totalPassed}/${summary.totalTests})`
      : `FAILURES DETECTED (${summary.totalPassed}/${summary.totalTests})`;
    this.summaryBadge.className = 'badge';
    this.summaryBadge.style.background = allPassed ? 'var(--nominal-bg)' : 'var(--critical-bg)';
    this.summaryBadge.style.border = allPassed ? '1px solid var(--nominal-border)' : '1px solid var(--critical-border)';
    this.summaryBadge.style.color = allPassed ? 'var(--nominal-text)' : 'var(--critical-text)';

    // Render metadata banner
    this.metaBanner.style.display = 'flex';
    this.metaBanner.innerHTML = `
      <div class="eval-meta-item">
        <span>LAST RUN:</span>
        <span class="eval-meta-val">${timestamp.replace('T', ' ').substring(0, 19)} UTC</span>
      </div>
      <div class="eval-meta-item">
        <span>GIT COMMIT:</span>
        <span class="eval-meta-val" style="color: var(--control-text);">${gitCommitHash}</span>
      </div>
      <div class="eval-meta-item">
        <span>RNG SEED:</span>
        <span class="eval-meta-val">${rngSeed}</span>
      </div>
      <div class="eval-meta-item">
        <span>TOTAL RUNTIME:</span>
        <span class="eval-meta-val">${summary.durationMs.toFixed(1)} ms</span>
      </div>
    `;

    // Render results table
    this.reportContainer.innerHTML = `
      <table class="eval-table">
        <thead>
          <tr>
            <th>SUITE</th>
            <th>TEST NAME</th>
            <th>STATUS</th>
            <th>METRIC</th>
            <th>MEASURED VALUE</th>
            <th>THRESHOLD</th>
            <th>TIME</th>
          </tr>
        </thead>
        <tbody>
          ${results.map(r => `
            <tr>
              <td style="color: var(--text-primary); font-weight: 600;">${r.suiteName}</td>
              <td style="color: var(--text-secondary);">${r.testName}</td>
              <td class="${r.passed ? 'eval-badge-pass' : 'eval-badge-fail'}">
                ${r.passed ? '✓ PASS' : '✗ FAIL'}
              </td>
              <td style="color: var(--text-muted);">${r.metricName}</td>
              <td style="font-weight: 600; color: var(--text-primary); font-variant-numeric: tabular-nums;">${r.measuredValue}</td>
              <td style="color: var(--text-muted); font-variant-numeric: tabular-nums;">${r.targetThreshold}</td>
              <td style="color: var(--text-muted); font-variant-numeric: tabular-nums;">${r.durationMs.toFixed(1)} ms</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  show(): void {
    this.container.style.display = 'flex';
  }

  hide(): void {
    this.container.style.display = 'none';
  }
}
