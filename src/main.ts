/**
 * AEGIS TRANSIT — Mission Console Main Entry Point
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * M1 Implementation: Simulation Clock, Astrodynamic Trajectory Manager,
 * Ephemerides, Deep Space Comms State, and Top Bar / Telemetry HUD.
 */

import { EventBus } from './core/event-bus.js';
import type { AegisEventMap, WarpPreset, MissionPhase } from './core/types.js';
import { SimLoop } from './sim/sim-loop.js';
import { AU_KM, SECONDS_PER_DAY } from './sim/constants.js';
import { TacticalMap, SkyRenderer, type CameraMode, type LockTarget } from './render/index.js';
import {
  TelemetryPanel,
  FaultPanel,
  CommsConsole,
  AIConsole,
  MemoryView,
  ScenarioRunner,
  EvalSuite,
} from './ui/index.js';
import { SafetyGate } from './fsw/safety-gate.js';
import { MemoryManager } from './fsw/memory-manager.js';
import { DeepSpaceLinkModel } from './dtn/link-model.js';
import { PrioritySpool } from './dtn/spool.js';
import { GroundSegment } from './dtn/ground-segment.js';
import { createBundle } from './dtn/bundle.js';

// ============================================================================
// Core Global Instances
// ============================================================================

/** Global typed event bus */
export const globalBus = new EventBus<AegisEventMap>();

/** Global simulation loop coordinator */
export const simLoop = new SimLoop(globalBus);

/** Global FSW Safety Gate & Memory Manager */
export const safetyGate = new SafetyGate();
export const memoryManager = new MemoryManager();

/** Global DTN Subsystem Instances */
export const linkModel = new DeepSpaceLinkModel();
export const dtnSpool = new PrioritySpool();
export const groundSegment = new GroundSegment();

/** Global UI Panel instances */
export let skyRenderer: SkyRenderer | null = null;
export let tacticalMap: TacticalMap | null = null;
export let telemetryPanel: TelemetryPanel | null = null;
export let faultPanel: FaultPanel | null = null;
export let commsConsole: CommsConsole | null = null;
export let aiConsole: AIConsole | null = null;
export let memoryView: MemoryView | null = null;
export let scenarioRunner: ScenarioRunner | null = null;
export let evalSuite: EvalSuite | null = null;

/** Currently active center view tab */
export let activeCenterTab: 'SKY' | 'TACTICAL' | 'TELEMETRY' = 'SKY';

/** Currently active left panel tab */
export let activeLeftTab: 'COMMS' | 'AI' | 'MEM' | 'SCENARIOS' | 'EVAL' = 'COMMS';

// ============================================================================
// Display Formatters
// ============================================================================

/**
 * Formats seconds into standard Mission Elapsed Time: +DDD:HH:MM:SS
 */
export function formatMET(totalSeconds: number): string {
  const safeSec = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(safeSec / 86400);
  const hours = Math.floor((safeSec % 86400) / 3600);
  const minutes = Math.floor((safeSec % 3600) / 60);
  const seconds = safeSec % 60;

  const pad = (n: number, width = 2) => String(n).padStart(width, '0');
  return `+${pad(days, 3)}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Formats a Julian Date into a readable calendar string: JD XXXXXXX.XX (YYYY-MM-DD HH:MM UTC)
 */
export function formatJD(jd: number): string {
  const ms = (jd - 2440587.5) * 86400000;
  const d = new Date(ms);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const min = String(d.getUTCMinutes()).padStart(2, '0');
  return `JD ${jd.toFixed(2)} (${yyyy}-${mm}-${dd} ${hh}:${min} UTC)`;
}

/**
 * Formats seconds into MMm SSs or HHh MMm SSs.
 */
export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const remS = s % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const remM = m % 60;
    return `${h}h ${remM}m ${remS}s`;
  }
  return `${m}m ${String(remS).padStart(2, '0')}s`;
}

// Warp presets with required labels: [1x] [10x] [1m/s] [10m/s] [1h/s] [1d/s] [7d/s]
const WARP_BUTTON_CONFIG: { preset: WarpPreset; label: string }[] = [
  { preset: 1, label: '1x' },
  { preset: 10, label: '10x' },
  { preset: 60, label: '1m/s' },
  { preset: 600, label: '10m/s' },
  { preset: 3600, label: '1h/s' },
  { preset: 86400, label: '1d/s' },
  { preset: 604800, label: '7d/s' },
];

// ============================================================================
// UI Console Initialization (Plain DOM / CSS)
// ============================================================================

function setupConsole(): void {
  const topBar = document.getElementById('top-bar');
  const centerView = document.getElementById('center-view');

  if (!topBar || !centerView) {
    console.error('AEGIS TRANSIT: Missing core DOM containers');
    return;
  }

  // Inject console styling
  const style = document.createElement('style');
  style.textContent = `
    #app {
      padding-top: 18px;
      grid-template-rows: 40px 1fr 180px !important;
    }
    #top-bar {
      margin-top: 0 !important;
      display: flex;
      align-items: center;
      padding: 0 10px;
    }
    .topbar-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: 100%;
      font-family: var(--font-mono);
      font-size: 11px;
      user-select: none;
      gap: 10px;
    }
    .topbar-left {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
    .mission-title {
      color: var(--cyan);
      font-weight: 700;
      font-size: 13px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      text-shadow: var(--glow-cyan);
    }
    .badge {
      display: inline-block;
      font-family: var(--font-mono);
      font-size: 9px;
      font-weight: 700;
      padding: 2px 5px;
      border-radius: 2px;
      letter-spacing: 1px;
      vertical-align: middle;
    }
    .phase-badge {
      background: var(--bg-glass);
      border: 1px solid var(--cyan-dim);
      color: var(--cyan);
    }
    .topbar-center {
      display: flex;
      align-items: center;
      gap: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .met-badge {
      color: var(--amber);
      font-weight: 700;
      letter-spacing: 1px;
      font-size: 12px;
      background: rgba(255, 171, 0, 0.1);
      border: 1px solid rgba(255, 171, 0, 0.3);
      padding: 2px 6px;
      border-radius: 2px;
    }
    .time-badge {
      color: var(--text-primary);
      font-size: 11px;
      background: var(--bg-glass);
      border: 1px solid rgba(0, 229, 255, 0.15);
      padding: 2px 6px;
      border-radius: 2px;
    }
    .link-badge {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      padding: 2px 6px;
      background: var(--bg-glass);
      border: 1px solid rgba(0, 229, 255, 0.15);
      border-radius: 2px;
    }
    .link-indicator {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      display: inline-block;
    }
    .link-NOMINAL { background: var(--green); box-shadow: 0 0 6px var(--green); }
    .link-DEGRADED { background: var(--amber); box-shadow: 0 0 6px var(--amber); }
    .link-BLACKOUT { background: var(--red); box-shadow: 0 0 6px var(--red); }
    .link-OVERRIDE { background: var(--magenta); box-shadow: 0 0 6px var(--magenta); }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 5px;
      flex-shrink: 0;
    }
    .warp-btn {
      background: var(--bg-glass);
      border: 1px solid var(--cyan-dim);
      color: var(--text-secondary);
      font-family: var(--font-mono);
      font-size: 10px;
      padding: 3px 6px;
      cursor: pointer;
      border-radius: 2px;
      transition: all 0.15s ease;
    }
    .warp-btn:hover {
      border-color: var(--cyan);
      color: var(--text-primary);
    }
    .warp-btn.active {
      background: var(--cyan);
      color: #000;
      font-weight: 700;
      border-color: var(--cyan);
      box-shadow: var(--glow-cyan);
    }
    .pause-btn {
      border-color: var(--amber);
      color: var(--amber);
      font-weight: 700;
    }
    .pause-btn.paused {
      background: var(--amber);
      color: #000;
    }

    /* High Warp Alert Banner */
    .high-warp-banner {
      background: rgba(255, 171, 0, 0.2);
      border-bottom: 1px solid var(--amber);
      color: var(--amber);
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      text-align: center;
      padding: 4px;
      letter-spacing: 1.5px;
      animation: pulse-warn 1.5s infinite alternate;
    }
    @keyframes pulse-warn {
      from { background: rgba(255, 171, 0, 0.15); }
      to { background: rgba(255, 171, 0, 0.35); }
    }

    /* Center View Layout & View Mode Tabs */
    .center-view-wrapper {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      position: relative;
      overflow: hidden;
    }
    .view-mode-tabs {
      display: flex;
      background: var(--bg-panel);
      border-bottom: var(--border);
      padding: 0 12px;
      gap: 6px;
      height: 30px;
      align-items: center;
      user-select: none;
      flex-shrink: 0;
    }
    .view-tab-btn {
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--text-secondary);
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 600;
      padding: 4px 10px;
      cursor: pointer;
      letter-spacing: 0.5px;
      transition: all 0.15s ease;
    }
    .view-tab-btn:hover {
      color: var(--text-primary);
    }
    .view-tab-btn.active {
      color: var(--cyan);
      border-bottom-color: var(--cyan);
      font-weight: 700;
    }
    .left-tabs {
      display: flex;
      background: rgba(0, 0, 0, 0.6);
      border-bottom: var(--border);
      gap: 2px;
      padding: 4px;
      user-select: none;
    }
    .left-tab-btn {
      flex: 1;
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-secondary);
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 700;
      padding: 5px 2px;
      text-align: center;
      cursor: pointer;
      border-radius: 2px;
      transition: all 0.15s ease;
    }
    .left-tab-btn:hover {
      color: var(--text-primary);
      border-color: rgba(0, 229, 255, 0.3);
    }
    .left-tab-btn.active {
      background: rgba(0, 229, 255, 0.15);
      border-color: var(--cyan);
      color: var(--cyan);
      text-shadow: var(--glow-cyan);
    }
    .cam-btn {
      background: var(--bg-glass);
      border: 1px solid var(--cyan-dim);
      color: var(--text-secondary);
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 600;
      padding: 2px 6px;
      cursor: pointer;
      border-radius: 2px;
      transition: all 0.15s ease;
      user-select: none;
      white-space: nowrap;
    }
    .cam-btn:hover {
      border-color: var(--cyan);
      color: var(--text-primary);
    }
    .cam-btn.active {
      background: var(--cyan);
      color: #000;
      font-weight: 700;
      border-color: var(--cyan);
      box-shadow: var(--glow-cyan);
    }
    #sky-view-container {
      flex: 1;
      width: 100%;
      height: calc(100% - 30px);
      position: relative;
      overflow: hidden;
      background: var(--bg-primary);
    }
    #tactical-map-container {
      flex: 1;
      width: 100%;
      height: calc(100% - 30px);
      position: relative;
      overflow: hidden;
      background: var(--bg-primary);
      display: none;
    }
    #center-hud-view {
      flex: 1;
      width: 100%;
      height: calc(100% - 30px);
      display: none;
      flex-direction: column;
      overflow: hidden;
    }

    /* Center Telemetry & Trajectory HUD */
    .center-hud-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      position: relative;
      background: radial-gradient(circle at 50% 40%, rgba(0, 229, 255, 0.04) 0%, rgba(10, 14, 20, 0.98) 75%);
    }
    .hud-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
      border-bottom: var(--border);
      background: var(--bg-panel);
    }
    .hud-title {
      color: var(--cyan);
      font-family: var(--font-mono);
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 1.5px;
    }
    .hud-sub {
      color: var(--text-secondary);
      font-family: var(--font-mono);
      font-size: 10px;
    }
    .hud-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 12px;
      padding: 16px;
      overflow-y: auto;
      flex: 1;
    }
    .hud-card {
      background: var(--bg-panel);
      border: var(--border);
      padding: 12px 14px;
      border-radius: 3px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .card-title {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      color: var(--cyan);
      letter-spacing: 1px;
      border-bottom: 1px solid rgba(0, 229, 255, 0.2);
      padding-bottom: 4px;
      margin-bottom: 4px;
    }
    .telemetry-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--text-secondary);
      padding: 2px 0;
    }
    .mono-val {
      color: var(--text-primary);
      font-weight: 600;
    }
    .highlight-val {
      color: var(--cyan);
      font-weight: 700;
    }
  `;
  document.head.appendChild(style);

  // --- Top Bar Markup ---
  topBar.innerHTML = `
    <div class="topbar-container">
      <div class="topbar-left">
        <span class="mission-title">AEGIS TRANSIT</span>
        <span id="phase-badge" class="badge phase-badge">${simLoop.trajectory.shipState.phase.toUpperCase()}</span>
        <span class="badge fidelity-high">M1 ACTIVE</span>
        <span class="badge synthetic-banner">SYNTHETIC</span>
      </div>
      <div class="topbar-center">
        <span>MET:</span>
        <span id="met-display" class="met-badge">${formatMET(simLoop.clock.metSeconds)}</span>
        <span id="sim-time-display" class="time-badge">${formatJD(simLoop.clock.simTimeJD)}</span>
        <div id="link-status" class="link-badge">
          <span id="link-indicator" class="link-indicator link-NOMINAL"></span>
          <span>LINK:</span>
          <span id="link-state-val" style="font-weight: 700;">NOMINAL</span>
          <span id="link-delay-val" style="color: var(--text-secondary);">(0s OWLT)</span>
        </div>
      </div>
      <div class="topbar-right">
        <button id="pause-btn" class="warp-btn pause-btn" title="Toggle pause [Space]">PAUSE</button>
        <span style="color: var(--text-secondary); margin: 0 1px;">|</span>
        <div id="warp-buttons" style="display: flex; gap: 3px;"></div>
      </div>
    </div>
  `;

  // --- Warp Preset Buttons Row ---
  const warpBtnContainer = document.getElementById('warp-buttons');
  if (warpBtnContainer) {
    WARP_BUTTON_CONFIG.forEach(({ preset, label }) => {
      const btn = document.createElement('button');
      btn.className = `warp-btn ${preset === simLoop.clock.warp && !simLoop.clock.paused ? 'active' : ''}`;
      btn.dataset.warp = String(preset);
      btn.textContent = label;
      btn.title = `Time Warp ${label} (${preset}x)`;

      btn.addEventListener('click', () => {
        simLoop.clock.resume();
        simLoop.clock.setWarp(preset);
        globalBus.emit('sim:warpChanged', { warp: simLoop.clock.warp, paused: simLoop.clock.paused });
      });

      warpBtnContainer.appendChild(btn);
    });
  }

  // --- Pause Button Handler ---
  const pauseBtn = document.getElementById('pause-btn');
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      simLoop.clock.togglePause();
      globalBus.emit('sim:warpChanged', { warp: simLoop.clock.warp, paused: simLoop.clock.paused });
    });
  }

  // --- Center View Markup ---
  centerView.innerHTML = `
    <div id="high-warp-banner" class="high-warp-banner" style="display: none;">
      SUBSYSTEMS PAUSED (HIGH WARP &gt; 600x) — ASTRODYNAMICS PROPAGATION ONLY
    </div>
    <div class="center-view-wrapper">
      <div class="view-mode-tabs" style="justify-content: space-between;">
        <div style="display: flex; gap: 6px; align-items: center;">
          <button id="tab-sky-view" class="view-tab-btn active" title="Three.js 3D Celestial Sky View [Default]">★ SKY VIEW</button>
          <button id="tab-tactical-map" class="view-tab-btn" title="Top-down Canvas 2D Ecliptic Display">◉ TACTICAL MAP</button>
          <button id="tab-telemetry-hud" class="view-tab-btn" title="Astrodynamics & Kinematic Metrics">▤ ASTRODYNAMICS TELEMETRY</button>
        </div>
        <div id="sky-view-controls" style="display: flex; gap: 4px; align-items: center;">
          <span style="color: var(--text-secondary); font-size: 10px; font-family: var(--font-mono); margin-right: 2px;">CAMERA:</span>
          <button class="cam-btn active" data-mode="FORWARD" title="Track Velocity Vector [F]">FWD</button>
          <button class="cam-btn" data-mode="RETROGRADE" title="Track Opposite Velocity [R]">RETRO</button>
          <button class="cam-btn" data-mode="TARGET_LOCK" data-target="MARS" title="Lock Mars [M]">MARS</button>
          <button class="cam-btn" data-mode="TARGET_LOCK" data-target="EARTH" title="Lock Earth [E]">EARTH</button>
          <button class="cam-btn" data-mode="TARGET_LOCK" data-target="SUN" title="Lock Sun [S]">SUN</button>
          <button class="cam-btn" data-mode="FREE_LOOK" title="Interactive Mouse Drag Look [L]">FREE</button>
          <span style="color: var(--cyan-dim); margin: 0 2px;">|</span>
          <button id="dust-streaks-btn" class="cam-btn active" title="Toggle velocity streaks vs physically literal stationary dust [T]">STREAKS: ON</button>
        </div>
      </div>
      <div id="sky-view-container"></div>
      <div id="tactical-map-container" style="display: none;"></div>
      <div id="center-hud-view">
        <div class="center-hud-container">
          <div class="hud-header">
            <div>
              <div class="hud-title">MISSION TRAJECTORY & ASTRODYNAMICS CONSOLE</div>
              <div class="hud-sub">TYPE-I COPLANAR HELIOCENTRIC TRANSFER // KEPLER UNIVERSAL PROPAGATION</div>
            </div>
            <div class="hud-sub">ALL TELEMETRY DERIVED FROM ASTRODYNAMIC STATE // SYNTHETIC</div>
          </div>
          <div class="hud-grid">
            <div class="hud-card">
              <div class="card-title">SPACECRAFT KINEMATICS</div>
              <div class="telemetry-row"><span>Position X:</span><span id="sc-pos-x" class="mono-val">+0.0000 AU</span></div>
              <div class="telemetry-row"><span>Position Y:</span><span id="sc-pos-y" class="mono-val">+0.0000 AU</span></div>
              <div class="telemetry-row"><span>Heliocentric Dist:</span><span id="sc-dist-sun" class="highlight-val">0.0000 AU</span></div>
              <div class="telemetry-row"><span>Velocity (Vx, Vy):</span><span id="sc-vel-vec" class="mono-val">+0.000, +0.000</span></div>
              <div class="telemetry-row"><span>Heliocentric Speed:</span><span id="sc-speed" class="mono-val">0.00 km/s</span></div>
              <div class="telemetry-row"><span>Remaining &Delta;V:</span><span id="sc-deltav" class="mono-val">${simLoop.trajectory.shipState.deltaVRemaining} m/s</span></div>
              <div class="telemetry-row"><span>Vehicle Mass:</span><span id="sc-mass" class="mono-val">${simLoop.trajectory.shipState.mass} kg</span></div>
            </div>

            <div class="hud-card">
              <div class="card-title">CELESTIAL EPHEMERIDES</div>
              <div class="telemetry-row"><span>Earth Heliocentric:</span><span id="earth-pos-val" class="mono-val">+0.000, +0.000 AU</span></div>
              <div class="telemetry-row"><span>Mars Heliocentric:</span><span id="mars-pos-val" class="mono-val">+0.000, +0.000 AU</span></div>
              <div class="telemetry-row"><span>Dist to Earth:</span><span id="dist-earth-val" class="mono-val">0.000 AU</span></div>
              <div class="telemetry-row"><span>Dist to Mars:</span><span id="dist-mars-val" class="highlight-val">0.000 AU</span></div>
              <div class="telemetry-row"><span>Mars SOI Encounter:</span><span id="mars-soi-val" class="mono-val">NO</span></div>
              <div class="telemetry-row"><span>Mars True Anomaly:</span><span id="mars-nu-val" class="mono-val">0.0&deg;</span></div>
            </div>

            <div class="hud-card">
              <div class="card-title">DEEP SPACE COMMUNICATIONS</div>
              <div class="telemetry-row"><span>Link State:</span><span id="comm-link-val" class="highlight-val">NOMINAL</span></div>
              <div class="telemetry-row"><span>One-Way Light Time:</span><span id="comm-owlt-val" class="mono-val">0m 00s</span></div>
              <div class="telemetry-row"><span>Round-Trip Delay:</span><span id="comm-rtt-val" class="mono-val">0m 00s</span></div>
              <div class="telemetry-row"><span>Solar Elongation &theta;:</span><span id="comm-theta-val" class="mono-val">180.0&deg;</span></div>
              <div class="telemetry-row"><span>Link Data Rate:</span><span id="comm-rate-val" class="mono-val">0 kbps</span></div>
              <div class="telemetry-row"><span>Packet Loss Prob:</span><span id="comm-loss-val" class="mono-val">0.0%</span></div>
              <div class="telemetry-row"><span>Delay Override:</span><span id="comm-override-val" class="mono-val">DISABLED</span></div>
            </div>

            <div class="hud-card">
              <div class="card-title">MISSION FLIGHT PROFILE</div>
              <div class="telemetry-row"><span>Departure Window:</span><span id="mission-dep-val" class="mono-val">${formatJD(simLoop.trajectory.departureJD)}</span></div>
              <div class="telemetry-row"><span>Target Arrival:</span><span id="mission-arr-val" class="mono-val">${formatJD(simLoop.trajectory.arrivalJD)}</span></div>
              <div class="telemetry-row"><span>Planned TOF:</span><span class="highlight-val">${simLoop.trajectory.tofDays} days</span></div>
              <div class="telemetry-row"><span>Transfer Trajectory:</span><span class="mono-val">Lambert Universal Variable</span></div>
              <div class="telemetry-row"><span>Subsystems Status:</span><span id="subsystems-status-val" class="mono-val">ACTIVE (≤ 600x)</span></div>
              <div class="telemetry-row"><span>Tactical Viewport:</span><span class="mono-val" style="color: var(--green)">ACTIVE (CANVAS 2D)</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // ============================================================================
  // DOM Cache & Event Bus Handlers
  // ============================================================================

  const metDisplay = document.getElementById('met-display');
  const simTimeDisplay = document.getElementById('sim-time-display');
  const phaseBadge = document.getElementById('phase-badge');
  const highWarpBanner = document.getElementById('high-warp-banner');
  const linkIndicator = document.getElementById('link-indicator');
  const linkStateVal = document.getElementById('link-state-val');
  const linkDelayVal = document.getElementById('link-delay-val');

  // Center HUD elements
  const scPosX = document.getElementById('sc-pos-x');
  const scPosY = document.getElementById('sc-pos-y');
  const scDistSun = document.getElementById('sc-dist-sun');
  const scVelVec = document.getElementById('sc-vel-vec');
  const scSpeed = document.getElementById('sc-speed');
  const earthPosVal = document.getElementById('earth-pos-val');
  const marsPosVal = document.getElementById('mars-pos-val');
  const distEarthVal = document.getElementById('dist-earth-val');
  const distMarsVal = document.getElementById('dist-mars-val');
  const marsSoiVal = document.getElementById('mars-soi-val');
  const marsNuVal = document.getElementById('mars-nu-val');
  const commLinkVal = document.getElementById('comm-link-val');
  const commOwltVal = document.getElementById('comm-owlt-val');
  const commRttVal = document.getElementById('comm-rtt-val');
  const commThetaVal = document.getElementById('comm-theta-val');
  const commRateVal = document.getElementById('comm-rate-val');
  const commLossVal = document.getElementById('comm-loss-val');
  const subsystemsStatusVal = document.getElementById('subsystems-status-val');

  // Warp & Pause changes
  globalBus.on('sim:warpChanged', ({ warp, paused }) => {
    // Update pause button state
    if (pauseBtn) {
      if (paused) {
        pauseBtn.classList.add('paused');
        pauseBtn.textContent = 'RESUME';
      } else {
        pauseBtn.classList.remove('paused');
        pauseBtn.textContent = 'PAUSE';
      }
    }

    // Update warp button styles
    const allWarpBtns = document.querySelectorAll('#warp-buttons .warp-btn');
    allWarpBtns.forEach((el) => {
      const btn = el as HTMLButtonElement;
      const w = Number(btn.dataset.warp);
      if (!paused && w === warp) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Toggle high warp banner (> 600x)
    if (highWarpBanner) {
      if (warp > 600 && !paused) {
        highWarpBanner.style.display = 'block';
      } else {
        highWarpBanner.style.display = 'none';
      }
    }

    // Update subsystems status indicator
    if (subsystemsStatusVal) {
      if (simLoop.clock.subsystemsActive && !paused) {
        subsystemsStatusVal.textContent = 'ACTIVE (≤ 600x)';
        subsystemsStatusVal.style.color = 'var(--green)';
      } else if (paused) {
        subsystemsStatusVal.textContent = 'PAUSED';
        subsystemsStatusVal.style.color = 'var(--amber)';
      } else {
        subsystemsStatusVal.textContent = 'PAUSED (HIGH WARP)';
        subsystemsStatusVal.style.color = 'var(--red)';
      }
    }
  });

  // Phase changes
  globalBus.on('sim:phaseChanged', ({ to }: { to: MissionPhase }) => {
    if (phaseBadge) {
      phaseBadge.textContent = to.toUpperCase();
    }
  });

  // Comm state updates
  globalBus.on('comm:stateChanged', (commState) => {
    if (linkStateVal) {
      linkStateVal.textContent = commState.linkState;
    }
    if (linkDelayVal) {
      linkDelayVal.textContent = `(${formatDuration(commState.oneWayLightTimeSec)} OWLT)`;
    }
    if (linkIndicator) {
      linkIndicator.className = `link-indicator link-${commState.linkState}`;
    }

    if (commLinkVal) {
      commLinkVal.textContent = commState.linkState;
    }
    if (commOwltVal) {
      commOwltVal.textContent = formatDuration(commState.oneWayLightTimeSec);
    }
    if (commRttVal) {
      commRttVal.textContent = formatDuration(commState.roundTripSec);
    }
    if (commThetaVal) {
      commThetaVal.textContent = `${commState.thetaDeg.toFixed(1)}°`;
    }
    if (commRateVal) {
      commRateVal.textContent = `${(commState.linkRateBps / 1000).toFixed(1)} kbps`;
    }
    if (commLossVal) {
      commLossVal.textContent = `${(commState.packetLossProb * 100).toFixed(1)}%`;
    }
  });

  // Main simulation tick listener: updates telemetry derived strictly from simulation state
  globalBus.on('sim:tick', () => {
    const jd = simLoop.clock.simTimeJD;
    const met = simLoop.clock.metSeconds;

    if (metDisplay) {
      metDisplay.textContent = formatMET(met);
    }
    if (simTimeDisplay) {
      simTimeDisplay.textContent = formatJD(jd);
    }

    // Spacecraft kinematics
    const ship = simLoop.trajectory.shipState;
    const distSun = Math.hypot(ship.pos[0], ship.pos[1]);
    const speedAuDay = Math.hypot(ship.vel[0], ship.vel[1]);
    const speedKmS = (speedAuDay * AU_KM) / SECONDS_PER_DAY;

    if (scPosX) scPosX.textContent = `${ship.pos[0] >= 0 ? '+' : ''}${ship.pos[0].toFixed(4)} AU`;
    if (scPosY) scPosY.textContent = `${ship.pos[1] >= 0 ? '+' : ''}${ship.pos[1].toFixed(4)} AU`;
    if (scDistSun) scDistSun.textContent = `${distSun.toFixed(4)} AU`;
    if (scVelVec) scVelVec.textContent = `${ship.vel[0].toFixed(4)}, ${ship.vel[1].toFixed(4)} AU/d`;
    if (scSpeed) scSpeed.textContent = `${speedKmS.toFixed(2)} km/s`;

    // Planet positions and encounters
    const earth = simLoop.earthState;
    const mars = simLoop.marsState;
    const distEarth = Math.hypot(ship.pos[0] - earth.x, ship.pos[1] - earth.y);
    const distMars = simLoop.trajectory.distanceToMars([mars.x, mars.y]);
    const inMarsSoi = simLoop.trajectory.isInMarsSOI([mars.x, mars.y]);

    if (earthPosVal) earthPosVal.textContent = `${earth.x.toFixed(3)}, ${earth.y.toFixed(3)} AU`;
    if (marsPosVal) marsPosVal.textContent = `${mars.x.toFixed(3)}, ${mars.y.toFixed(3)} AU`;
    if (distEarthVal) distEarthVal.textContent = `${distEarth.toFixed(3)} AU (${(distEarth * AU_KM).toLocaleString(undefined, { maximumFractionDigits: 0 })} km)`;
    if (distMarsVal) distMarsVal.textContent = `${distMars.toFixed(4)} AU (${(distMars * AU_KM).toLocaleString(undefined, { maximumFractionDigits: 0 })} km)`;
    if (marsSoiVal) {
      marsSoiVal.textContent = inMarsSoi ? 'YES (WITHIN SOI)' : 'NO (CRUISE)';
      marsSoiVal.style.color = inMarsSoi ? 'var(--green)' : 'var(--text-secondary)';
    }
    if (marsNuVal) {
      const nuDeg = (mars.nu * 180) / Math.PI;
      marsNuVal.textContent = `${nuDeg.toFixed(1)}°`;
    }

    // Update SkyRenderer state derived strictly from physical astrodynamic simulation
    if (skyRenderer) {
      skyRenderer.render({
        simTimeJD: jd,
        shipPos: ship.pos,
        shipVel: ship.vel,
        earthPos: simLoop.earthPos,
        marsPos: simLoop.marsPos,
        phase: ship.phase,
        dt: simLoop.clock.subsystemsActive ? 1 / 60 : 0.016,
      });
    }

    // Update Tactical Map state
    if (tacticalMap) {
      tacticalMap.updateState({
        earthPos: simLoop.earthPos,
        marsPos: simLoop.marsPos,
        shipPos: ship.pos,
        shipVel: ship.vel,
        commState: simLoop.comms.state,
        simTimeJD: jd,
        phase: ship.phase,
      });
    }

    // Update Deep Space DTN Link & Propagation Pipeline
    const linkState = linkModel.computeLinkState(distEarth, simLoop.comms.state.thetaDeg, met);
    if (commsConsole) {
      commsConsole.update(linkState, met);
    }

    // Step in-flight bundles and deliver to Earth ground segment
    const { delivered } = linkModel.step(met);
    for (const b of delivered) {
      groundSegment.receiveDownlinkBundle(b, met);
    }

    // Routine telemetry bundle spooling (every 10 sim seconds)
    if (Math.floor(met) % 10 === 0 && linkState.status !== 'BLACKOUT') {
      createBundle('ship', 'earth', 1, 'telemetry', {
        met,
        pos: ship.pos,
        phase: ship.phase,
      }, met).then(b => {
        dtnSpool.enqueue(b, met);
      }).catch(() => {});
    }

    // Dequeue and transmit from spool if link active
    if (linkState.status !== 'BLACKOUT' && dtnSpool.getTotalCount() > 0) {
      const nextBundle = dtnSpool.dequeue();
      if (nextBundle) {
        linkModel.transmit(nextBundle, met, linkState);
      }
    }
  });

  // Frame render hook for smooth 60fps animations
  globalBus.on('render:frame', () => {
    if (activeCenterTab === 'SKY' && skyRenderer) {
      const ship = simLoop.trajectory.shipState;
      skyRenderer.render({
        simTimeJD: simLoop.clock.simTimeJD,
        shipPos: ship.pos,
        shipVel: ship.vel,
        earthPos: simLoop.earthPos,
        marsPos: simLoop.marsPos,
        phase: ship.phase,
      });
    } else if (activeCenterTab === 'TACTICAL' && tacticalMap) {
      tacticalMap.render();
    }
  });

  // --- View Mode Tabs Switcher ---
  const tabSky = document.getElementById('tab-sky-view');
  const tabTactical = document.getElementById('tab-tactical-map');
  const tabTelemetry = document.getElementById('tab-telemetry-hud');
  const skyContainer = document.getElementById('sky-view-container');
  const mapContainer = document.getElementById('tactical-map-container');
  const hudView = document.getElementById('center-hud-view');
  const skyControls = document.getElementById('sky-view-controls');

  const switchTab = (tab: 'SKY' | 'TACTICAL' | 'TELEMETRY') => {
    activeCenterTab = tab;

    if (tabSky) tabSky.classList.toggle('active', tab === 'SKY');
    if (tabTactical) tabTactical.classList.toggle('active', tab === 'TACTICAL');
    if (tabTelemetry) tabTelemetry.classList.toggle('active', tab === 'TELEMETRY');

    if (skyContainer) skyContainer.style.display = tab === 'SKY' ? 'block' : 'none';
    if (mapContainer) mapContainer.style.display = tab === 'TACTICAL' ? 'block' : 'none';
    if (hudView) hudView.style.display = tab === 'TELEMETRY' ? 'flex' : 'none';
    if (skyControls) skyControls.style.display = tab === 'SKY' ? 'flex' : 'none';

    if (tab === 'SKY' && skyRenderer) {
      skyRenderer.resize();
    } else if (tab === 'TACTICAL' && tacticalMap) {
      tacticalMap.render();
    }
  };

  if (tabSky) tabSky.addEventListener('click', () => switchTab('SKY'));
  if (tabTactical) tabTactical.addEventListener('click', () => switchTab('TACTICAL'));
  if (tabTelemetry) tabTelemetry.addEventListener('click', () => switchTab('TELEMETRY'));

  // --- Sky Renderer Three.js Initialization ---
  if (skyContainer) {
    skyRenderer = new SkyRenderer(skyContainer);
    const ship = simLoop.trajectory.shipState;
    skyRenderer.render({
      simTimeJD: simLoop.clock.simTimeJD,
      shipPos: ship.pos,
      shipVel: ship.vel,
      earthPos: simLoop.earthPos,
      marsPos: simLoop.marsPos,
      phase: ship.phase,
      dt: 0.016,
    });
  }

  // --- Camera Mode Controls & Buttons ---
  const camButtons = document.querySelectorAll('#sky-view-controls .cam-btn[data-mode]');
  const updateCamButtonStyles = (mode: CameraMode, target?: LockTarget) => {
    camButtons.forEach((el) => {
      const btn = el as HTMLButtonElement;
      const btnMode = btn.dataset.mode as CameraMode;
      const btnTarget = btn.dataset.target as LockTarget | undefined;

      if (btnMode === 'TARGET_LOCK') {
        btn.classList.toggle('active', mode === 'TARGET_LOCK' && btnTarget === target);
      } else {
        btn.classList.toggle('active', mode === btnMode);
      }
    });
  };

  camButtons.forEach((el) => {
    const btn = el as HTMLButtonElement;
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode as CameraMode;
      const target = btn.dataset.target as LockTarget | undefined;
      if (skyRenderer && mode) {
        skyRenderer.setCameraMode(mode, target);
        updateCamButtonStyles(mode, target);
      }
    });
  });

  // --- Dust Velocity Streaks Toggle ---
  const streaksBtn = document.getElementById('dust-streaks-btn');
  const updateStreaksButton = (enabled: boolean) => {
    if (!streaksBtn) return;
    if (enabled) {
      streaksBtn.textContent = 'STREAKS: ON';
      streaksBtn.className = 'cam-btn active';
      streaksBtn.title = 'Perceived velocity streaks active (Click for Physically literal [no streaks])';
    } else {
      streaksBtn.textContent = 'LITERAL (NO STREAKS)';
      streaksBtn.className = 'cam-btn';
      streaksBtn.title = 'Physically literal: stationary dust in space frame (Click to enable streaks)';
    }
  };

  if (streaksBtn && skyRenderer) {
    streaksBtn.addEventListener('click', () => {
      if (skyRenderer) {
        const enabled = skyRenderer.toggleStreaks();
        updateStreaksButton(enabled);
      }
    });
  }

  // --- Tactical Map Canvas 2D Initialization ---
  if (mapContainer) {
    tacticalMap = new TacticalMap(mapContainer);
    tacticalMap.updateState({
      earthPos: simLoop.earthPos,
      marsPos: simLoop.marsPos,
      shipPos: simLoop.trajectory.shipState.pos,
      shipVel: simLoop.trajectory.shipState.vel,
      commState: simLoop.comms.state,
      simTimeJD: simLoop.clock.simTimeJD,
      phase: simLoop.trajectory.shipState.phase,
    });
  }

  // Check URL query parameters for deep linking
  const urlParams = new URLSearchParams(window.location.search);
  const qView = urlParams.get('view')?.toUpperCase();
  if (qView === 'TACTICAL' || qView === 'MAP') {
    switchTab('TACTICAL');
  } else if (qView === 'TELEMETRY' || qView === 'HUD') {
    switchTab('TELEMETRY');
  } else {
    switchTab('SKY');
  }

  // --- Left Panel: Multi-View Mission Consoles ---
  const leftPanel = document.getElementById('left-panel');
  if (leftPanel) {
    leftPanel.innerHTML = `
      <div class="left-tabs">
        <button class="left-tab-btn active" data-tab="COMMS" title="Deep-Space DTN Comms Console">📡 DTN</button>
        <button class="left-tab-btn" data-tab="AI" title="Autonomous Advisory & CDSS">🤖 AI</button>
        <button class="left-tab-btn" data-tab="MEM" title="Avionics Memory & SEU Scrubber">💾 MEM</button>
        <button class="left-tab-btn" data-tab="SCENARIOS" title="Guided Mission Scenarios S1-S5">🚀 SCEN</button>
        <button class="left-tab-btn" data-tab="EVAL" title="Automated Verification Suite">📊 EVAL</button>
      </div>
      <div id="left-tab-content" style="flex: 1; height: calc(100% - 32px); overflow: hidden; position: relative;">
        <div id="pane-comms" style="height: 100%;"></div>
        <div id="pane-ai" style="height: 100%; display: none;"></div>
        <div id="pane-mem" style="height: 100%; display: none;"></div>
        <div id="pane-scen" style="height: 100%; display: none;"></div>
        <div id="pane-eval" style="height: 100%; display: none;"></div>
      </div>
    `;

    const paneComms = leftPanel.querySelector('#pane-comms') as HTMLElement;
    const paneAi = leftPanel.querySelector('#pane-ai') as HTMLElement;
    const paneMem = leftPanel.querySelector('#pane-mem') as HTMLElement;
    const paneScen = leftPanel.querySelector('#pane-scen') as HTMLElement;
    const paneEval = leftPanel.querySelector('#pane-eval') as HTMLElement;

    commsConsole = new CommsConsole(paneComms, globalBus, linkModel, dtnSpool, groundSegment);
    aiConsole = new AIConsole(paneAi, globalBus, safetyGate);
    memoryView = new MemoryView(paneMem, globalBus, memoryManager);
    scenarioRunner = new ScenarioRunner(paneScen, globalBus, simLoop, simLoop.subsystems.faultInjector, linkModel, dtnSpool, groundSegment);
    evalSuite = new EvalSuite(paneEval);

    const leftBtns = leftPanel.querySelectorAll('.left-tab-btn');
    const selectLeftTab = (t: string) => {
      leftBtns.forEach(btn => {
        btn.classList.toggle('active', (btn as HTMLElement).dataset.tab === t);
      });
      activeLeftTab = t as any;
      paneComms.style.display = t === 'COMMS' ? 'block' : 'none';
      paneAi.style.display = t === 'AI' ? 'block' : 'none';
      paneMem.style.display = t === 'MEM' ? 'block' : 'none';
      paneScen.style.display = t === 'SCENARIOS' ? 'block' : 'none';
      paneEval.style.display = t === 'EVAL' ? 'block' : 'none';
    };

    leftBtns.forEach((b) => {
      b.addEventListener('click', () => {
        const t = (b as HTMLElement).dataset.tab;
        if (t) selectLeftTab(t);
      });
    });

    const qTab = urlParams.get('tab')?.toUpperCase();
    if (qTab === 'AI') selectLeftTab('AI');
    else if (qTab === 'MEM') selectLeftTab('MEM');
    else if (qTab === 'SCENARIOS' || qTab === 'SCEN') selectLeftTab('SCENARIOS');
    else if (qTab === 'EVAL') selectLeftTab('EVAL');
    else selectLeftTab('COMMS');
  }

  // --- Right Panel: Subsystem Telemetry Panel ---
  const rightPanel = document.getElementById('right-panel');
  if (rightPanel) {
    telemetryPanel = new TelemetryPanel(rightPanel);
  }

  // --- Bottom Panel: Fault Injection Matrix ---
  const bottomPanel = document.getElementById('bottom-panel');
  if (bottomPanel) {
    faultPanel = new FaultPanel(bottomPanel, simLoop.subsystems.faultInjector, globalBus);
  }

  // Wire up telemetry updates to panel & AI models
  globalBus.on('telemetry:update', ({ telemetry, alerts }) => {
    if (telemetryPanel) {
      telemetryPanel.update(telemetry, alerts);
    }

    // Feed real telemetry snapshot into AI Diagnostic & Medical models
    if (aiConsole && telemetry) {
      const loopA = telemetry.get('thermal.loopA.flowRate')?.measured ?? 0.5;
      const dp = telemetry.get('thermal.loopA.pumpSpeed')?.measured ?? 50;
      const acc = telemetry.get('thermal.loopA.accumulatorLevel')?.measured ?? 2500;
      const tout = telemetry.get('thermal.loopA.outletTemp')?.measured ?? 290;
      const tin = telemetry.get('thermal.loopA.inletTemp')?.measured ?? 280;
      const soc = telemetry.get('power.batterySOC')?.measured ?? 0.8;

      aiConsole.diagnose(
        [loopA, dp, acc, tout, tin, soc],
        [
          [0.5, 50, 2500, 290, 280, 0.8],
          [0.48, 48, 2450, 292, 281, 0.82],
          [0.52, 51, 2520, 289, 279, 0.79],
        ]
      );

      aiConsole.assessMedical(
        {
          spO2: telemetry.get('crew.crew1.spo2')?.measured ?? 98,
          heartRate: telemetry.get('crew.crew1.heartRate')?.measured ?? 72,
          respRate: 16,
        },
        {
          ppO2: telemetry.get('eclss.ppO2')?.measured ?? 21.3,
          ppCO2: telemetry.get('eclss.ppCO2')?.measured ?? 0.4,
          cabinPressure: telemetry.get('eclss.cabinPressure')?.measured ?? 101.3,
        }
      );
    }
  });

  // ============================================================================
  // Keyboard Shortcuts: Space = pause, +/- = warp up/down
  // ============================================================================

  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    if (e.code === 'Space') {
      e.preventDefault();
      simLoop.clock.togglePause();
      globalBus.emit('sim:warpChanged', { warp: simLoop.clock.warp, paused: simLoop.clock.paused });
    } else if (e.key === '+' || e.key === '=' || e.code === 'NumpadAdd') {
      e.preventDefault();
      const newWarp = simLoop.clock.warpUp();
      if (simLoop.clock.paused) {
        simLoop.clock.resume();
      }
      globalBus.emit('sim:warpChanged', { warp: newWarp, paused: simLoop.clock.paused });
    } else if (e.key === '-' || e.key === '_' || e.code === 'NumpadSubtract') {
      e.preventDefault();
      const newWarp = simLoop.clock.warpDown();
      globalBus.emit('sim:warpChanged', { warp: newWarp, paused: simLoop.clock.paused });
    } else if (skyRenderer && activeCenterTab === 'SKY') {
      if (e.key === 'f' || e.key === 'F') {
        skyRenderer.setCameraMode('FORWARD');
        updateCamButtonStyles('FORWARD');
      } else if (e.key === 'r' || e.key === 'R') {
        skyRenderer.setCameraMode('RETROGRADE');
        updateCamButtonStyles('RETROGRADE');
      } else if (e.key === 'm' || e.key === 'M') {
        skyRenderer.setCameraMode('TARGET_LOCK', 'MARS');
        updateCamButtonStyles('TARGET_LOCK', 'MARS');
      } else if (e.key === 'e' || e.key === 'E') {
        skyRenderer.setCameraMode('TARGET_LOCK', 'EARTH');
        updateCamButtonStyles('TARGET_LOCK', 'EARTH');
      } else if (e.key === 's' || e.key === 'S') {
        skyRenderer.setCameraMode('TARGET_LOCK', 'SUN');
        updateCamButtonStyles('TARGET_LOCK', 'SUN');
      } else if (e.key === 'l' || e.key === 'L') {
        skyRenderer.setCameraMode('FREE_LOOK');
        updateCamButtonStyles('FREE_LOOK');
      } else if (e.key === 't' || e.key === 'T') {
        const enabled = skyRenderer.toggleStreaks();
        updateStreaksButton(enabled);
      }
    }
  });
}

// ============================================================================
// Application Bootstrap
// ============================================================================

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    setupConsole();
    simLoop.start();
  });
}
