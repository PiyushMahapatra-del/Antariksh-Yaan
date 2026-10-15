/**
 * AEGIS TRANSIT — Comms Console UI Component
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Deep-Space Comms & Delay-Tolerant Networking (DTN) interface:
 * - Real-time link telemetry (OWLT, RTLT, theta, downlink/uplink rates)
 * - Solar conjunction blackout warnings (theta < 2.0 deg)
 * - Scenario Latency Override checkbox with prominent amber badge (SIM-05)
 * - 4-Priority Spool visualizer (P0, P1, P2, P3 counts & capacity bars)
 * - In-flight bundle pulse & propagation tracker
 * - Ground segment telemetry age ("DATA IS xx.x MIN OLD") & uplink queue
 */

import type { EventBus } from '../core/event-bus.js';
import type { AegisEventMap } from '../core/types.js';
import type { DeepSpaceLinkModel, LinkStateSnapshot } from '../dtn/link-model.js';
import type { PrioritySpool } from '../dtn/spool.js';
import type { GroundSegment } from '../dtn/ground-segment.js';
import { formatDuration } from '../main.js';

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
          gap: 12px;
          padding: 12px;
          height: 100%;
          overflow-y: auto;
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-primary);
          background: rgba(10, 16, 26, 0.95);
        }
        .comms-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(0, 229, 255, 0.2);
          padding-bottom: 6px;
        }
        .comms-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--cyan);
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .link-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        .link-card {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(0, 229, 255, 0.15);
          border-radius: 4px;
          padding: 8px;
        }
        .link-card-label {
          font-size: 9px;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .link-card-val {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-bright);
        }
        .override-box {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 171, 0, 0.08);
          border: 1px dashed rgba(255, 171, 0, 0.3);
          border-radius: 4px;
          padding: 8px 10px;
        }
        .amber-badge {
          display: inline-block;
          background: #ffab00;
          color: #000;
          font-weight: 800;
          font-size: 9px;
          padding: 2px 6px;
          border-radius: 2px;
          letter-spacing: 1px;
        }
        .ground-banner {
          background: rgba(0, 230, 118, 0.08);
          border: 1px solid rgba(0, 230, 118, 0.3);
          border-radius: 4px;
          padding: 8px 10px;
          color: var(--green);
          font-weight: 700;
          text-align: center;
          letter-spacing: 0.5px;
        }
        .spool-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .spool-bar-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 10px;
        }
        .spool-progress {
          width: 140px;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }
        .spool-progress-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease;
        }
        .fill-p0 { background: var(--red); }
        .fill-p1 { background: var(--amber); }
        .fill-p2 { background: var(--cyan); }
        .fill-p3 { background: var(--text-dim); }
        .inflight-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-height: 100px;
          overflow-y: auto;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(0, 229, 255, 0.1);
          border-radius: 4px;
          padding: 6px;
        }
        .inflight-item {
          display: flex;
          justify-content: space-between;
          padding: 3px 6px;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.03);
          font-size: 10px;
        }
      </style>

      <div class="comms-header">
        <div class="comms-title">DEEP-SPACE COMMUNICATIONS / DTN</div>
        <div id="comms-status-badge" class="badge">ACTIVE</div>
      </div>

      <div class="ground-banner" id="ground-age-banner">
        DATA IS -- MIN OLD (AWAITING DOWNLINK)
      </div>

      <div class="override-box">
        <input type="checkbox" id="override-toggle" />
        <label for="override-toggle" style="cursor: pointer; font-weight: 600;">
          SCENARIO OVERRIDE: FORCE DELAY
        </label>
        <input type="number" id="override-mins" value="15" min="3" max="22" style="width: 45px; background: #000; color: #fff; border: 1px solid #ffab00; border-radius: 2px; padding: 2px 4px;" />
        <span style="color: var(--text-dim);">min</span>
        <span id="override-badge" class="amber-badge" style="display: none;">OVERRIDE ACTIVE</span>
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
        <div style="font-weight: 700; color: var(--cyan); margin-bottom: 2px;">
          TRANSMISSION PRIORITY SPOOL (PERSISTENT IDB)
        </div>
        <div id="spool-bars">
          <!-- Filled dynamically -->
        </div>
      </div>

      <div class="spool-section">
        <div style="font-weight: 700; color: var(--cyan); margin-bottom: 2px;">
          IN-FLIGHT PROPAGATION PIPELINE
        </div>
        <div class="inflight-list" id="inflight-list">
          <div style="color: var(--text-dim); text-align: center; padding: 4px;">No bundles currently in flight</div>
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
      this.overrideBadge.style.display = active ? 'inline-block' : 'none';
    });

    this.overrideMinutesInput.addEventListener('input', () => {
      if (this.overrideCheckbox.checked) {
        const mins = parseFloat(this.overrideMinutesInput.value) || 15;
        this.linkModel.setLatencyOverride(true, mins);
      }
    });
  }

  /**
   * Updates display values from simulation tick.
   */
  update(linkState: LinkStateSnapshot, currentSimTime: number): void {
    // 1. Status badge
    this.statusBadge.textContent = linkState.status;
    if (linkState.status === 'BLACKOUT') {
      this.statusBadge.style.background = 'var(--red)';
      this.statusBadge.style.color = '#fff';
    } else if (linkState.status === 'DEGRADED') {
      this.statusBadge.style.background = 'var(--amber)';
      this.statusBadge.style.color = '#000';
    } else if (linkState.status === 'OVERRIDE') {
      this.statusBadge.style.background = '#ffab00';
      this.statusBadge.style.color = '#000';
    } else {
      this.statusBadge.style.background = 'rgba(0, 230, 118, 0.2)';
      this.statusBadge.style.color = 'var(--green)';
    }

    // 2. Metrics
    this.owltEl.textContent = formatDuration(linkState.oneWayLightTimeSec);
    this.rtltEl.textContent = formatDuration(linkState.roundTripLightTimeSec);
    this.thetaEl.textContent = `${linkState.thetaDeg.toFixed(2)}° ${linkState.thetaDeg < 2.0 ? '⚠ BLACKOUT' : ''}`;
    this.ratesEl.textContent = `${linkState.downlinkRateKbps.toFixed(1)} / ${linkState.uplinkRateKbps.toFixed(1)} kbps`;

    // 3. Ground telemetry age
    this.groundAgeEl.textContent = this.groundSegment.getTelemetryAgeString(currentSimTime);

    // 4. Spool bars
    const stats = this.spool.getStats();
    const maxB = 50; // Visual scale factor
    this.spoolBarsEl.innerHTML = `
      <div class="spool-bar-row">
        <span>P0: CRITICAL (FDIR) [${stats.p0Count}]</span>
        <div class="spool-progress"><div class="spool-progress-fill fill-p0" style="width: ${Math.min(100, (stats.p0Count / maxB) * 100)}%;"></div></div>
      </div>
      <div class="spool-bar-row">
        <span>P1: TELEMETRY (HEALTH) [${stats.p1Count}]</span>
        <div class="spool-progress"><div class="spool-progress-fill fill-p1" style="width: ${Math.min(100, (stats.p1Count / maxB) * 100)}%;"></div></div>
      </div>
      <div class="spool-bar-row">
        <span>P2: SCIENCE (ROUTINE) [${stats.p2Count}]</span>
        <div class="spool-progress"><div class="spool-progress-fill fill-p2" style="width: ${Math.min(100, (stats.p2Count / maxB) * 100)}%;"></div></div>
      </div>
      <div class="spool-bar-row">
        <span>P3: BULK (FILES) [${stats.p3Count}]</span>
        <div class="spool-progress"><div class="spool-progress-fill fill-p3" style="width: ${Math.min(100, (stats.p3Count / maxB) * 100)}%;"></div></div>
      </div>
      <div style="font-size: 9px; color: var(--text-dim); margin-top: 4px; display: flex; justify-content: space-between;">
        <span>TOTAL: ${stats.totalBundles} (${(stats.totalBytes / 1024).toFixed(1)} KB)</span>
        <span>DROPPED: ${stats.droppedCount}</span>
      </div>
    `;

    // 5. In-flight bundles
    const inFlight = this.linkModel.getInFlightBundles();
    if (inFlight.length === 0) {
      this.inFlightListEl.innerHTML = `<div style="color: var(--text-dim); text-align: center; padding: 4px;">No bundles currently in flight</div>`;
    } else {
      this.inFlightListEl.innerHTML = inFlight.slice(0, 5).map(item => {
        const remaining = Math.max(0, item.arrivalSimTime - currentSimTime);
        const progress = Math.min(100, Math.max(0, ((currentSimTime - item.departureSimTime) / item.oneWayDelaySec) * 100));
        return `
          <div class="inflight-item">
            <span>[P${item.bundle.header.priority}] ${item.bundle.header.payloadType} (${item.direction === 'downlink' ? '▼ TO EARTH' : '▲ TO SHIP'})</span>
            <span>${remaining.toFixed(0)}s left (${progress.toFixed(0)}%)</span>
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
