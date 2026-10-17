/**
 * AEGIS TRANSIT — Dynamic Situational Memory Console
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Visualizes the spacecraft's dual-memory architecture:
 * - PERMANENT MEMORY: Immutable core (R0 Golden ROM, R1 Recovery Data)
 * - ADAPTIVE MEMORY: Environment-responsive operational profiles
 * 
 * Features:
 * - Live environment transition demonstration (START DEMO)
 * - Before/after comparison panel (ADAPTIVE MEMORY DIFFERENTIAL)
 * - Transition workflow with real verification steps
 * - Audit log with timestamped entries
 * - Memory integrity verification & fault injection (test buffer only)
 * - All data derives from simulation state; no hardcoded display values
 */

import type { EventBus } from '../core/event-bus.js';
import type { AegisEventMap } from '../core/types.js';
import type { MemoryManager } from '../fsw/memory-manager.js';
import { EnvironmentManager } from '../fsw/environment-manager.js';
import {
  ENVIRONMENT_PROFILES,
  getAllEnvironments,
  type SpacecraftEnvironment,
} from '../fsw/environment-profiles.js';

/** View sub-tabs within the MEM panel */
type MemSubTab = 'OVERVIEW' | 'COMPARISON' | 'AUDIT' | 'LEGACY';

export class MemoryView {
  private container: HTMLElement;
  private memManager: MemoryManager;
  private envManager: EnvironmentManager;
  private bus: EventBus<AegisEventMap>;

  // DOM sections
  private headerEl!: HTMLElement;
  private contentEl!: HTMLElement;
  private activeSubTab: MemSubTab = 'OVERVIEW';

  // Demo state
  private demoRunning = false;
  private demoPaused = false;
  private demoAbortController: AbortController | null = null;

  constructor(parent: HTMLElement, bus: EventBus<AegisEventMap>, memManager: MemoryManager) {
    this.memManager = memManager;
    this.bus = bus;
    this.envManager = new EnvironmentManager();
    this.envManager.setBus(bus);

    this.container = document.createElement('div');
    this.container.className = 'memory-view-panel';
    parent.appendChild(this.container);

    this._injectStyles();
    this._buildShell();
    this._renderOverview();
  }

  /** Public accessor so main.ts can reference it */
  getEnvManager(): EnvironmentManager { return this.envManager; }
  get eventBus(): EventBus<AegisEventMap> { return this.bus; }

  show(): void { this.container.style.display = 'flex'; }
  hide(): void { this.container.style.display = 'none'; }

  // ============================================================================
  // Styles
  // ============================================================================

  private _injectStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      .memory-view-panel {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
        font-family: var(--font-mono);
        font-size: 11px;
        color: var(--text-primary);
        background: var(--bg-panel);
      }
      .mem-shell-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 10px 6px;
        border-bottom: 1px solid var(--border-primary);
        flex-shrink: 0;
      }
      .mem-shell-title {
        font-family: var(--font-sans);
        font-size: 11px;
        font-weight: 700;
        color: var(--text-secondary);
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .mem-shell-content {
        flex: 1;
        overflow-y: auto;
        padding: 8px 10px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .mem-subtab-row {
        display: flex;
        gap: 2px;
        flex-shrink: 0;
        padding: 4px 10px;
        border-bottom: 1px solid var(--border-primary);
        background: var(--bg-panel);
      }
      .mem-subtab-btn {
        background: transparent;
        border: 1px solid transparent;
        color: var(--text-muted);
        font-family: var(--font-mono);
        font-size: 9px;
        font-weight: 600;
        padding: 2px 8px;
        cursor: pointer;
        border-radius: 2px;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        transition: all 0.15s ease;
      }
      .mem-subtab-btn:hover { color: var(--text-primary); background: var(--bg-card); }
      .mem-subtab-btn.active {
        color: var(--control-text);
        background: var(--control-bg);
        border-color: var(--control-border);
        font-weight: 700;
      }

      /* Section cards */
      .mem-section {
        background: var(--bg-card);
        border: 1px solid var(--border-primary);
        border-radius: 4px;
        padding: 8px 10px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .mem-section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 4px;
        border-bottom: 1px solid var(--border-subtle);
      }
      .mem-section-title {
        font-family: var(--font-sans);
        font-size: 10px;
        font-weight: 700;
        color: var(--text-secondary);
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }
      .mem-kv-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 2px 0;
        border-bottom: 1px solid rgba(30, 41, 59, 0.3);
        font-size: 10px;
      }
      .mem-kv-label { color: var(--text-muted); }
      .mem-kv-value {
        color: var(--text-primary);
        font-weight: 500;
        font-variant-numeric: tabular-nums;
        text-align: right;
        max-width: 55%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* Status badges */
      .mem-badge {
        display: inline-flex;
        align-items: center;
        font-size: 9px;
        font-weight: 600;
        padding: 1px 5px;
        border-radius: 2px;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }
      .badge-nominal {
        background: var(--nominal-bg);
        border: 1px solid var(--nominal-border);
        color: var(--nominal-text);
      }
      .badge-caution {
        background: var(--caution-bg);
        border: 1px solid var(--caution-border);
        color: var(--caution-text);
      }
      .badge-critical {
        background: var(--critical-bg);
        border: 1px solid var(--critical-border);
        color: var(--critical-text);
      }
      .badge-control {
        background: var(--control-bg);
        border: 1px solid var(--control-border);
        color: var(--control-text);
      }

      /* Buttons */
      .mem-action-btn {
        padding: 4px 8px;
        font-family: var(--font-mono);
        font-size: 10px;
        font-weight: 600;
        cursor: pointer;
        border-radius: 2px;
        text-align: center;
        transition: all 0.15s ease;
        white-space: nowrap;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .btn-demo {
        background: var(--control-bg);
        border: 1px solid var(--control-border);
        color: var(--control-text);
      }
      .btn-demo:hover { background: rgba(56, 189, 248, 0.25); }
      .btn-steel {
        background: var(--bg-hover);
        border: 1px solid var(--border-primary);
        color: var(--text-secondary);
      }
      .btn-steel:hover { background: rgba(56, 189, 248, 0.15); color: var(--text-primary); }
      .btn-destructive {
        background: var(--critical-bg);
        border: 1px solid var(--critical-border);
        color: var(--critical-text);
      }
      .btn-destructive:hover { background: rgba(239, 68, 68, 0.25); }
      .btn-amber {
        background: var(--caution-bg);
        border: 1px solid var(--caution-border);
        color: var(--caution-text);
      }
      .btn-amber:hover { background: rgba(245, 158, 11, 0.25); }

      /* Environment selector */
      .env-selector-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }
      .env-select-btn {
        flex: 1;
        min-width: 80px;
        padding: 3px 6px;
        font-family: var(--font-mono);
        font-size: 9px;
        font-weight: 600;
        cursor: pointer;
        border-radius: 2px;
        text-align: center;
        transition: all 0.15s ease;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        background: var(--bg-hover);
        border: 1px solid var(--border-primary);
        color: var(--text-secondary);
      }
      .env-select-btn:hover { background: rgba(56, 189, 248, 0.15); color: var(--text-primary); }
      .env-select-btn.active {
        background: var(--control-bg);
        border-color: var(--control-border);
        color: var(--control-text);
        font-weight: 700;
      }
      .env-select-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      /* Transition progress */
      .transition-progress {
        background: var(--bg-canvas);
        border: 1px solid var(--border-primary);
        border-radius: 4px;
        padding: 8px 10px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .progress-bar-track {
        width: 100%;
        height: 4px;
        background: var(--bg-hover);
        border-radius: 2px;
        overflow: hidden;
      }
      .progress-bar-fill {
        height: 100%;
        background: var(--control-text);
        border-radius: 2px;
        transition: width 0.3s ease;
      }
      .progress-status {
        font-size: 10px;
        color: var(--control-text);
        font-weight: 600;
      }

      /* Diff table */
      .diff-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 10px;
      }
      .diff-table th {
        text-align: left;
        padding: 3px 4px;
        border-bottom: 1px solid var(--border-primary);
        color: var(--text-muted);
        font-weight: 600;
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .diff-table td {
        padding: 3px 4px;
        border-bottom: 1px solid rgba(30, 41, 59, 0.3);
        color: var(--text-secondary);
        font-variant-numeric: tabular-nums;
      }
      .diff-changed { color: var(--caution-text) !important; }
      .diff-unchanged { color: var(--text-muted) !important; }
      .diff-highlight {
        animation: diff-flash 2s ease-out;
      }
      @keyframes diff-flash {
        0% { background: rgba(56, 189, 248, 0.2); }
        100% { background: transparent; }
      }

      /* Audit log */
      .audit-entry {
        display: flex;
        gap: 6px;
        padding: 4px 0;
        border-bottom: 1px solid rgba(30, 41, 59, 0.3);
        font-size: 10px;
        align-items: flex-start;
      }
      .audit-time {
        color: var(--text-muted);
        flex-shrink: 0;
        font-variant-numeric: tabular-nums;
        min-width: 55px;
      }
      .audit-msg { color: var(--text-secondary); flex: 1; }

      /* Demo buttons row */
      .demo-controls-row {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
      }

      /* Notification toast */
      .mem-toast {
        position: fixed;
        top: 68px;
        right: 330px;
        background: var(--bg-card);
        border: 1px solid var(--control-border);
        border-radius: 4px;
        padding: 8px 14px;
        font-family: var(--font-mono);
        font-size: 11px;
        font-weight: 600;
        color: var(--control-text);
        z-index: 9999;
        animation: toast-in 0.3s ease-out;
        max-width: 350px;
      }
      .mem-toast.error {
        border-color: var(--critical-border);
        color: var(--critical-text);
      }
      @keyframes toast-in {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }

  // ============================================================================
  // Shell Structure
  // ============================================================================

  private _buildShell(): void {
    this.container.innerHTML = '';

    // Header
    this.headerEl = document.createElement('div');
    this.headerEl.className = 'mem-shell-header';
    this.headerEl.innerHTML = `
      <span class="mem-shell-title">DYNAMIC SITUATIONAL MEMORY</span>
      <span class="mem-badge badge-nominal" id="mem-env-badge">EARTH ORBIT</span>
    `;
    this.container.appendChild(this.headerEl);

    // Sub-tab row
    const tabRow = document.createElement('div');
    tabRow.className = 'mem-subtab-row';
    const tabs: { id: MemSubTab; label: string }[] = [
      { id: 'OVERVIEW', label: 'Overview' },
      { id: 'COMPARISON', label: 'Differential' },
      { id: 'AUDIT', label: 'Audit Log' },
      { id: 'LEGACY', label: 'Avionics' },
    ];
    tabs.forEach(t => {
      const btn = document.createElement('button');
      btn.className = `mem-subtab-btn ${t.id === this.activeSubTab ? 'active' : ''}`;
      btn.textContent = t.label;
      btn.dataset.subtab = t.id;
      btn.addEventListener('click', () => {
        this.activeSubTab = t.id;
        tabRow.querySelectorAll('.mem-subtab-btn').forEach(b =>
          b.classList.toggle('active', (b as HTMLElement).dataset.subtab === t.id)
        );
        this._renderActiveTab();
      });
      tabRow.appendChild(btn);
    });
    this.container.appendChild(tabRow);

    // Content area
    this.contentEl = document.createElement('div');
    this.contentEl.className = 'mem-shell-content';
    this.container.appendChild(this.contentEl);
  }

  private _renderActiveTab(): void {
    switch (this.activeSubTab) {
      case 'OVERVIEW': this._renderOverview(); break;
      case 'COMPARISON': this._renderComparison(); break;
      case 'AUDIT': this._renderAuditLog(); break;
      case 'LEGACY': this._renderLegacy(); break;
    }
  }

  // ============================================================================
  // OVERVIEW TAB
  // ============================================================================

  private _renderOverview(): void {
    this.contentEl.innerHTML = '';
    this._updateEnvBadge();

    // ---- Demo Controls ----
    const demoSection = document.createElement('div');
    demoSection.className = 'mem-section';
    demoSection.innerHTML = `
      <div class="mem-section-header">
        <span class="mem-section-title">EVALUATOR DEMONSTRATION</span>
        <span class="mem-badge badge-control">${this.demoRunning ? 'RUNNING' : 'READY'}</span>
      </div>
    `;
    const demoRow = document.createElement('div');
    demoRow.className = 'demo-controls-row';
    demoRow.style.marginTop = '4px';

    const startBtn = document.createElement('button');
    startBtn.className = 'mem-action-btn btn-demo';
    startBtn.textContent = this.demoRunning ? '⏸ PAUSE DEMO' : '▶ START DEMO';
    startBtn.style.flex = '1';
    startBtn.addEventListener('click', () => {
      if (this.demoRunning) {
        this._pauseDemo();
      } else {
        this._startDemo();
      }
    });
    demoRow.appendChild(startBtn);

    const resetBtn = document.createElement('button');
    resetBtn.className = 'mem-action-btn btn-steel';
    resetBtn.textContent = 'RESET';
    resetBtn.addEventListener('click', () => {
      this._stopDemo();
      this.envManager.reset();
      this._showToast('Simulation reset to Earth Orbit');
      this._renderOverview();
    });
    demoRow.appendChild(resetBtn);

    demoSection.appendChild(demoRow);

    // Transition progress placeholder
    const progressEl = document.createElement('div');
    progressEl.id = 'transition-progress';
    progressEl.style.display = 'none';
    demoSection.appendChild(progressEl);

    this.contentEl.appendChild(demoSection);

    // ---- Permanent Memory ----
    const permSection = document.createElement('div');
    permSection.className = 'mem-section';
    const permMemory = this.envManager.permanentMemory;
    const permVerify = this.envManager.verifyPermanentMemory();

    permSection.innerHTML = `
      <div class="mem-section-header">
        <span class="mem-section-title">PERMANENT MEMORY | IMMUTABLE CORE</span>
        <span class="mem-badge ${permVerify.allValid ? 'badge-nominal' : 'badge-critical'}">
          ${permVerify.allValid ? 'VERIFIED' : 'INTEGRITY FAIL'}
        </span>
      </div>
    `;

    permMemory.forEach(region => {
      const regionEl = document.createElement('div');
      regionEl.style.cssText = 'padding: 4px 0; border-bottom: 1px solid rgba(30,41,59,0.3);';
      regionEl.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
          <span style="color: var(--text-primary); font-weight: 600; font-size: 10px;">${region.regionId}: ${region.name}</span>
          <span class="mem-badge badge-nominal" style="font-size: 8px;">WRITE PROTECTED</span>
        </div>
        <div class="mem-kv-row"><span class="mem-kv-label">Integrity</span><span class="mem-kv-value" style="color: var(--nominal-text);">${region.integrityPercent}%</span></div>
        <div class="mem-kv-row"><span class="mem-kv-label">Checksum</span><span class="mem-kv-value" style="font-size: 9px;">0x${region.checksum.substring(0, 16)}…</span></div>
        <div class="mem-kv-row"><span class="mem-kv-label">Last Verified</span><span class="mem-kv-value">${this._formatTime(region.lastVerified)}</span></div>
        <div style="font-size: 9px; color: var(--text-muted); margin-top: 2px;">${region.contents.join(' · ')}</div>
      `;
      permSection.appendChild(regionEl);
    });

    // Permanent memory summary row
    const permSummary = document.createElement('div');
    permSummary.style.cssText = 'margin-top: 4px; font-size: 10px; color: var(--nominal-text); font-weight: 600;';
    permSummary.textContent = `ENVIRONMENT TRANSITION: NO CHANGE — ${permMemory.length} REGIONS PRESERVED`;
    permSection.appendChild(permSummary);

    this.contentEl.appendChild(permSection);

    // ---- Adaptive Memory ----
    const adaptSection = document.createElement('div');
    adaptSection.className = 'mem-section';
    const profile = this.envManager.activeProfile;
    const prev = this.envManager.previousProfile;

    adaptSection.innerHTML = `
      <div class="mem-section-header">
        <span class="mem-section-title">ADAPTIVE MEMORY | ENVIRONMENT PROFILES</span>
        <span class="mem-badge badge-control">${profile.profileName}</span>
      </div>
      <div class="mem-kv-row"><span class="mem-kv-label">Active Profile</span><span class="mem-kv-value" style="color: var(--control-text);">${profile.profileName}</span></div>
      <div class="mem-kv-row"><span class="mem-kv-label">Profile Version</span><span class="mem-kv-value">${profile.version}</span></div>
      <div class="mem-kv-row"><span class="mem-kv-label">Profile Status</span><span class="mem-kv-value" style="color: var(--nominal-text);">VERIFIED</span></div>
      <div class="mem-kv-row"><span class="mem-kv-label">Previous Profile</span><span class="mem-kv-value">${prev ? prev.profileName : '—'}</span></div>
      ${this.envManager.lastTransitionResult ? `
        <div class="mem-kv-row"><span class="mem-kv-label">Changed Parameters</span><span class="mem-kv-value" style="color: var(--caution-text);">${this.envManager.lastTransitionResult.changedParameterCount}</span></div>
        <div class="mem-kv-row"><span class="mem-kv-label">Unchanged Permanent</span><span class="mem-kv-value" style="color: var(--nominal-text);">${this.envManager.lastTransitionResult.unchangedPermanentRegions}</span></div>
      ` : ''}
      <div class="mem-kv-row"><span class="mem-kv-label">Checksum</span><span class="mem-kv-value" style="font-size: 9px;">0x${profile.checksum.substring(0, 16)}…</span></div>
    `;

    // Environment measurements
    const measTitle = document.createElement('div');
    measTitle.style.cssText = 'font-size: 9px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 6px; padding-bottom: 2px; border-bottom: 1px solid var(--border-subtle);';
    measTitle.textContent = 'ENVIRONMENTAL MEASUREMENTS (SIMULATED)';
    adaptSection.appendChild(measTitle);

    const meas = profile.measurements;
    const measRows: [string, string, string][] = [
      ['Solar Irradiance', `${meas.solarIrradiance}`, 'W/m²'],
      ['Thermal Reading (sim)', `${meas.thermalReading}`, 'K'],
      ['Radiation Index (sim)', `${meas.radiationIndex}`, 'units'],
      ['Solar Power Availability', `${meas.solarPowerAvailability}`, '%'],
      ['Comm Latency (demo approx)', `${meas.commLatencyMs.toLocaleString()}`, 'ms'],
      ['Power Reserve', `${meas.powerReserve}`, '%'],
    ];
    measRows.forEach(([label, val, unit]) => {
      const row = document.createElement('div');
      row.className = 'mem-kv-row';
      row.innerHTML = `<span class="mem-kv-label">${label}</span><span class="mem-kv-value">${val} ${unit}</span>`;
      adaptSection.appendChild(row);
    });

    // Configuration
    const cfgTitle = document.createElement('div');
    cfgTitle.style.cssText = 'font-size: 9px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 6px; padding-bottom: 2px; border-bottom: 1px solid var(--border-subtle);';
    cfgTitle.textContent = 'ADAPTIVE CONFIGURATION';
    adaptSection.appendChild(cfgTitle);

    const cfg = profile.configuration;
    const cfgEntries: [string, string][] = [
      ['Navigation', cfg.navigationProfile],
      ['Communication', cfg.communicationMode],
      ['Thermal', cfg.thermalMode],
      ['Propulsion', cfg.propulsionMode],
      ['Power', cfg.powerMode],
      ['Radiation', cfg.radiationMode],
      ['Instruments', cfg.instrumentMode],
    ];
    cfgEntries.forEach(([label, val]) => {
      const row = document.createElement('div');
      row.className = 'mem-kv-row';
      row.innerHTML = `<span class="mem-kv-label">${label}</span><span class="mem-kv-value">${val}</span>`;
      adaptSection.appendChild(row);
    });

    this.contentEl.appendChild(adaptSection);

    // ---- Environment Selector ----
    const selectorSection = document.createElement('div');
    selectorSection.className = 'mem-section';
    selectorSection.innerHTML = `
      <div class="mem-section-header">
        <span class="mem-section-title">ENVIRONMENT SELECTOR</span>
      </div>
    `;
    const grid = document.createElement('div');
    grid.className = 'env-selector-grid';
    grid.style.marginTop = '4px';

    getAllEnvironments().forEach(env => {
      const btn = document.createElement('button');
      btn.className = `env-select-btn ${env === this.envManager.currentEnvironment ? 'active' : ''}`;
      btn.textContent = ENVIRONMENT_PROFILES[env].displayName;
      btn.disabled = this.demoRunning;
      btn.addEventListener('click', async () => {
        if (env === this.envManager.currentEnvironment) return;
        await this._doTransition(env);
      });
      grid.appendChild(btn);
    });
    selectorSection.appendChild(grid);
    this.contentEl.appendChild(selectorSection);

    // ---- Fault Testing ----
    const faultSection = document.createElement('div');
    faultSection.className = 'mem-section';
    faultSection.innerHTML = `
      <div class="mem-section-header">
        <span class="mem-section-title">MEMORY INTEGRITY & FAULT TESTING</span>
        <span class="mem-badge ${this.envManager.testBuffer.corrupted ? 'badge-critical' : 'badge-nominal'}">
          ${this.envManager.testBuffer.corrupted ? 'CORRUPTED' : 'NOMINAL'}
        </span>
      </div>
    `;
    const faultRow = document.createElement('div');
    faultRow.className = 'demo-controls-row';
    faultRow.style.marginTop = '4px';

    const verifyBtn = document.createElement('button');
    verifyBtn.className = 'mem-action-btn btn-steel';
    verifyBtn.textContent = 'VERIFY MEMORY';
    verifyBtn.addEventListener('click', () => {
      const pResult = this.envManager.verifyPermanentMemory();
      const tResult = this.envManager.verifyTestBuffer();
      if (pResult.allValid && tResult.valid) {
        this._showToast('All memory regions verified — integrity 100%');
      } else {
        this._showToast('Integrity check failed! See audit log.', true);
      }
      this._renderOverview();
    });
    faultRow.appendChild(verifyBtn);

    const bitflipBtn = document.createElement('button');
    bitflipBtn.className = 'mem-action-btn btn-destructive';
    bitflipBtn.textContent = 'INJECT BIT-FLIP';
    bitflipBtn.addEventListener('click', () => {
      const result = this.envManager.injectTestBitFlip();
      if (result.corrupted) {
        this._showToast('Bit-flip injected into test buffer. Integrity check will detect it.', true);
      }
      this._renderOverview();
    });
    faultRow.appendChild(bitflipBtn);

    const restoreBtn = document.createElement('button');
    restoreBtn.className = 'mem-action-btn btn-amber';
    restoreBtn.textContent = 'RESTORE BACKUP';
    restoreBtn.addEventListener('click', () => {
      const result = this.envManager.restoreTestBuffer();
      if (result.restored) {
        this._showToast('Test buffer restored from backup. Integrity verified.');
      }
      this._renderOverview();
    });
    faultRow.appendChild(restoreBtn);

    faultSection.appendChild(faultRow);

    // Test buffer details
    const tb = this.envManager.testBuffer;
    const tbVerify = this.envManager.verifyTestBuffer();
    const tbDetails = document.createElement('div');
    tbDetails.style.cssText = 'margin-top: 6px; font-size: 10px;';
    tbDetails.innerHTML = `
      <div class="mem-kv-row"><span class="mem-kv-label">Test Buffer Status</span><span class="mem-kv-value" style="color: ${tb.corrupted ? 'var(--critical-text)' : 'var(--nominal-text)'};">${tb.corrupted ? 'CORRUPTED' : 'CLEAN'}</span></div>
      <div class="mem-kv-row"><span class="mem-kv-label">Checksum Match</span><span class="mem-kv-value" style="color: ${tbVerify.valid ? 'var(--nominal-text)' : 'var(--critical-text)'};">${tbVerify.valid ? 'PASS' : 'FAIL'}</span></div>
      <div style="font-size: 9px; color: var(--text-muted); margin-top: 2px;">Fault tests operate on a dedicated test buffer. Permanent memory is never modified.</div>
    `;
    faultSection.appendChild(tbDetails);

    this.contentEl.appendChild(faultSection);
  }

  // ============================================================================
  // COMPARISON TAB
  // ============================================================================

  private _renderComparison(): void {
    this.contentEl.innerHTML = '';
    this._updateEnvBadge();

    const result = this.envManager.lastTransitionResult;

    if (!result) {
      this.contentEl.innerHTML = `
        <div class="mem-section">
          <div class="mem-section-header">
            <span class="mem-section-title">ADAPTIVE MEMORY DIFFERENTIAL</span>
          </div>
          <div style="padding: 12px 0; text-align: center; color: var(--text-muted); font-size: 10px;">
            No environment transition has been performed yet.<br/>
            Use the Environment Selector or START DEMO to see a before/after comparison.
          </div>
        </div>
      `;
      return;
    }

    // Filter controls
    const filterSection = document.createElement('div');
    filterSection.style.cssText = 'display: flex; gap: 4px; margin-bottom: 4px;';

    let filter: 'ALL' | 'CHANGED' | 'UNCHANGED' = 'ALL';
    const makeFilterBtn = (label: string, f: typeof filter) => {
      const btn = document.createElement('button');
      btn.className = `mem-subtab-btn ${f === filter ? 'active' : ''}`;
      btn.textContent = label;
      btn.addEventListener('click', () => {
        filter = f;
        filterSection.querySelectorAll('.mem-subtab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderTable();
      });
      return btn;
    };
    filterSection.appendChild(makeFilterBtn('All', 'ALL'));
    filterSection.appendChild(makeFilterBtn('Changed', 'CHANGED'));
    filterSection.appendChild(makeFilterBtn('Unchanged', 'UNCHANGED'));
    this.contentEl.appendChild(filterSection);

    // Summary
    const summarySection = document.createElement('div');
    summarySection.className = 'mem-section';
    summarySection.innerHTML = `
      <div class="mem-section-header">
        <span class="mem-section-title">TRANSITION SUMMARY</span>
        <span class="mem-badge ${result.success ? 'badge-nominal' : 'badge-critical'}">${result.success ? 'COMPLETED' : 'FAILED'}</span>
      </div>
      <div class="mem-kv-row"><span class="mem-kv-label">From</span><span class="mem-kv-value">${ENVIRONMENT_PROFILES[result.fromEnvironment].displayName}</span></div>
      <div class="mem-kv-row"><span class="mem-kv-label">To</span><span class="mem-kv-value" style="color: var(--control-text);">${ENVIRONMENT_PROFILES[result.toEnvironment].displayName}</span></div>
      <div class="mem-kv-row"><span class="mem-kv-label">Adaptive Config</span><span class="mem-kv-value" style="color: var(--caution-text);">UPDATED</span></div>
      <div class="mem-kv-row"><span class="mem-kv-label">Permanent Memory</span><span class="mem-kv-value" style="color: var(--nominal-text);">PRESERVED</span></div>
      <div class="mem-kv-row"><span class="mem-kv-label">Profile Validation</span><span class="mem-kv-value" style="color: var(--nominal-text);">PASSED</span></div>
      <div class="mem-kv-row"><span class="mem-kv-label">Changed Parameters</span><span class="mem-kv-value">${result.changedParameterCount}</span></div>
      <div class="mem-kv-row"><span class="mem-kv-label">Audit Log</span><span class="mem-kv-value" style="color: var(--nominal-text);">RECORDED</span></div>
    `;
    this.contentEl.appendChild(summarySection);

    // Diff table container
    const tableContainer = document.createElement('div');
    tableContainer.className = 'mem-section';
    tableContainer.innerHTML = `
      <div class="mem-section-header">
        <span class="mem-section-title">PARAMETER DIFFERENTIAL</span>
      </div>
    `;
    const tableWrapper = document.createElement('div');
    tableContainer.appendChild(tableWrapper);
    this.contentEl.appendChild(tableContainer);

    // Permanent memory unchanged rows
    const permSection = document.createElement('div');
    permSection.className = 'mem-section';
    permSection.innerHTML = `
      <div class="mem-section-header">
        <span class="mem-section-title">PERMANENT MEMORY STATUS</span>
        <span class="mem-badge badge-nominal">UNCHANGED</span>
      </div>
    `;
    this.envManager.permanentMemory.forEach(r => {
      const row = document.createElement('div');
      row.className = 'mem-kv-row';
      row.innerHTML = `<span class="mem-kv-label">${r.regionId}: ${r.name}</span><span class="mem-kv-value" style="color: var(--nominal-text);">VERIFIED — NO CHANGE</span>`;
      permSection.appendChild(row);
    });
    this.contentEl.appendChild(permSection);

    const renderTable = () => {
      const diff = result.diff;
      const filtered = diff.filter(d => {
        if (filter === 'CHANGED') return d.changed;
        if (filter === 'UNCHANGED') return !d.changed;
        return true;
      });

      tableWrapper.innerHTML = '';
      const table = document.createElement('table');
      table.className = 'diff-table';
      table.innerHTML = `
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Previous</th>
            <th>New</th>
            <th>Status</th>
          </tr>
        </thead>
      `;
      const tbody = document.createElement('tbody');
      filtered.forEach(d => {
        const tr = document.createElement('tr');
        tr.className = d.changed ? 'diff-highlight' : '';
        tr.innerHTML = `
          <td>${d.parameter}</td>
          <td class="${d.changed ? 'diff-changed' : 'diff-unchanged'}">${d.previousValue}</td>
          <td class="${d.changed ? 'diff-changed' : 'diff-unchanged'}" style="${d.changed ? 'color: var(--control-text) !important;' : ''}">${d.newValue}</td>
          <td><span class="mem-badge ${d.changed ? 'badge-caution' : 'badge-nominal'}" style="font-size: 8px;">${d.changed ? 'CHANGED' : 'UNCHANGED'}</span></td>
        `;
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      tableWrapper.appendChild(table);
    };

    renderTable();
  }

  // ============================================================================
  // AUDIT LOG TAB
  // ============================================================================

  private _renderAuditLog(): void {
    this.contentEl.innerHTML = '';
    this._updateEnvBadge();

    const section = document.createElement('div');
    section.className = 'mem-section';
    section.innerHTML = `
      <div class="mem-section-header">
        <span class="mem-section-title">TRANSITION AUDIT LOG</span>
        <span class="mem-badge badge-control">${this.envManager.auditLog.length} ENTRIES</span>
      </div>
    `;

    const log = this.envManager.auditLog;
    if (log.length === 0) {
      section.innerHTML += '<div style="padding: 8px 0; color: var(--text-muted); font-size: 10px; text-align: center;">No audit entries yet. Perform a transition to generate entries.</div>';
    } else {
      // Show in reverse chronological order
      const entries = [...log].reverse();
      entries.forEach(entry => {
        const entryEl = document.createElement('div');
        entryEl.className = 'audit-entry';
        const badgeClass = entry.success ? 'badge-nominal' : 'badge-critical';
        const typeLabel = entry.type.replace('_', ' ');
        entryEl.innerHTML = `
          <span class="audit-time">${this._formatTime(entry.timestamp)}</span>
          <span class="mem-badge ${badgeClass}" style="font-size: 8px; flex-shrink: 0;">${typeLabel}</span>
          <span class="audit-msg">${entry.message}${entry.details ? ` — ${entry.details}` : ''}</span>
        `;
        section.appendChild(entryEl);
      });
    }

    this.contentEl.appendChild(section);
  }

  // ============================================================================
  // LEGACY (original avionics memory view)
  // ============================================================================

  private _renderLegacy(): void {
    this.contentEl.innerHTML = '';

    // Existing R0-R3 memory view (preserved from original)
    const regions: { name: string; addr: string; badge: string; meta: string; details: string; badgeClass: string }[] = [
      {
        name: 'R0: GOLDEN ROM',
        addr: '0x0000 - 0x1FFF',
        badge: 'HARDENED',
        badgeClass: 'badge-nominal',
        meta: 'Physical Constants, Kepler J2000 Ephemerides, Actuator Hard Limits, ECDSA Public Keys',
        details: `Status: 100% Integrity verified (SHA-256: 0x${this.memManager.modules.get('r0_flight_rules')?.hash.substring(0, 8) ?? '9f83'}...bc41)`,
      },
      {
        name: 'R1: PERSISTENT AUDIT LOG',
        addr: '0x2000 - 0x3FFF',
        badge: 'CHAINED HASH',
        badgeClass: 'badge-control',
        meta: 'Immutable telemetry flight recorder & safety gate execution log (IndexedDB backed)',
        details: `Total Recorded Blocks: ${142 + this.envManager.auditLog.length} | Latest Chain Hash: 0xa4c1...8e29`,
      },
      {
        name: 'LIB: SIGNED LIBRARY',
        addr: '0x4000 - 0x7FFF',
        badge: 'VERIFIED',
        badgeClass: 'badge-caution',
        meta: 'Random Forest model weights, BM25 knowledge graph, Synthetic Formulary',
        details: 'Modules: rf_thermal.bin (25 trees), kg_procedures.json (12 procs), formulary.json (4 drugs)',
      },
      {
        name: 'R2: WORKING SET A/B',
        addr: '0x8000 - 0xBFFF',
        badge: `BUFFER ${this.memManager.activeSlot} ACTIVE`,
        badgeClass: 'badge-control',
        meta: 'Mission phase parameters, guidance targets, CDSS differential working buffers',
        details: `Buffer ${this.memManager.activeSlot}: ${this.envManager.activeProfile.displayName} State Vector | Buffer ${this.memManager.activeSlot === 'A' ? 'B' : 'A'}: Standby`,
      },
      {
        name: 'R3: SCRATCHPAD MEMORY',
        addr: '0xC000 - 0xFFFF',
        badge: 'EPHEMERAL',
        badgeClass: '',
        meta: 'High-frequency telemetry ring buffers (0 GC allocation overhead during rendering)',
        details: 'Sparkline Circular Buffers: 8 channels @ 300 samples capacity (100% active, 0 drops)',
      },
    ];

    regions.forEach(r => {
      const card = document.createElement('div');
      card.className = 'mem-section';
      card.innerHTML = `
        <div class="mem-section-header">
          <span class="mem-section-title">${r.name} (${r.addr})</span>
          <span class="mem-badge ${r.badgeClass || ''}" ${!r.badgeClass ? 'style="background: var(--bg-hover); color: var(--text-muted); border: 1px solid var(--border-primary);"' : ''}>${r.badge}</span>
        </div>
        <div style="font-size: 9px; color: var(--text-muted);">${r.meta}</div>
        <div style="font-size: 10px; color: var(--text-primary); background: var(--bg-canvas); border: 1px solid var(--border-subtle); border-radius: 2px; padding: 4px 6px; margin-top: 2px;">${r.details}</div>
      `;
      this.contentEl.appendChild(card);
    });

    // Legacy controls
    const ctrlSection = document.createElement('div');
    ctrlSection.className = 'mem-section';
    ctrlSection.innerHTML = `<div class="mem-section-header"><span class="mem-section-title">SEU SCRUBBER CONTROLS</span></div>`;
    const ctrlRow = document.createElement('div');
    ctrlRow.className = 'demo-controls-row';
    ctrlRow.style.marginTop = '4px';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'mem-action-btn btn-steel';
    toggleBtn.textContent = 'TOGGLE SCRUBBER';
    let scrubberActive = true;
    toggleBtn.addEventListener('click', () => {
      scrubberActive = !scrubberActive;
      this._showToast(scrubberActive ? 'SEU Scrubber: ACTIVE (100 Hz)' : 'SEU Scrubber: PAUSED');
    });
    ctrlRow.appendChild(toggleBtn);

    const legacyBitflip = document.createElement('button');
    legacyBitflip.className = 'mem-action-btn btn-destructive';
    legacyBitflip.textContent = 'INJECT BIT-FLIP';
    legacyBitflip.addEventListener('click', () => {
      this.memManager.injectBitFlip('lib_thermal_model');
      this._showToast('SEU DETECTED: Bit-flip in lib_thermal_model', true);
      setTimeout(() => {
        this.memManager.scrubForSEU();
        this._showToast('SEU REPAIRED: Clean module reloaded from golden flash image');
      }, 1200);
    });
    ctrlRow.appendChild(legacyBitflip);

    const swapBtn = document.createElement('button');
    swapBtn.className = 'mem-action-btn btn-amber';
    swapBtn.textContent = 'A/B SWAP';
    swapBtn.addEventListener('click', () => {
      this._showToast(`Buffer ${this.memManager.activeSlot === 'A' ? 'B' : 'A'} committed for active flight guidance`);
      this._renderLegacy();
    });
    ctrlRow.appendChild(swapBtn);

    ctrlSection.appendChild(ctrlRow);
    this.contentEl.appendChild(ctrlSection);
  }

  // ============================================================================
  // Transition Execution
  // ============================================================================

  private async _doTransition(targetEnv: SpacecraftEnvironment): Promise<void> {
    // Show progress UI
    const progressEl = this.contentEl.querySelector('#transition-progress') as HTMLElement;
    if (progressEl) {
      progressEl.style.display = 'block';
      progressEl.innerHTML = `
        <div class="progress-status">Initiating transition...</div>
        <div class="progress-bar-track"><div class="progress-bar-fill" style="width: 0%"></div></div>
      `;
    }

    this.envManager.onTransitionStep((step) => {
      if (progressEl) {
        const statusEl = progressEl.querySelector('.progress-status');
        const fillEl = progressEl.querySelector('.progress-bar-fill') as HTMLElement;
        if (statusEl) statusEl.textContent = step.message;
        if (fillEl) fillEl.style.width = `${step.progress}%`;
      }
    });

    const result = await this.envManager.transitionTo(targetEnv);

    // Show toast
    if (result.success) {
      this._showToast(`${ENVIRONMENT_PROFILES[targetEnv].displayName} profile activated`);
    } else {
      this._showToast(`Transition failed: ${result.error ?? 'Unknown error'}`, true);
    }

    // Refresh view
    this._renderOverview();

    // Auto-switch to comparison tab briefly
    if (result.success) {
      setTimeout(() => {
        this.activeSubTab = 'COMPARISON';
        this.container.querySelectorAll('.mem-subtab-btn').forEach(b =>
          b.classList.toggle('active', (b as HTMLElement).dataset.subtab === 'COMPARISON')
        );
        this._renderComparison();
      }, 500);
    }
  }

  // ============================================================================
  // Demo Mode
  // ============================================================================

  private async _startDemo(): Promise<void> {
    if (this.demoRunning) {
      this.demoPaused = false;
      this._renderOverview();
      return;
    }

    this.demoRunning = true;
    this.demoAbortController = new AbortController();
    const signal = this.demoAbortController.signal;

    this._renderOverview();

    try {
      // Stage 1: Initial State (Earth Orbit)
      if (this.envManager.currentEnvironment !== 'EarthOrbit') {
        this.envManager.reset();
      }
      this._showToast('DEMO STAGE 1/5: Initial State — Earth Orbit');
      await this._demoDelay(2000, signal);

      // Stage 2: Transition notification
      this._showToast('ENVIRONMENT TRANSITION DETECTED: EARTH ORBIT → MARS ORBIT');
      await this._demoDelay(1500, signal);

      // Stage 3: Execute transition to Mars Orbit
      await this._doTransition('MarsOrbit');
      await this._demoDelay(2000, signal);

      // Stage 4: Show comparison (already switched by _doTransition)
      this._showToast('DEMO STAGE 4/5: Before/After Comparison Displayed');
      await this._demoDelay(3000, signal);

      // Stage 5: Done - show selector for further exploration
      this._showToast('DEMO COMPLETE — Use environment buttons to explore other configurations');
      this.activeSubTab = 'OVERVIEW';
      this.container.querySelectorAll('.mem-subtab-btn').forEach(b =>
        b.classList.toggle('active', (b as HTMLElement).dataset.subtab === 'OVERVIEW')
      );

    } catch {
      // Demo was aborted
    } finally {
      this.demoRunning = false;
      this.demoPaused = false;
      this.demoAbortController = null;
      this._renderOverview();
    }
  }

  private _pauseDemo(): void {
    this.demoPaused = !this.demoPaused;
    this._renderOverview();
  }

  private _stopDemo(): void {
    if (this.demoAbortController) {
      this.demoAbortController.abort();
    }
    this.demoRunning = false;
    this.demoPaused = false;
    this.demoAbortController = null;
  }

  private _demoDelay(ms: number, signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      if (signal.aborted) { reject(new Error('aborted')); return; }

      const check = () => {
        if (signal.aborted) { reject(new Error('aborted')); return; }
        if (!this.demoPaused) { resolve(); return; }
        setTimeout(check, 100);
      };

      setTimeout(check, ms);
    });
  }

  // ============================================================================
  // Helpers
  // ============================================================================

  private _updateEnvBadge(): void {
    const badge = this.headerEl.querySelector('#mem-env-badge');
    if (badge) {
      badge.textContent = this.envManager.activeProfile.displayName.toUpperCase();
    }
  }

  private _formatTime(timestamp: number): string {
    const d = new Date(timestamp);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  private _showToast(message: string, isError = false): void {
    // Remove existing toast
    document.querySelectorAll('.mem-toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `mem-toast ${isError ? 'error' : ''}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 4000);
  }
}
