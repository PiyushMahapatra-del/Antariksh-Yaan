/**
 * AEGIS TRANSIT — Comms Console UI Component
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Deep-Space Comms & Delay-Tolerant Networking (DTN) interface:
 * - Real-time link telemetry (OWLT, RTLT, theta, downlink/uplink rates)
 * - Solar conjunction blackout warnings (theta < 2.0 deg)
 * - Scenario Latency Override checkbox with amber badge (SIM-05)
 * - 4-Priority Spool visualizer with 20-segment discrete LED-style arrays
 * - In-flight bundle pulse & propagation tracker
 * - Ground segment telemetry age ("DATA IS xx.x MIN OLD") & uplink queue
 */

import type { EventBus } from '../core/event-bus.js';
import type { AegisEventMap } from '../core/types.js';
import type { DeepSpaceLinkModel, LinkStateSnapshot } from '../dtn/link-model.js';
import type { PrioritySpool } from '../dtn/spool.js';
import type { GroundSegment } from '../dtn/ground-segment.js';
import { formatDuration } from '../main.js';
import { formatLinkRate } from '../sim/link-budget.js';

export class CommsConsole {
  private container: HTMLElement;
  private linkModel: DeepSpaceLinkModel;
  private spool: PrioritySpool;
  private groundSegment: GroundSegment;

  // DOM elements
  private statusBadge!: HTMLElement;
  private owltEl!: HTMLElement;
  private rtltEl!: HTMLElement;
  private thetaEl!: HTMLElement;
  private ratesEl!: HTMLElement;
  private groundAgeEl!: HTMLElement;
  private spoolBarsEl!: HTMLElement;
  private inFlightListEl!: HTMLElement;
  private overrideCheckbox!: HTMLInputElement;
  private overrideBadge!: HTMLElement;
  private overrideMinutesInput!: HTMLInputElement;

  constructor(
    parent: HTMLElement,
    _bus: EventBus<AegisEventMap>,
    linkModel: DeepSpaceLinkModel,
    spool: PrioritySpool,
    groundSegment: GroundSegment
  ) {
    this.linkModel = linkModel;
    this.spool = spool;
    this.groundSegment = groundSegment;

    this.container = document.createElement('div');
    this.container.className = 'comms-console-panel';
    parent.appendChild(this.container);

    this._buildUI();
  }

  private _buildUI(): void {
    this.container.innerHTML = `
      <style>
        .comms-console-panel {
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
        .comms-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-primary);
          padding-bottom: 6px;
        }
        .comms-title {
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 700;
          color: var(--text-secondary);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .ground-banner {
          background: var(--nominal-bg);
          border: 1px solid var(--nominal-border);
          border-radius: 4px;
          padding: 6px 10px;
          color: var(--nominal-text);
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-align: center;
        }
        .override-card {
          display: flex;
          flex-direction: column;
          gap: 6px;
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: 4px;
          padding: 8px 10px;
        }
        .override-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .override-title-group {
          display: flex;
          flex-direction: column;
        }
        .override-title {
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .override-sub {
          font-size: 10px;
          color: var(--text-muted);
        }
        .override-controls {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 2px;
        }
        .override-input {
          width: 52px;
          background: var(--bg-canvas);
          color: var(--text-primary);
          border: 1px solid var(--border-primary);
          border-radius: 2px;
          padding: 2px 6px;
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 600;
        }
        .override-input:focus {
          border-color: var(--control-text);
          outline: none;
        }
        .link-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        .link-card {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: 4px;
          padding: 8px 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .link-card-label {
          font-family: var(--font-sans);
          font-size: 9px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .link-card-val {
          font-family: var(--font-mono);
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          font-variant-numeric: tabular-nums;
        }
        .spool-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: 4px;
          padding: 8px 10px;
        }
        .spool-section-title {
          font-family: var(--font-sans);
          font-size: 10px;
          font-weight: 700;
          color: var(--text-secondary);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 4px;
        }
        .spool-bar-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 10px;
          gap: 6px;
        }
        .spool-label {
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 600;
          color: var(--text-secondary);
          white-space: nowrap;
        }
        .led-bar-array {
          display: flex;
          gap: 2px;
          align-items: center;
        }
        .led-segment {
          width: 5px;
          height: 10px;
          border-radius: 1px;
          flex-shrink: 0;
        }
        .led-off {
          background: var(--border-primary);
        }
        .led-p0 {
          background: var(--critical-text);
        }
        .led-p1 {
          background: var(--caution-text);
        }
        .led-p2 {
          background: var(--control-text);
        }
        .led-p3 {
          background: #64748B;
        }
        .inflight-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-height: 120px;
          overflow-y: auto;
          background: var(--bg-canvas);
          border: 1px solid var(--border-primary);
          border-radius: 2px;
          padding: 4px;
        }
        .inflight-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 3px 6px;
          border-radius: 2px;
          background: var(--bg-card);
          font-size: 10px;
          border: 1px solid var(--border-subtle);
        }
      </style>

      <div class="comms-header">
        <div class="comms-title">DEEP-SPACE COMMUNICATIONS / DTN</div>
        <div id="comms-status-badge" class="badge fidelity-high">NOMINAL</div>
      </div>

      <div class="ground-banner" id="ground-age-banner">
        DATA IS -- MIN OLD (AWAITING DOWNLINK)
      </div>

      <div class="override-card">
        <div class="override-top">
          <div class="override-title-group">
            <span class="override-title">SCENARIO OVERRIDE</span>
            <span class="override-sub">FORCE ARTIFICIAL LATENCY</span>
          </div>
          <span id="override-badge" class="badge synthetic-banner" style="display: none;">OVERRIDE ACTIVE</span>
        </div>
        <div class="override-controls">
          <input type="checkbox" id="override-toggle" style="cursor: pointer; accent-color: var(--control-text);" />
          <label for="override-toggle" style="cursor: pointer; font-size: 11px; font-weight: 500; color: var(--text-secondary);">
            Enable Forced Delay:
          </label>
          <input type="number" id="override-mins" class="override-input" value="15" min="3" max="22" />
          <span style="color: var(--text-muted); font-size: 10px;">min</span>
        </div>
      </div>

      <div class="link-grid">
        <div class="link-card">
          <div class="link-card-label">ONE-WAY LIGHT TIME (OWLT)</div>
          <div class="link-card-val" id="comms-owlt">--m --s</div>
        </div>
        <div class="link-card">
          <div class="link-card-label">ROUND-TRIP LIGHT TIME (RTLT)</div>
          <div class="link-card-val" id="comms-rtlt">--m --s</div>
        </div>
        <div class="link-card">
          <div class="link-card-label">SUN-EARTH-SHIP ANGLE (θ)</div>
          <div class="link-card-val" id="comms-theta">--°</div>
        </div>
        <div class="link-card">
          <div class="link-card-label">DOWNLINK / UPLINK RATES</div>
          <div class="link-card-val" id="comms-rates">-- / -- kbps</div>
        </div>
      </div>

      <div class="spool-section">
        <div class="spool-section-title">
          TRANSMISSION PRIORITY SPOOL (PERSISTENT IDB)
        </div>
        <div id="spool-bars" style="display: flex; flex-direction: column; gap: 6px;">
          <!-- Filled dynamically with 20-segment discrete LED bars -->
        </div>
      </div>

      <div class="spool-section">
        <div class="spool-section-title">
          IN-FLIGHT PROPAGATION PIPELINE
        </div>
        <div class="inflight-list" id="inflight-list">
          <div style="color: var(--text-muted); text-align: center; padding: 4px;">No bundles currently in flight</div>
        </div>
      </div>
    `;

    this.statusBadge = this.container.querySelector('#comms-status-badge')!;
    this.owltEl = this.container.querySelector('#comms-owlt')!;
    this.rtltEl = this.container.querySelector('#comms-rtlt')!;
    this.thetaEl = this.container.querySelector('#comms-theta')!;
    this.ratesEl = this.container.querySelector('#comms-rates')!;
    this.groundAgeEl = this.container.querySelector('#ground-age-banner')!;
    this.spoolBarsEl = this.container.querySelector('#spool-bars')!;
    this.inFlightListEl = this.container.querySelector('#inflight-list')!;
    this.overrideCheckbox = this.container.querySelector('#override-toggle') as HTMLInputElement;
    this.overrideBadge = this.container.querySelector('#override-badge')!;
    this.overrideMinutesInput = this.container.querySelector('#override-mins') as HTMLInputElement;

    // Attach override event listeners
    this.overrideCheckbox.addEventListener('change', () => {
      const active = this.overrideCheckbox.checked;
      const mins = parseFloat(this.overrideMinutesInput.value) || 15;
      this.linkModel.setLatencyOverride(active, mins);
      this.overrideBadge.style.display = active ? 'inline-flex' : 'none';
    });

    this.overrideMinutesInput.addEventListener('input', () => {
      if (this.overrideCheckbox.checked) {
        const mins = parseFloat(this.overrideMinutesInput.value) || 15;
        this.linkModel.setLatencyOverride(true, mins);
      }
    });
  }

  private _renderLedSegments(count: number, maxCount: number, ledClass: string): string {
    const totalSegments = 20;
    const activeSegments = Math.min(totalSegments, Math.round((count / maxCount) * totalSegments));
    let html = `<div class="led-bar-array">`;
    for (let i = 0; i < totalSegments; i++) {
      html += `<div class="led-segment ${i < activeSegments ? ledClass : 'led-off'}"></div>`;
    }
    html += `</div>`;
    return html;
  }

  /**
   * Updates display values from simulation tick.
   */
  update(linkState: LinkStateSnapshot, currentSimTime: number): void {
    // 1. Status badge
    this.statusBadge.textContent = linkState.status;
    if (linkState.status === 'BLACKOUT') {
      this.statusBadge.className = 'badge';
      this.statusBadge.style.background = 'var(--critical-bg)';
      this.statusBadge.style.borderColor = 'var(--critical-border)';
      this.statusBadge.style.color = 'var(--critical-text)';
    } else if (linkState.status === 'DEGRADED') {
      this.statusBadge.className = 'badge synthetic-banner';
      this.statusBadge.style.background = 'var(--caution-bg)';
      this.statusBadge.style.borderColor = 'var(--caution-border)';
      this.statusBadge.style.color = 'var(--caution-text)';
    } else if (linkState.status === 'OVERRIDE') {
      this.statusBadge.className = 'badge synthetic-banner';
      this.statusBadge.style.background = 'var(--caution-bg)';
      this.statusBadge.style.borderColor = 'var(--caution-border)';
      this.statusBadge.style.color = 'var(--caution-text)';
    } else {
      this.statusBadge.className = 'badge fidelity-high';
      this.statusBadge.style.background = 'var(--nominal-bg)';
      this.statusBadge.style.borderColor = 'var(--nominal-border)';
      this.statusBadge.style.color = 'var(--nominal-text)';
    }

    // 2. Metrics
    this.owltEl.textContent = formatDuration(linkState.oneWayLightTimeSec);
    this.rtltEl.textContent = formatDuration(linkState.roundTripLightTimeSec);
    this.thetaEl.textContent = `${linkState.thetaDeg.toFixed(2)}° ${linkState.thetaDeg < 2.0 ? '⚠ BLACKOUT' : ''}`;
    this.ratesEl.textContent = `${formatLinkRate(linkState.downlinkRateKbps * 1000)} / ${formatLinkRate(linkState.uplinkRateKbps * 1000)}`;

    // 3. Ground telemetry age
    this.groundAgeEl.textContent = this.groundSegment.getTelemetryAgeString(currentSimTime);

    // 4. 20-segment discrete LED spool bars
    const stats = this.spool.getStats();
    const maxB = 50; // Visual scale factor
    this.spoolBarsEl.innerHTML = `
      <div class="spool-bar-row">
        <span class="spool-label">P0: CRITICAL (FDIR) [${stats.p0Count}]</span>
        ${this._renderLedSegments(stats.p0Count, maxB, 'led-p0')}
      </div>
      <div class="spool-bar-row">
        <span class="spool-label">P1: TELEMETRY (HEALTH) [${stats.p1Count}]</span>
        ${this._renderLedSegments(stats.p1Count, maxB, 'led-p1')}
      </div>
      <div class="spool-bar-row">
        <span class="spool-label">P2: SCIENCE (ROUTINE) [${stats.p2Count}]</span>
        ${this._renderLedSegments(stats.p2Count, maxB, 'led-p2')}
      </div>
      <div class="spool-bar-row">
        <span class="spool-label">P3: BULK (FILES) [${stats.p3Count}]</span>
        ${this._renderLedSegments(stats.p3Count, maxB, 'led-p3')}
      </div>
      <div style="font-size: 9px; color: var(--text-muted); margin-top: 4px; display: flex; justify-content: space-between; font-family: var(--font-mono);">
        <span>TOTAL: ${stats.totalBundles} (${(stats.totalBytes / 1024).toFixed(1)} KB)</span>
        <span>DROPPED: ${stats.droppedCount}</span>
      </div>
    `;

    // 5. In-flight bundles
    const inFlight = this.linkModel.getInFlightBundles();
    if (inFlight.length === 0) {
      this.inFlightListEl.innerHTML = `<div style="color: var(--text-muted); text-align: center; padding: 4px;">No bundles currently in flight</div>`;
    } else {
      this.inFlightListEl.innerHTML = inFlight.slice(0, 5).map(item => {
        const remaining = Math.max(0, item.arrivalSimTime - currentSimTime);
        const progress = Math.min(100, Math.max(0, ((currentSimTime - item.departureSimTime) / item.oneWayDelaySec) * 100));
        return `
          <div class="inflight-item">
            <span style="font-weight: 500;">[P${item.bundle.header.priority}] ${item.bundle.header.payloadType} (${item.direction === 'downlink' ? '▼ TO EARTH' : '▲ TO SHIP'})</span>
            <span style="font-family: var(--font-mono); font-weight: 600; color: var(--text-secondary);">${remaining.toFixed(0)}s left (${progress.toFixed(0)}%)</span>
          </div>
        `;
      }).join('');
    }
  }

  show(): void {
    this.container.style.display = 'flex';
  }

  hide(): void {
    this.container.style.display = 'none';
  }
}
