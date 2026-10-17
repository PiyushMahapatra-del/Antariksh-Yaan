/**
 * AEGIS TRANSIT — Fault Injection Console UI
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Interactive anomaly injection interface for testing subsystem resilience,
 * flight software safety gates, and AI diagnostic proposals.
 * 
 * Refactored to High-Density 2-Column Industrial Data Table (NASA Open MCT / SpaceX style).
 */

import { FaultInjector, FAULT_CATALOG, type FaultType } from '../sim/faults.js';
import type { EventBus } from '../core/event-bus.js';
import type { AegisEventMap } from '../core/types.js';

export class FaultPanel {
  private container: HTMLElement;
  private injector: FaultInjector;
  private bus?: EventBus<AegisEventMap>;
  private buttonElements: Map<FaultType, { card: HTMLElement; statusBadge: HTMLElement; toggleBtn: HTMLButtonElement }> = new Map();
  private countBadge: HTMLElement | null = null;

  constructor(container: HTMLElement, injector: FaultInjector, bus?: EventBus<AegisEventMap>) {
    this.container = container;
    this.injector = injector;
    this.bus = bus;

    this.initDOM();
    this.bindEvents();
  }

  private initDOM(): void {
    this.container.innerHTML = `
      <div class="fault-panel-wrapper">
        <div class="fault-header">
          <div class="fault-title-group">
            <span class="fault-title">FAULT INJECTION MATRIX</span>
            <span class="synthetic-banner">SYSTEM STRESS TESTING</span>
            <span id="fault-active-count" class="badge fidelity-high">0 FAULTS ACTIVE</span>
          </div>
          <div class="fault-controls">
            <button id="fault-clear-all-btn" class="fault-action-btn clear-all-btn" title="Clear all active simulated faults">
              [ CLEAR ALL FAULTS ]
            </button>
          </div>
        </div>
        <div class="fault-split-container">
          <div class="fault-col" id="fault-col-0">
            <div class="fault-table-head">
              <span class="th-item">ITEM</span>
              <span class="th-sub">CATEGORY</span>
              <span class="th-status">STATUS</span>
              <span class="th-action">ACTION</span>
            </div>
            <div class="fault-rows-group" id="fault-rows-0"></div>
          </div>
          <div class="fault-col" id="fault-col-1">
            <div class="fault-table-head">
              <span class="th-item">ITEM</span>
              <span class="th-sub">CATEGORY</span>
              <span class="th-status">STATUS</span>
              <span class="th-action">ACTION</span>
            </div>
            <div class="fault-rows-group" id="fault-rows-1"></div>
          </div>
        </div>
      </div>
    `;

    this.countBadge = this.container.querySelector('#fault-active-count');
    const rows0 = this.container.querySelector('#fault-rows-0') as HTMLElement;
    const rows1 = this.container.querySelector('#fault-rows-1') as HTMLElement;

    const mid = Math.ceil(FAULT_CATALOG.length / 2);

    FAULT_CATALOG.forEach((item, index) => {
      const targetGroup = index < mid ? rows0 : rows1;

      const row = document.createElement('div');
      row.className = 'fault-row';
      row.dataset.faultType = item.type;

      // Item Name
      const nameSpan = document.createElement('span');
      nameSpan.className = 'fault-name';
      nameSpan.textContent = item.name;
      nameSpan.title = item.description;

      // Subsystem Category
      const subBadge = document.createElement('span');
      subBadge.className = 'fault-subsystem-badge';
      subBadge.textContent = item.subsystem.toUpperCase();

      // Status Badge
      const statusBadge = document.createElement('span');
      statusBadge.className = 'fault-status-badge status-inactive';
      statusBadge.textContent = 'INACTIVE';

      // Action Button
      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'fault-toggle-btn btn-inject';
      toggleBtn.textContent = '[ INJECT ]';

      toggleBtn.addEventListener('click', () => {
        if (this.injector.isActive(item.type)) {
          this.injector.clear(item.type);
        } else {
          this.injector.inject(item.type, item.defaultParams);
        }
        this.updateCardState(item.type);
        this.updateHeaderCount();
      });

      row.appendChild(nameSpan);
      row.appendChild(subBadge);
      row.appendChild(statusBadge);
      row.appendChild(toggleBtn);

      targetGroup.appendChild(row);

      this.buttonElements.set(item.type, { card: row, statusBadge, toggleBtn });
    });

    const clearAllBtn = this.container.querySelector('#fault-clear-all-btn');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        this.injector.clearAll();
        for (const item of FAULT_CATALOG) {
          this.updateCardState(item.type);
        }
        this.updateHeaderCount();
      });
    }

    this.injectStyles();
  }

  private bindEvents(): void {
    if (this.bus) {
      this.bus.on('fault:injected', ({ faultId }) => {
        this.updateCardState(faultId as FaultType);
        this.updateHeaderCount();
      });

      this.bus.on('fault:cleared', ({ faultId }) => {
        this.updateCardState(faultId as FaultType);
        this.updateHeaderCount();
      });
    }
  }

  private updateCardState(type: FaultType): void {
    const els = this.buttonElements.get(type);
    if (!els) return;

    const isActive = this.injector.isActive(type);
    if (isActive) {
      els.card.classList.add('fault-row-active');
      els.statusBadge.className = 'fault-status-badge status-active';
      els.statusBadge.textContent = 'ACTIVE';
      els.toggleBtn.className = 'fault-toggle-btn btn-clear';
      els.toggleBtn.textContent = '[ CLEAR ]';
    } else {
      els.card.classList.remove('fault-row-active');
      els.statusBadge.className = 'fault-status-badge status-inactive';
      els.statusBadge.textContent = 'INACTIVE';
      els.toggleBtn.className = 'fault-toggle-btn btn-inject';
      els.toggleBtn.textContent = '[ INJECT ]';
    }
  }

  private updateHeaderCount(): void {
    if (!this.countBadge) return;
    const count = this.injector.getActive().length;
    if (count > 0) {
      this.countBadge.textContent = `${count} FAULT${count > 1 ? 'S' : ''} ACTIVE`;
      this.countBadge.className = 'badge';
      this.countBadge.style.background = 'var(--critical-bg)';
      this.countBadge.style.borderColor = 'var(--critical-border)';
      this.countBadge.style.color = 'var(--critical-text)';
    } else {
      this.countBadge.textContent = '0 FAULTS ACTIVE';
      this.countBadge.className = 'badge fidelity-high';
      this.countBadge.style.background = 'var(--nominal-bg)';
      this.countBadge.style.borderColor = 'var(--nominal-border)';
      this.countBadge.style.color = 'var(--nominal-text)';
    }
  }

  private injectStyles(): void {
    if (document.getElementById('fault-panel-styles')) return;

    const style = document.createElement('style');
    style.id = 'fault-panel-styles';
    style.textContent = `
      .fault-panel-wrapper {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
        background: var(--bg-panel);
      }
      .fault-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 12px;
        background: var(--bg-panel);
        border-bottom: 1px solid var(--border-primary);
        min-height: 30px;
        flex-shrink: 0;
      }
      .fault-title-group {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .fault-title {
        font-family: var(--font-sans);
        font-size: 11px;
        font-weight: 700;
        color: var(--text-secondary);
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .fault-split-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        flex: 1;
        overflow: hidden;
      }
      .fault-col {
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .fault-col:first-child {
        border-right: 1px solid var(--border-primary);
      }
      .fault-table-head {
        display: grid;
        grid-template-columns: 1fr 85px 70px 75px;
        align-items: center;
        padding: 4px 10px;
        background: var(--bg-card);
        border-bottom: 1px solid var(--border-primary);
        font-family: var(--font-sans);
        font-size: 9px;
        font-weight: 700;
        color: var(--text-muted);
        letter-spacing: 0.06em;
        text-transform: uppercase;
        flex-shrink: 0;
      }
      .fault-rows-group {
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow-y: auto;
      }
      .fault-row {
        display: grid;
        grid-template-columns: 1fr 85px 70px 75px;
        align-items: center;
        height: 28px;
        min-height: 28px;
        padding: 0 10px;
        border-bottom: 1px solid var(--border-subtle);
        transition: background 0.12s ease;
      }
      .fault-row:hover {
        background: var(--bg-hover);
      }
      .fault-row-active {
        background: var(--critical-bg) !important;
        border-left: 2px solid var(--critical-text);
      }
      .fault-name {
        font-family: var(--font-mono);
        font-size: 11px;
        font-weight: 500;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding-right: 8px;
      }
      .fault-subsystem-badge {
        font-family: var(--font-mono);
        font-size: 9px;
        font-weight: 600;
        color: var(--text-muted);
        background: var(--bg-card);
        border: 1px solid var(--border-primary);
        padding: 1px 4px;
        border-radius: 2px;
        display: inline-block;
        width: fit-content;
        letter-spacing: 0.04em;
      }
      .fault-status-badge {
        font-family: var(--font-mono);
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.04em;
      }
      .status-inactive {
        color: var(--text-muted);
      }
      .status-active {
        color: var(--critical-text);
        font-weight: 700;
      }
      .fault-toggle-btn {
        font-family: var(--font-mono);
        font-size: 10px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 2px;
        cursor: pointer;
        outline: none;
        letter-spacing: 0.04em;
        text-align: center;
        border: 1px solid transparent;
        background: transparent;
        transition: all 0.12s ease;
      }
      .btn-inject {
        color: var(--control-text);
      }
      .btn-inject:hover {
        background: var(--control-bg);
        border-color: var(--control-border);
      }
      .btn-clear {
        color: var(--critical-text);
        background: var(--critical-bg);
        border-color: var(--critical-border);
      }
      .btn-clear:hover {
        background: rgba(239, 68, 68, 0.25);
      }
      .clear-all-btn {
        background: transparent;
        border: 1px solid var(--border-primary);
        color: var(--text-secondary);
        font-family: var(--font-mono);
        font-size: 10px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 2px;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .clear-all-btn:hover {
        background: var(--bg-card);
        color: var(--text-primary);
        border-color: var(--text-muted);
      }
    `;
    document.head.appendChild(style);
  }
}
