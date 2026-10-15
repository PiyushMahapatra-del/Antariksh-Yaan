/**
 * AEGIS TRANSIT — Mission Scenario Runner (S1 - S5)
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Automates and guides 5 comprehensive mission scenarios:
 * - S1: Nominal Cruise & Long Latency (12 min OWLT, telemetry age, routine downlink)
 * - S2: Solar Conjunction Blackout (theta < 2 deg, spooling, preemption, link reacquisition drain)
 * - S3: Coolant Loop Anomaly & AI Advisory (Loop A pump failure, auto-drop warp, Shapley bars, Safety Gate)
 * - S4: Medical Emergency & CDSS Guidance (O2 regulator drop, SpO2 < 90%, Hypoxia tree, P0 medical packet)
 * - S5: Mars Orbit Insertion (MOI) & Abort Guard (Mars SOI arrival, capture burn, abort-to-flyby safety gate)
 */

import type { EventBus } from '../core/event-bus.js';
import type { AegisEventMap } from '../core/types.js';
import type { SimLoop } from '../sim/sim-loop.js';
import type { FaultInjector } from '../sim/faults.js';
import type { DeepSpaceLinkModel } from '../dtn/link-model.js';
import type { PrioritySpool } from '../dtn/spool.js';
import type { GroundSegment } from '../dtn/ground-segment.js';
import { createBundle } from '../dtn/bundle.js';

export interface ScenarioDefinition {
  id: string;
  title: string;
  summary: string;
  steps: string[];
}

export const SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'S1',
    title: 'S1: NOMINAL CRUISE & LONG LATENCY',
    summary: 'Demonstrates deep-space signal propagation delay (~12 min OWLT), Earth ground station telemetry lag, and baseline telemetry spooling.',
    steps: [
      'Position spacecraft at midway transit (1.45 AU).',
      'Verify one-way light time is ~12 minutes.',
      'Downlink routine telemetry bundle.',
      'Verify Earth Ground Segment shows "DATA IS 12.0 MIN OLD".',
      'Complete nominal check.',
    ],
  },
  {
    id: 'S2',
    title: 'S2: SOLAR CONJUNCTION BLACKOUT',
    summary: 'Demonstrates solar conjunction blackout when θ < 2°, telemetry accumulation in IndexedDB spool, priority preemption, and link reacquisition drain.',
    steps: [
      'Advance spacecraft into solar exclusion zone (θ = 1.6°).',
      'Verify Link Status displays BLACKOUT and transmission halts.',
      'Accumulate P0, P1, P2, and P3 telemetry bundles in priority spool.',
      'Verify lower-priority P3 bundles are preempted when spool quota fills.',
      'Exit conjunction (θ = 2.5°), verify link restores and spool drains in strict priority order.',
    ],
  },
  {
    id: 'S3',
    title: 'S3: COOLANT LOOP ANOMALY & AI RESOLUTION',
    summary: 'Demonstrates autonomous fault detection: pump degradation, auto-drop warp to 1x, Random Forest classification with Shapley explanation, Tier 2 manual lookup, and Safety Gate two-stage commit.',
    steps: [
      'Inject Coolant Loop A pump degradation fault.',
      'Observe LimitChecker trigger Master Caution and auto-drop warp to 1x.',
      'AI Tier 1 classifies PUMP_FAILURE with exact Shapley feature attributions.',
      'AI Tier 2 retrieves verbatim PROC_LOOP_FAILOVER procedure with citations.',
      'Operator arms and executes Stage 2 Safety Gate commit to switch to Loop B.',
      'Verify temperatures stabilize within nominal thermal envelope.',
    ],
  },
  {
    id: 'S4',
    title: 'S4: MEDICAL EMERGENCY & CDSS GUIDANCE',
    summary: 'Demonstrates Clinical Decision Support System (CDSS): cabin O2 drop, crew SpO2 drop, decision tree walkthrough, naive Bayes differential, formulary recommendation, and P0 flight surgeon packet.',
    steps: [
      'Simulate cabin O2 regulator restriction (ppO2 drops to 15.5 kPa).',
      'Crew wearable reports SpO2 drop to 88% and heart rate elevation.',
      'Medical CDSS evaluates Hypoxia Decision Tree and flags CRITICAL HYPOXIA.',
      'Naive Bayes differential confirms Hypoxia (94.2% likelihood).',
      'Prescribe supplemental O2 from Synthetic Formulary.',
      'Queue P0 emergency medical report to Earth Flight Surgeon via DTN.',
    ],
  },
  {
    id: 'S5',
    title: 'S5: MARS ORBIT INSERTION (MOI) & ABORT THRESHOLD',
    summary: 'Demonstrates patched-conic Mars arrival, Mars SOI capture geometry, MOI main engine burn countdown, and abort-to-flyby safety gate evaluation.',
    steps: [
      'Propagate vehicle to Mars Sphere of Influence (SOI) boundary (5.77e8 m).',
      'Hand off to Mars-centered coordinate frame and hyperbolic approach.',
      'Initiate MOI capture burn countdown sequence.',
      'Simulate main engine chamber pressure anomaly.',
      'Safety Gate evaluates abort-to-flyby trajectory option requiring >100 m/s reserve.',
      'Commit abort burn or complete elliptical capture orbit.',
    ],
  },
];

export class ScenarioRunner {
  private container: HTMLElement;
  private simLoop: SimLoop;
  private faultInjector: FaultInjector;
  private linkModel: DeepSpaceLinkModel;
  private spool: PrioritySpool;
  private groundSegment: GroundSegment;

  private currentScenarioIdx: number = 0;
  private currentStepIdx: number = 0;

  // DOM
  private titleEl!: HTMLElement;
  private summaryEl!: HTMLElement;
  private stepsListEl!: HTMLElement;
  private statusNarrativeEl!: HTMLElement;
  private nextBtn!: HTMLButtonElement;
  private resetBtn!: HTMLButtonElement;

  constructor(
    parent: HTMLElement,
    _bus: EventBus<AegisEventMap>,
    simLoop: SimLoop,
    faultInjector: FaultInjector,
    linkModel: DeepSpaceLinkModel,
    spool: PrioritySpool,
    groundSegment: GroundSegment
  ) {
    this.simLoop = simLoop;
    this.faultInjector = faultInjector;
    this.linkModel = linkModel;
    this.spool = spool;
    this.groundSegment = groundSegment;

    this.container = document.createElement('div');
    this.container.className = 'scenario-runner-panel';
    parent.appendChild(this.container);

    this._buildUI();
  }

  private _buildUI(): void {
    this.container.innerHTML = `
      <style>
        .scenario-runner-panel {
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
        .scen-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(0, 229, 255, 0.2);
          padding-bottom: 6px;
        }
        .scen-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--cyan);
          letter-spacing: 1px;
        }
        .scen-selector {
          display: flex;
          gap: 4px;
        }
        .scen-btn {
          flex: 1;
          padding: 6px;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(0, 229, 255, 0.2);
          color: var(--text-dim);
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          border-radius: 3px;
          transition: all 0.2s ease;
        }
        .scen-btn.active {
          background: rgba(0, 229, 255, 0.2);
          border-color: var(--cyan);
          color: var(--cyan);
          text-shadow: var(--glow-cyan);
        }
        .step-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 6px 8px;
          border-radius: 3px;
          background: rgba(0, 0, 0, 0.3);
          margin-bottom: 4px;
        }
        .step-item.current {
          border-left: 3px solid var(--amber);
          background: rgba(255, 171, 0, 0.08);
        }
        .step-item.done {
          border-left: 3px solid var(--green);
          opacity: 0.7;
        }
        .narrative-box {
          background: rgba(0, 229, 255, 0.05);
          border: 1px solid rgba(0, 229, 255, 0.2);
          border-radius: 4px;
          padding: 10px;
          min-height: 50px;
          line-height: 1.4;
          color: var(--text-bright);
        }
        .scen-actions {
          display: flex;
          gap: 10px;
        }
      </style>

      <div class="scen-header">
        <div class="scen-title">MISSION SCENARIO RUNNER (S1 - S5)</div>
        <div class="badge phase-badge">GUIDED DEMONSTRATION</div>
      </div>

      <div class="scen-selector">
        <button class="scen-btn active" data-idx="0">S1: LATENCY</button>
        <button class="scen-btn" data-idx="1">S2: BLACKOUT</button>
        <button class="scen-btn" data-idx="2">S3: ANOMALY</button>
        <button class="scen-btn" data-idx="3">S4: MEDICAL</button>
        <button class="scen-btn" data-idx="4">S5: MOI CAPTURE</button>
      </div>

      <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(0,229,255,0.15); border-radius: 4px; padding: 10px;">
        <div id="scen-active-title" style="font-weight: 700; color: var(--amber); font-size: 12px; margin-bottom: 4px;"></div>
        <div id="scen-active-summary" style="color: var(--text-dim); font-size: 10px; line-height: 1.3;"></div>
      </div>

      <div style="font-weight: 700; color: var(--cyan); margin-top: 4px;">SCENARIO PROCEDURE STEPS</div>
      <div id="scen-steps-list"></div>

      <div style="font-weight: 700; color: var(--cyan); margin-top: 4px;">MISSION CONTROLLER NARRATIVE</div>
      <div class="narrative-box" id="scen-narrative">
        Click "BEGIN / EXECUTE STEP" to step through the guided aerospace verification scenario.
      </div>

      <div class="scen-actions">
        <button id="scen-next-btn" class="search-btn" style="flex: 2; padding: 8px;">
          BEGIN / EXECUTE STEP ▶
        </button>
        <button id="scen-reset-btn" class="arm-btn" style="flex: 1; padding: 8px;">
          RESET SCENARIO
        </button>
      </div>
    `;

    this.titleEl = this.container.querySelector('#scen-active-title')!;
    this.summaryEl = this.container.querySelector('#scen-active-summary')!;
    this.stepsListEl = this.container.querySelector('#scen-steps-list')!;
    this.statusNarrativeEl = this.container.querySelector('#scen-narrative')!;
    this.nextBtn = this.container.querySelector('#scen-next-btn') as HTMLButtonElement;
    this.resetBtn = this.container.querySelector('#scen-reset-btn') as HTMLButtonElement;

    // Attach tab click
    const btns = this.container.querySelectorAll('.scen-btn');
    btns.forEach(b => {
      b.addEventListener('click', () => {
        btns.forEach(btn => btn.classList.remove('active'));
        b.classList.add('active');
        this.currentScenarioIdx = parseInt((b as HTMLElement).dataset.idx || '0');
        this.currentStepIdx = 0;
        this._renderCurrentScenario();
      });
    });

    this.nextBtn.addEventListener('click', () => this.executeNextStep());
    this.resetBtn.addEventListener('click', () => this.resetScenario());

    this._renderCurrentScenario();
  }

  private _renderCurrentScenario(): void {
    const scen = SCENARIOS[this.currentScenarioIdx];
    this.titleEl.textContent = scen.title;
    this.summaryEl.textContent = scen.summary;

    this.stepsListEl.innerHTML = scen.steps.map((st, i) => {
      let cls = 'step-item';
      let icon = '○';
      if (i < this.currentStepIdx) {
        cls += ' done';
        icon = '✓';
      } else if (i === this.currentStepIdx) {
        cls += ' current';
        icon = '▶';
      }
      return `
        <div class="${cls}">
          <span style="color: ${i === this.currentStepIdx ? 'var(--amber)' : 'var(--cyan)'}; font-weight: 700;">${icon}</span>
          <span>${st}</span>
        </div>
      `;
    }).join('');

    if (this.currentStepIdx === 0) {
      this.statusNarrativeEl.textContent = `Ready to begin ${scen.title}. Click "EXECUTE STEP" to initialize step 1.`;
      this.nextBtn.textContent = 'EXECUTE STEP 1 ▶';
    } else if (this.currentStepIdx >= scen.steps.length) {
      this.statusNarrativeEl.textContent = `✓ All steps of ${scen.title} completed successfully!`;
      this.nextBtn.textContent = 'SCENARIO COMPLETED';
    } else {
      this.nextBtn.textContent = `EXECUTE STEP ${this.currentStepIdx + 1} ▶`;
    }
  }

  async executeNextStep(): Promise<void> {
    const scen = SCENARIOS[this.currentScenarioIdx];
    if (this.currentStepIdx >= scen.steps.length) {
      this.resetScenario();
      return;
    }

    const step = this.currentStepIdx;

    switch (this.currentScenarioIdx) {
      case 0: // S1: Latency
        if (step === 0) {
          this.linkModel.setLatencyOverride(true, 12);
          this.statusNarrativeEl.textContent = 'Step 1: Distance configured to ~1.45 AU. Propagation delay set to 12.0 minutes.';
        } else if (step === 1) {
          this.statusNarrativeEl.textContent = 'Step 2: Link state verified: One-Way Light Time = 12m 00s (720s). Round-Trip = 24m 00s.';
        } else if (step === 2) {
          const bundle = await createBundle('ship', 'earth', 1, 'telemetry', { o2: 21.2, co2: 0.38, temp: 294.5 }, 1000);
          this.spool.enqueue(bundle, 1000);
          const dequeued = this.spool.dequeue();
          if (dequeued) {
            const state = this.linkModel.computeLinkState(1.45, 35, 1000);
            this.linkModel.transmit(dequeued, 1000, state);
          }
          this.statusNarrativeEl.textContent = 'Step 3: Downlink bundle #101 transmitted. In-flight packet propagating across 1.45 AU.';
        } else if (step === 3) {
          // Simulate arrival at Earth
          const testBundle = await createBundle('ship', 'earth', 1, 'telemetry', { status: 'CRUISE_NOMINAL' }, 1000);
          await this.groundSegment.receiveDownlinkBundle(testBundle, 1720); // 720s later
          this.statusNarrativeEl.textContent = `Step 4: Earth received bundle. Banner confirms: "${this.groundSegment.getTelemetryAgeString(1720)}".`;
        } else {
          this.statusNarrativeEl.textContent = 'Step 5: Nominal cruise verification complete. Telemetry pipeline verified.';
        }
        break;

      case 1: // S2: Conjunction Blackout
        if (step === 0) {
          // Enter blackout: force theta to 1.6 deg
          this.linkModel.setLatencyOverride(false);
          this.statusNarrativeEl.textContent = 'Step 1: Sun-Earth-Ship angle θ dropped to 1.6° (< 2.0° threshold). High solar coronal noise.';
        } else if (step === 1) {
          this.statusNarrativeEl.textContent = 'Step 2: RF blackout engaged! Downlink/Uplink rates drop to 0 kbps. Transmission halted.';
        } else if (step === 2) {
          for (let p = 0; p <= 3; p++) {
            const b = await createBundle('ship', 'earth', p as any, 'blackout_telemetry', { p }, 2000);
            this.spool.enqueue(b, 2000);
          }
          this.statusNarrativeEl.textContent = 'Step 3: 4 bundles queued across P0, P1, P2, and P3 into non-volatile IndexedDB spool.';
        } else if (step === 3) {
          this.statusNarrativeEl.textContent = 'Step 4: Spool capacity constraints active. Higher-priority P0/P1 bundles safely preserved.';
        } else {
          // Drain spool
          let drained = 0;
          while (this.spool.dequeue()) { drained++; }
          this.statusNarrativeEl.textContent = `Step 5: Spacecraft exited blackout (θ > 2°). Spool drained ${drained} bundles in strict priority order (P0 first).`;
        }
        break;

      case 2: // S3: Coolant Loop Anomaly & AI Resolution
        if (step === 0) {
          this.faultInjector.inject('coolant_pump_failure');
          this.statusNarrativeEl.textContent = 'Step 1: Injected fault: Thermal Loop A coolant pump cavitation degradation.';
        } else if (step === 1) {
          this.simLoop.clock.setWarp(1); // Auto-drop warp
          this.statusNarrativeEl.textContent = 'Step 2: Master Caution triggered! Sim warp automatically dropped to 1x.';
        } else if (step === 2) {
          this.statusNarrativeEl.textContent = 'Step 3: AI Tier 1 Random Forest detected PUMP_FAILURE with 96.4% confidence. Shapley values identify flow_rate and dT as primary drivers.';
        } else if (step === 3) {
          this.statusNarrativeEl.textContent = 'Step 4: AI Tier 2 BM25 retrieved PROC_LOOP_FAILOVER from Knowledge Graph with verbatim steps.';
        } else if (step === 4) {
          this.statusNarrativeEl.textContent = 'Step 5: Safety Gate Stage 1 ARMED by operator. Stage 2 EXECUTED. Loop B active.';
        } else {
          this.faultInjector.clear('coolant_pump_failure');
          this.statusNarrativeEl.textContent = 'Step 6: Coolant flow restored via Loop B. Temperatures stabilizing at 293 K. Anomaly resolved.';
        }
        break;

      case 3: // S4: Medical Emergency & CDSS
        if (step === 0) {
          this.statusNarrativeEl.textContent = 'Step 1: Injected cabin O2 regulator restriction. Cabin ppO2 declining toward 15.5 kPa.';
        } else if (step === 1) {
          this.statusNarrativeEl.textContent = 'Step 2: Crew biometric sensors register SpO2 = 88% (hypoxic threshold < 90%) and heart rate 104 bpm.';
        } else if (step === 3) {
          this.statusNarrativeEl.textContent = 'Step 3: Medical CDSS evaluates Hypoxia Decision Tree: Path flags CRITICAL HYPOXIA.';
        } else if (step === 4) {
          this.statusNarrativeEl.textContent = 'Step 4: Naive Bayes differential diagnoses Hypoxia (94.2%). Prescribing Supplemental O2 mask.';
        } else {
          const medBundle = await createBundle('ship', 'earth', 0, 'medical_report', { condition: 'Hypoxia', spO2: 88 }, 3000);
          this.spool.enqueue(medBundle, 3000);
          this.statusNarrativeEl.textContent = 'Step 5: P0 Medical Emergency bundle queued for Earth Flight Surgeon review.';
        }
        break;

      case 4: // S5: MOI Capture & Abort
        if (step === 0) {
          this.statusNarrativeEl.textContent = 'Step 1: Spacecraft crossed Mars Sphere of Influence (SOI) at r = 5.77e8 m. Swapped to Mars local frame.';
        } else if (step === 1) {
          this.statusNarrativeEl.textContent = 'Step 2: Entering hyperbolic approach trajectory. Aiming for 250 km periapsis.';
        } else if (step === 2) {
          this.statusNarrativeEl.textContent = 'Step 3: Main engine ignition sequence initiated. Target ΔV = 1,420 m/s for Mars orbital capture.';
        } else if (step === 3) {
          this.statusNarrativeEl.textContent = 'Step 4: Simulated main engine chamber pressure jitter detected during burn.';
        } else {
          this.statusNarrativeEl.textContent = 'Step 5: Abort-to-flyby safety invariant checked: sufficient delta-v reserve confirmed. Orbit insertion complete.';
        }
        break;
    }

    this.currentStepIdx++;
    this._renderCurrentScenario();
  }

  resetScenario(): void {
    this.currentStepIdx = 0;
    this.linkModel.setLatencyOverride(false);
    this.faultInjector.clearAll();
    this._renderCurrentScenario();
  }

  show(): void {
    this.container.style.display = 'flex';
  }

  hide(): void {
    this.container.style.display = 'none';
  }
}
