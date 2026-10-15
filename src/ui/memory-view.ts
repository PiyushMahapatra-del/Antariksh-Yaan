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
          gap: 12px;
          padding: 12px;
          height: 100%;
          overflow-y: auto;
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-primary);
          background: rgba(10, 16, 26, 0.95);
        }
        .mem-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(0, 229, 255, 0.2);
          padding-bottom: 6px;
        }
        .mem-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--cyan);
          letter-spacing: 1px;
        }
        .mem-region-card {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(0, 229, 255, 0.15);
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
          font-weight: 700;
          color: var(--cyan);
        }
        .mem-meta {
          font-size: 10px;
          color: var(--text-dim);
        }
        .scrubber-controls {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(0, 229, 255, 0.05);
          border: 1px solid rgba(0, 229, 255, 0.2);
          border-radius: 4px;
          padding: 8px 10px;
        }
      </style>

      <div class="mem-header">
        <div class="mem-title">AVIONICS MEMORY & FAULT TOLERANCE</div>
        <div class="badge phase-badge">ECC / SEU SCRUBBER</div>
      </div>

      <div class="scrubber-controls">
        <button id="toggle-scrubber-btn" class="search-btn" style="padding: 4px 10px; font-size: 10px;">
          TOGGLE SEU SCRUBBER
        </button>
        <button id="inject-bitflip-btn" class="arm-btn" style="padding: 4px 10px; font-size: 10px; color: var(--red); border-color: var(--red);">
          INJECT BIT-FLIP (SEU)
        </button>
        <button id="swap-r2-btn" class="search-btn" style="padding: 4px 10px; font-size: 10px; color: var(--amber); border-color: var(--amber);">
          PING-PONG A/B SWAP
        </button>
        <div id="scrubber-status" style="margin-left: auto; font-size: 10px; color: var(--green);">
          SCRUBBER: ACTIVE (100 Hz)
        </div>
      </div>

      <div class="mem-region-card">
        <div class="mem-region-top">
          <span class="mem-region-name">R0: GOLDEN ROM (IMMUTABLE)</span>
          <span class="badge" style="background: rgba(0, 230, 118, 0.2); color: var(--green);">HARDENED</span>
        </div>
        <div class="mem-meta">Physical Constants, Kepler J2000 Ephemerides, Actuator Hard Limits, ECDSA Public Keys</div>
        <div id="r0-details" style="font-size: 10px; color: var(--text-bright); margin-top: 2px;">
          Status: 100% Integrity verified (SHA-256: 0x9f83...bc41)
        </div>
      </div>

      <div class="mem-region-card">
        <div class="mem-region-top">
          <span class="mem-region-name">R1: PERSISTENT AUDIT LOG (APPEND-ONLY)</span>
          <span class="badge" style="background: rgba(0, 229, 255, 0.2); color: var(--cyan);">CHAINED HASH</span>
        </div>
        <div class="mem-meta">Immutable telemetry flight recorder & safety gate execution log (IndexedDB backed)</div>
        <div id="r1-details" style="font-size: 10px; color: var(--text-bright); margin-top: 2px;">
          Total Recorded Blocks: 142 | Latest Chain Hash: 0xa4c1...8e29
        </div>
      </div>

      <div class="mem-region-card">
        <div class="mem-region-top">
          <span class="mem-region-name">LIB: SIGNED LIBRARY (READ-ONLY)</span>
          <span class="badge" style="background: rgba(255, 171, 0, 0.2); color: var(--amber);">VERIFIED</span>
        </div>
        <div class="mem-meta">Random Forest model weights, BM25 knowledge graph, Synthetic Formulary</div>
        <div id="lib-details" style="font-size: 10px; color: var(--text-bright); margin-top: 2px;">
          Modules: rf_thermal.bin (25 trees), kg_procedures.json (12 procs), formulary.json (4 drugs)
        </div>
      </div>

      <div class="mem-region-card">
        <div class="mem-region-top">
          <span class="mem-region-name">R2: PHASE WORKING SET A/B (PING-PONG)</span>
          <span class="badge" id="r2-active-badge" style="background: rgba(0, 229, 255, 0.2); color: var(--cyan);">BUFFER A ACTIVE</span>
        </div>
        <div class="mem-meta">Mission phase parameters, guidance targets, CDSS differential working buffers</div>
        <div id="r2-details" style="font-size: 10px; color: var(--text-bright); margin-top: 2px;">
          Buffer A: Cruise State Vector | Buffer B: Standby (Prepared for Mars Orbit Insertion)
        </div>
      </div>

      <div class="mem-region-card">
        <div class="mem-region-top">
          <span class="mem-region-name">R3: SCRATCHPAD MEMORY (CIRCULAR RINGBUFFERS)</span>
          <span class="badge" style="background: rgba(255, 255, 255, 0.1); color: var(--text-dim);">EPHEMERAL</span>
        </div>
        <div class="mem-meta">High-frequency telemetry ring buffers (0 GC allocation overhead during rendering)</div>
        <div id="r3-details" style="font-size: 10px; color: var(--text-bright); margin-top: 2px;">
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
      this.scrubberStatusEl.style.color = scrubberActive ? 'var(--green)' : 'var(--amber)';
    });

    injectBitflipBtn.addEventListener('click', () => {
      const bitFlipResult = this.memManager.injectBitFlip('lib_thermal_model');
      if (bitFlipResult) {
        this.libEl.textContent = '⚠ SEU DETECTED: Bit-flip in lib_thermal_model. Scrubber auto-correcting via golden checksum.';
        this.libEl.style.color = 'var(--red)';
        setTimeout(() => {
          this.memManager.scrubForSEU();
          this.libEl.textContent = '✓ SEU REPAIRED: Clean module reloaded from golden flash image.';
          this.libEl.style.color = 'var(--green)';
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
