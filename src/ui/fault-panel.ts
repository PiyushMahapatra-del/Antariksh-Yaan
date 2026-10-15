/**
 * AEGIS TRANSIT — Fault Injection Console UI
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Interactive anomaly injection interface for testing subsystem resilience,
 * flight software safety gates, and AI diagnostic proposals.
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
              CLEAR ALL FAULTS
            </button>
          </div>
        </div>
        <div class="fault-grid"></div>
      </div>
    `;

    this.countBadge = this.container.querySelector('#fault-active-count');
    const grid = this.container.querySelector('.fault-grid') as HTMLElement;

    for (const item of FAULT_CATALOG) {
      const card = document.createElement('div');
      card.className = 'fault-card';
      card.dataset.faultType = item.type;

      const topRow = document.createElement('div');
      topRow.className = 'fault-card-top';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'fault-name';
      nameSpan.textContent = item.name;
      nameSpan.title = item.description;

      const subBadge = document.createElement('span');
      subBadge.className = 'fault-subsystem-badge';
      subBadge.textContent = item.subsystem.toUpperCase();

      topRow.appendChild(nameSpan);
      topRow.appendChild(subBadge);

      const bottomRow = document.createElement('div');
      bottomRow.className = 'fault-card-bottom';

      const statusBadge = document.createElement('span');
      statusBadge.className = 'fault-status-badge status-inactive';
      statusBadge.textContent = 'INACTIVE';

      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'fault-toggle-btn btn-inject';
      toggleBtn.textContent = 'INJECT';

      toggleBtn.addEventListener('click', () => {
        if (this.injector.isActive(item.type)) {
          this.injector.clear(item.type);
        } else {
          this.injector.inject(item.type, item.defaultParams);
        }
        this.updateCardState(item.type);
        this.updateHeaderCount();
      });

      bottomRow.appendChild(statusBadge);
      bottomRow.appendChild(toggleBtn);

      card.appendChild(topRow);
      card.appendChild(bottomRow);
      grid.appendChild(card);

      this.buttonElements.set(item.type, { card, statusBadge, toggleBtn });
    }

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
      els.card.classList.add('fault-card-active');
      els.statusBadge.className = 'fault-status-badge status-active';
      els.statusBadge.textContent = 'ACTIVE';
      els.toggleBtn.className = 'fault-toggle-btn btn-clear';
      els.toggleBtn.textContent = 'CLEAR';
    } else {
      els.card.classList.remove('fault-card-active');
      els.statusBadge.className = 'fault-status-badge status-inactive';
      els.statusBadge.textContent = 'INACTIVE';
      els.toggleBtn.className = 'fault-toggle-btn btn-inject';
      els.toggleBtn.textContent = 'INJECT';
    }
  }

  private updateHeaderCount(): void {
    if (!this.countBadge) return;
    const count = this.injector.getActive().length;
    if (count > 0) {
      this.countBadge.textContent = `${count} FAULT${count > 1 ? 'S' : ''} ACTIVE`;
      this.countBadge.className = 'badge';
      this.countBadge.style.background = 'var(--red)';
      this.countBadge.style.color = '#fff';
    } else {
      this.countBadge.textContent = '0 FAULTS ACTIVE';
      this.countBadge.className = 'badge fidelity-high';
      this.countBadge.style.background = 'var(--green)';
      this.countBadge.style.color = '#000';
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
      }
      .fault-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 10px;
        background: var(--bg-panel);
        border-bottom: var(--border);
        min-height: 28px;
      }
      .fault-title-group {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .fault-title {
        font-family: var(--font-mono);
        font-size: 11px;
        font-weight: 700;
        color: var(--cyan);
        letter-spacing: 1px;
      }
      .fault-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
        gap: 6px;
        padding: 6px 10px;
        overflow-y: auto;
        flex: 1;
      }
      .fault-card {
        background: rgba(14, 20, 28, 0.7);
        border: 1px solid rgba(0, 229, 255, 0.2);
        border-radius: 3px;
        padding: 5px 8px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 4px;
        transition: border-color 0.2s, background-color 0.2s;
      }
      .fault-card:hover {
        border-color: rgba(0, 229, 255, 0.5);
      }
      .fault-card-active {
        background: rgba(255, 23, 68, 0.12) !important;
        border-color: var(--red) !important;
        box-shadow: 0 0 6px rgba(255, 23, 68, 0.4);
      }
      .fault-card-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 4px;
      }
      .fault-name {
        font-family: var(--font-mono);
        font-size: 10px;
        font-weight: 600;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .fault-subsystem-badge {
        font-family: var(--font-mono);
        font-size: 8px;
        color: var(--cyan);
        background: rgba(0, 229, 255, 0.1);
        border: 1px solid rgba(0, 229, 255, 0.3);
        padding: 0 3px;
        border-radius: 2px;
        white-space: nowrap;
      }
      .fault-card-bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .fault-status-badge {
        font-family: var(--font-mono);
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.5px;
      }
      .status-inactive {
        color: var(--text-secondary);
      }
      .status-active {
        color: var(--red);
        animation: fault-blink 1s infinite alternate;
      }
      @keyframes fault-blink {
        from { opacity: 0.6; }
        to { opacity: 1; }
      }
      .fault-toggle-btn {
        font-family: var(--font-mono);
        font-size: 9px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 2px;
        cursor: pointer;
        outline: none;
        letter-spacing: 0.5px;
      }
      .btn-inject {
        background: rgba(0, 229, 255, 0.15);
        border: 1px solid var(--cyan);
        color: var(--cyan);
      }
      .btn-inject:hover {
        background: var(--cyan);
        color: #000;
      }
      .btn-clear {
        background: rgba(255, 23, 68, 0.2);
        border: 1px solid var(--red);
        color: var(--red);
      }
      .btn-clear:hover {
        background: var(--red);
        color: #fff;
      }
      .clear-all-btn {
        background: rgba(255, 171, 0, 0.15);
        border: 1px solid var(--amber);
        color: var(--amber);
        font-family: var(--font-mono);
        font-size: 10px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 2px;
        cursor: pointer;
      }
      .clear-all-btn:hover {
        background: var(--amber);
        color: #000;
      }
    `;
    document.head.appendChild(style);
  }
}
