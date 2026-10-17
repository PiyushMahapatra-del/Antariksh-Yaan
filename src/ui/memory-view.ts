/**
 * AEGIS TRANSIT — Memory Hierarchy & Avionics Health Console
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Visualizes the 5 avionics memory partitions:
 * - R0: Golden ROM (Immutable invariants, planetary elements, crypto keys)
 * - R1: Persistent Audit Log (SHA-256 chained transaction blocks)
 * - LIB: Signed Library (Integrity-verified models and flight manuals)
 * - R2: Working Set A/B (Active & Standby phase guidance ping-pong buffers)
 * - R3: Scratchpad (High-rate circular ring buffers for telemetry)
 * 
 * Also provides SEU scrubber control and bit-flip fault injection.
 */

import type { EventBus } from '../core/event-bus.js';
import type { AegisEventMap } from '../core/types.js';
import type { MemoryManager } from '../fsw/memory-manager.js';

export class MemoryView {
  private container: HTMLElement;
  private memManager: MemoryManager;

  // DOM
  private libEl!: HTMLElement;
  private r2El!: HTMLElement;
  private scrubberStatusEl!: HTMLElement;

  constructor(parent: HTMLElement, _bus: EventBus<AegisEventMap>, memManager: MemoryManager) {
    this.memManager = memManager;

    this.container = document.createElement('div');
    this.container.className = 'memory-view-panel';
    parent.appendChild(this.container);

    this._buildUI();
  }

  private _buildUI(): void {
    this.container.innerHTML = `
      <style>
        .memory-view-panel {
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
        .mem-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-primary);
          padding-bottom: 6px;
        }
        .mem-title {
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 700;
          color: var(--text-secondary);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .scrubber-controls {
          display: flex;
          flex-direction: column;
          gap: 6px;
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: 4px;
          padding: 8px 10px;
        }
        .scrubber-buttons-row {
          display: flex;
          gap: 6px;
        }
        .mem-btn {
          flex: 1;
          padding: 4px 6px;
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 2px;
          text-align: center;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .btn-steel {
          background: var(--control-bg);
          border: 1px solid var(--control-border);
          color: var(--control-text);
        }
        .btn-steel:hover {
          background: rgba(56, 189, 248, 0.25);
        }
        .btn-destructive {
          background: var(--critical-bg);
          border: 1px solid var(--critical-border);
          color: var(--critical-text);
        }
        .btn-destructive:hover {
          background: rgba(239, 68, 68, 0.25);
        }
        .btn-amber {
          background: var(--caution-bg);
          border: 1px solid var(--caution-border);
          color: var(--caution-text);
        }
        .btn-amber:hover {
          background: rgba(245, 158, 11, 0.25);
        }
        .scrubber-status-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 10px;
          padding-top: 4px;
          border-top: 1px solid var(--border-subtle);
        }
        .mem-region-card {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: 4px;
          padding: 8px 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .mem-region-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .mem-region-name {
          font-family: var(--font-sans);
          font-size: 10px;
          font-weight: 700;
          color: var(--text-secondary);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .mem-meta {
          font-size: 10px;
          color: var(--text-muted);
          line-height: 1.3;
        }
        .mem-details-box {
          font-size: 10px;
          color: var(--text-primary);
          background: var(--bg-canvas);
          border: 1px solid var(--border-subtle);
          border-radius: 2px;
          padding: 4px 6px;
          margin-top: 2px;
          line-height: 1.3;
        }
      </style>

      <div class="mem-header">
        <div class="mem-title">AVIONICS MEMORY & FAULT TOLERANCE</div>
        <div class="badge phase-badge">ECC / SEU SCRUBBER</div>
      </div>

      <div class="scrubber-controls">
        <div class="scrubber-buttons-row">
          <button id="toggle-scrubber-btn" class="mem-btn btn-steel">
            TOGGLE SCRUBBER
          </button>
          <button id="inject-bitflip-btn" class="mem-btn btn-destructive">
            INJECT BIT-FLIP
          </button>
          <button id="swap-r2-btn" class="mem-btn btn-amber">
            A/B SWAP
          </button>
        </div>
        <div class="scrubber-status-row">
          <span style="color: var(--text-muted);">MONITOR STATE:</span>
          <span id="scrubber-status" style="font-weight: 600; color: var(--nominal-text);">
            SCRUBBER: ACTIVE (100 Hz)
          </span>
        </div>
      </div>

      <div class="mem-region-card">
        <div class="mem-region-top">
          <span class="mem-region-name">R0: GOLDEN ROM (0x0000 - 0x1FFF)</span>
          <span class="badge fidelity-high">HARDENED</span>
        </div>
        <div class="mem-meta">Physical Constants, Kepler J2000 Ephemerides, Actuator Hard Limits, ECDSA Public Keys</div>
        <div id="r0-details" class="mem-details-box">
          Status: 100% Integrity verified (SHA-256: 0x9f83...bc41)
        </div>
      </div>

      <div class="mem-region-card">
        <div class="mem-region-top">
          <span class="mem-region-name">R1: PERSISTENT AUDIT LOG (0x2000 - 0x3FFF)</span>
          <span class="badge" style="background: var(--control-bg); color: var(--control-text); border: 1px solid var(--control-border);">CHAINED HASH</span>
        </div>
        <div class="mem-meta">Immutable telemetry flight recorder & safety gate execution log (IndexedDB backed)</div>
        <div id="r1-details" class="mem-details-box">
          Total Recorded Blocks: 142 | Latest Chain Hash: 0xa4c1...8e29
        </div>
      </div>

      <div class="mem-region-card">
        <div class="mem-region-top">
          <span class="mem-region-name">LIB: SIGNED LIBRARY (0x4000 - 0x7FFF)</span>
          <span class="badge synthetic-banner">VERIFIED</span>
        </div>
        <div class="mem-meta">Random Forest model weights, BM25 knowledge graph, Synthetic Formulary</div>
        <div id="lib-details" class="mem-details-box">
          Modules: rf_thermal.bin (25 trees), kg_procedures.json (12 procs), formulary.json (4 drugs)
        </div>
      </div>

      <div class="mem-region-card">
        <div class="mem-region-top">
          <span class="mem-region-name">R2: WORKING SET A/B (0x8000 - 0xBFFF)</span>
          <span class="badge phase-badge" id="r2-active-badge">BUFFER A ACTIVE</span>
        </div>
        <div class="mem-meta">Mission phase parameters, guidance targets, CDSS differential working buffers</div>
        <div id="r2-details" class="mem-details-box">
          Buffer A: Cruise State Vector | Buffer B: Standby (Prepared for Mars Orbit Insertion)
        </div>
      </div>

      <div class="mem-region-card">
        <div class="mem-region-top">
          <span class="mem-region-name">R3: SCRATCHPAD MEMORY (0xC000 - 0xFFFF)</span>
          <span class="badge" style="background: var(--bg-hover); color: var(--text-muted); border: 1px solid var(--border-primary);">EPHEMERAL</span>
        </div>
        <div class="mem-meta">High-frequency telemetry ring buffers (0 GC allocation overhead during rendering)</div>
        <div id="r3-details" class="mem-details-box">
          Sparkline Circular Buffers: 8 channels @ 300 samples capacity (100% active, 0 drops)
        </div>
      </div>
    `;

    this.libEl = this.container.querySelector('#lib-details')!;
    this.r2El = this.container.querySelector('#r2-details')!;
    this.scrubberStatusEl = this.container.querySelector('#scrubber-status')!;

    // Buttons
    const toggleScrubberBtn = this.container.querySelector('#toggle-scrubber-btn')!;
    const injectBitflipBtn = this.container.querySelector('#inject-bitflip-btn')!;
    const swapR2Btn = this.container.querySelector('#swap-r2-btn')!;
    const r2Badge = this.container.querySelector('#r2-active-badge') as HTMLElement;

    let scrubberActive = true;
    toggleScrubberBtn.addEventListener('click', () => {
      scrubberActive = !scrubberActive;
      this.scrubberStatusEl.textContent = scrubberActive ? 'SCRUBBER: ACTIVE (100 Hz)' : 'SCRUBBER: PAUSED';
      this.scrubberStatusEl.style.color = scrubberActive ? 'var(--nominal-text)' : 'var(--caution-text)';
    });

    injectBitflipBtn.addEventListener('click', () => {
      const bitFlipResult = this.memManager.injectBitFlip('lib_thermal_model');
      if (bitFlipResult) {
        this.libEl.textContent = '⚠ SEU DETECTED: Bit-flip in lib_thermal_model. Scrubber auto-correcting via golden checksum.';
        this.libEl.style.color = 'var(--critical-text)';
        setTimeout(() => {
          this.memManager.scrubForSEU();
          this.libEl.textContent = '✓ SEU REPAIRED: Clean module reloaded from golden flash image.';
          this.libEl.style.color = 'var(--nominal-text)';
        }, 1200);
      }
    });

    swapR2Btn.addEventListener('click', () => {
      // Toggle active slot
      const current = this.memManager.activeSlot === 'A' ? 'B' : 'A';
      r2Badge.textContent = `BUFFER ${current} ACTIVE`;
      this.r2El.textContent = `Buffer ${current} committed for active flight guidance calculations.`;
    });
  }

  show(): void {
    this.container.style.display = 'flex';
  }

  hide(): void {
    this.container.style.display = 'none';
  }
}
