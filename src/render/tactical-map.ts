/**
 * AEGIS TRANSIT — Canvas 2D Tactical Ecliptic Map
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Top-down 2D ecliptic tactical display rendering planetary orbits, vehicle trajectory,
 * line-of-sight communications link, and solar exclusion blackout geometry.
 */

import {
  AU_M,
  BLACKOUT_THETA_DEG,
  EARTH_ELEMENTS,
  J2000_JD,
  MARS_ELEMENTS,
  MARS_SOI_M,
  MU_SUN_AU3D2,
  degToRad,
} from '@sim/constants';
import {
  commDistance,
  isInBlackout,
  lightTimeAU,
  sunEarthShipAngle,
} from '@sim/comms-geometry';
import { propagateKepler } from '@sim/propagate';
import type { CommState, MissionPhase } from '../core/types';
import {
  drawArrow,
  drawBody,
  drawCornerBrackets,
  drawDiamond,
  drawOrbitEllipse,
  formatDistance,
  formatLightTime,
  screenToWorld,
  worldToScreen,
} from './map-utils';

interface HudButton {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  action: () => void;
}

export class TacticalMap {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private container: HTMLElement;
  private width: number;
  private height: number;
  private dpr: number;

  // View state
  private centerX: number; // center of view in AU
  private centerY: number;
  private scale: number; // pixels per AU (with log scaling for zoom)
  private isDragging: boolean;
  private targetFocus: 'SUN' | 'EARTH' | 'MARS' | 'SHIP' | null;

  // Interaction tracking
  private dragStartX: number;
  private dragStartY: number;
  private dragStartCenterX: number;
  private dragStartCenterY: number;
  private cursorScreen: [number, number] | null;
  private hudButtons: HudButton[];
  private hoveredButtonId: string | null;

  // Sim state references (updated each tick)
  private earthPos: [number, number];
  private marsPos: [number, number];
  private shipPos: [number, number];
  private shipVel: [number, number] | null;
  private shipTrail: [number, number][]; // last N positions
  private commState: CommState | null;
  private simTimeJD: number;
  private phase: MissionPhase;
  private predictedTrajectory: [number, number][];

  // Animation & lifecycle
  private resizeObserver: ResizeObserver | null;
  private packetAnimOffset: number;
  private lastAnimTimestamp: number;
  private animFrameId: number | null;

  // Bound event listeners
  private readonly onMouseDown: (e: MouseEvent) => void;
  private readonly onMouseMove: (e: MouseEvent) => void;
  private readonly onMouseUp: (e: MouseEvent) => void;
  private readonly onMouseLeave: (e: MouseEvent) => void;
  private readonly onWheel: (e: WheelEvent) => void;
  private readonly onDblClick: (e: MouseEvent) => void;
  private readonly onKeyDown: (e: KeyboardEvent) => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'tactical-map-canvas';
    this.canvas.tabIndex = 0; // Enables keyboard event capture
    this.canvas.style.display = 'block';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.outline = 'none';
    this.canvas.style.cursor = 'crosshair';

    this.container.appendChild(this.canvas);

    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('TacticalMap: Failed to acquire 2D canvas rendering context');
    }
    this.ctx = ctx;

    // View state initialization
    this.centerX = 0;
    this.centerY = 0;
    this.scale = 200; // 200 px per AU baseline
    this.isDragging = false;
    this.targetFocus = null;

    this.dragStartX = 0;
    this.dragStartY = 0;
    this.dragStartCenterX = 0;
    this.dragStartCenterY = 0;
    this.cursorScreen = null;
    this.hudButtons = [];
    this.hoveredButtonId = null;

    // Sim state initialization
    this.simTimeJD = J2000_JD;
    this.earthPos = [1.0, 0.0];
    this.marsPos = [1.524, 0.0];
    this.shipPos = [1.0, 0.0];
    this.shipVel = null;
    this.shipTrail = [[1.0, 0.0]];
    this.commState = null;
    this.phase = 'Cruise';
    this.predictedTrajectory = [];

    // Animation & sizing
    this.packetAnimOffset = 0;
    this.lastAnimTimestamp = performance.now();
    this.animFrameId = null;

    const rect = this.container.getBoundingClientRect();
    this.width = Math.max(rect.width || 800, 100);
    this.height = Math.max(rect.height || 600, 100);
    this.dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

    this.updateCanvasDimensions();
    this.updatePredictedTrajectory();

    // Event listener binding
    this.onMouseDown = this.handleMouseDown.bind(this);
    this.onMouseMove = this.handleMouseMove.bind(this);
    this.onMouseUp = this.handleMouseUp.bind(this);
    this.onMouseLeave = this.handleMouseLeave.bind(this);
    this.onWheel = this.handleWheel.bind(this);
    this.onDblClick = this.handleDblClick.bind(this);
    this.onKeyDown = this.handleKeyDown.bind(this);

    this.attachEventListeners();

    // Setup ResizeObserver
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateCanvasDimensions();
        this.render();
      });
      this.resizeObserver.observe(this.container);
    } else {
      this.resizeObserver = null;
    }

    // Initial render
    this.render();
  }

  // ============================================================================
  // State Updates & Trajectory Prediction
  // ============================================================================

  /**
   * Updates tactical map state from the simulation loop.
   */
  public updateState(state: {
    earthPos: [number, number];
    marsPos: [number, number];
    shipPos: [number, number];
    commState: CommState;
    simTimeJD: number;
    phase: MissionPhase;
    shipVel?: [number, number];
    predictedTrajectory?: [number, number][];
  }): void {
    const prevPos = this.shipPos;
    const prevJD = this.simTimeJD;

    this.earthPos = state.earthPos;
    this.marsPos = state.marsPos;
    this.shipPos = state.shipPos;
    this.commState = state.commState;
    this.simTimeJD = state.simTimeJD;
    this.phase = state.phase;

    // Velocity estimation if not explicitly passed
    if (state.shipVel) {
      this.shipVel = state.shipVel;
    } else if (state.simTimeJD !== prevJD) {
      const dtDays = state.simTimeJD - prevJD;
      if (Math.abs(dtDays) > 1e-7) {
        this.shipVel = [
          (state.shipPos[0] - prevPos[0]) / dtDays,
          (state.shipPos[1] - prevPos[1]) / dtDays,
        ];
      }
    }

    // Ship trail management (keep last 200 distinct points)
    if (this.shipTrail.length === 0) {
      this.shipTrail.push([...state.shipPos]);
    } else {
      const last = this.shipTrail[this.shipTrail.length - 1];
      const distSq =
        Math.pow(state.shipPos[0] - last[0], 2) + Math.pow(state.shipPos[1] - last[1], 2);
      if (distSq > 1e-8) {
        this.shipTrail.push([...state.shipPos]);
        if (this.shipTrail.length > 200) {
          this.shipTrail.shift();
        }
      }
    }

    // Predicted trajectory handling
    if (state.predictedTrajectory && state.predictedTrajectory.length > 0) {
      this.predictedTrajectory = state.predictedTrajectory;
    } else {
      this.updatePredictedTrajectory();
    }

    // Camera follow mode
    if (this.targetFocus) {
      switch (this.targetFocus) {
        case 'SUN':
          this.centerX = 0;
          this.centerY = 0;
          break;
        case 'EARTH':
          this.centerX = this.earthPos[0];
          this.centerY = this.earthPos[1];
          break;
        case 'MARS':
          this.centerX = this.marsPos[0];
          this.centerY = this.marsPos[1];
          break;
        case 'SHIP':
          this.centerX = this.shipPos[0];
          this.centerY = this.shipPos[1];
          break;
      }
    }
  }

  /**
   * Generates Keplerian conic predicted trajectory forward from current ship state.
   */
  private updatePredictedTrajectory(): void {
    let v0 = this.shipVel;
    if (!v0 || (v0[0] === 0 && v0[1] === 0)) {
      // Nominal transfer orbit velocity estimate based on current heliocentric radius
      const r = Math.hypot(this.shipPos[0], this.shipPos[1]);
      const rSafe = Math.max(0.5, r);
      const aTransfer = 1.28; // Earth-Mars Hohmann semi-major axis
      const speed = Math.sqrt(
        Math.max(1e-8, MU_SUN_AU3D2 * (2 / rSafe - 1 / aTransfer))
      );
      v0 = [-speed * (this.shipPos[1] / rSafe), speed * (this.shipPos[0] / rSafe)];
    }

    const trajectory: [number, number][] = [];
    const totalDays = 220;
    const steps = 60;
    const dt = totalDays / steps;

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      try {
        const state = propagateKepler(this.shipPos, v0, t, MU_SUN_AU3D2);
        trajectory.push(state.r);
      } catch {
        break;
      }
    }

    this.predictedTrajectory = trajectory;
  }

  // ============================================================================
  // Canvas Sizing & Coordinate Projections
  // ============================================================================

  private updateCanvasDimensions(): void {
    const rect = this.container.getBoundingClientRect();
    this.width = Math.max(rect.width || 800, 100);
    this.height = Math.max(rect.height || 600, 100);
    this.dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  /**
   * Projects heliocentric world coordinates (AU) to canvas screen pixels.
   */
  public toScreen(worldX: number, worldY: number): [number, number] {
    return worldToScreen(
      worldX,
      worldY,
      this.centerX,
      this.centerY,
      this.scale,
      this.width,
      this.height
    );
  }

  /**
   * Inverse projects canvas screen pixels to heliocentric world coordinates (AU).
   */
  public toWorld(screenX: number, screenY: number): [number, number] {
    return screenToWorld(
      screenX,
      screenY,
      this.centerX,
      this.centerY,
      this.scale,
      this.width,
      this.height
    );
  }

  // ============================================================================
  // Main Render Routine
  // ============================================================================

  /**
   * Renders the complete tactical map frame.
   */
  public render(): void {
    // Advance packet animation
    const now = performance.now();
    const dtAnim = Math.min(0.1, (now - this.lastAnimTimestamp) / 1000);
    this.lastAnimTimestamp = now;
    this.packetAnimOffset = (this.packetAnimOffset + dtAnim * 0.45) % 1.0;

    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // 1. Background fill
    ctx.fillStyle = '#0a0e14';
    ctx.fillRect(0, 0, w, h);

    // Subtle radial glow centered at Sun
    const [sunSx, sunSy] = this.toScreen(0, 0);
    const sunGrad = ctx.createRadialGradient(
      sunSx,
      sunSy,
      10,
      sunSx,
      sunSy,
      Math.max(w, h) * 0.8
    );
    sunGrad.addColorStop(0, 'rgba(0, 229, 255, 0.04)');
    sunGrad.addColorStop(0.5, 'rgba(10, 14, 20, 0.01)');
    sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Cartesian coordinate grid & Range Rings
    this.renderGrid(ctx, sunSx, sunSy);
    this.renderRangeRings(ctx, sunSx, sunSy);

    // 3. Keplerian Orbits (Earth & Mars)
    this.renderOrbits(ctx);

    // 4. Blackout exclusion cone from Earth through Sun
    this.renderBlackoutCone(ctx);

    // 5. Predicted Trajectory (Keplerian conic arc)
    this.renderPredictedTrajectory(ctx);

    // 6. Ship Historical Trail
    this.renderShipTrail(ctx);

    // 7. Mars SOI (Sphere of Influence, visible when zoomed in)
    this.renderMarsSOI(ctx);

    // 8. Communication line & packet glyphs
    this.renderCommsLine(ctx);

    // 9. Celestial Bodies & Spacecraft
    this.renderBodies(ctx, sunSx, sunSy);

    // 10. HUD Overlays (Top bar, buttons, hover readout)
    this.renderHUD(ctx);
  }

  // ============================================================================
  // Sub-Renderers
  // ============================================================================

  private renderGrid(
    ctx: CanvasRenderingContext2D,
    sunSx: number,
    sunSy: number
  ): void {
    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.04)';

    // Sun cardinal axes
    ctx.beginPath();
    ctx.moveTo(0, sunSy);
    ctx.lineTo(this.width, sunSy);
    ctx.moveTo(sunSx, 0);
    ctx.lineTo(sunSx, this.height);
    ctx.stroke();

    // Subtle origin crosshair marker
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(sunSx - 8, sunSy);
    ctx.lineTo(sunSx + 8, sunSy);
    ctx.moveTo(sunSx, sunSy - 8);
    ctx.lineTo(sunSx, sunSy + 8);
    ctx.stroke();

    ctx.restore();
  }

  private renderRangeRings(
    ctx: CanvasRenderingContext2D,
    sunSx: number,
    sunSy: number
  ): void {
    const radiiAU = [0.5, 1.0, 1.5, 2.0, 2.5];

    ctx.save();
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 5]);

    ctx.font = '9px "Courier New", Consolas, monospace';
    ctx.fillStyle = 'rgba(0, 229, 255, 0.35)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';

    for (const rAU of radiiAU) {
      const screenRadius = rAU * this.scale;
      if (screenRadius < 8) continue;

      ctx.beginPath();
      ctx.arc(sunSx, sunSy, screenRadius, 0, 2 * Math.PI);
      ctx.stroke();

      // Label at ~35 degrees along ring
      const labelAngle = degToRad(35);
      const lx = sunSx + screenRadius * Math.cos(labelAngle);
      const ly = sunSy - screenRadius * Math.sin(labelAngle);

      if (lx >= 0 && lx <= this.width && ly >= 0 && ly <= this.height) {
        ctx.fillText(`${rAU.toFixed(1)} AU`, lx + 3, ly - 2);
      }
    }

    ctx.restore();
  }

  private renderOrbits(ctx: CanvasRenderingContext2D): void {
    const toScreenFn = (wx: number, wy: number) => this.toScreen(wx, wy);

    // Earth Orbit (Cyan/Blue dashed ellipse)
    drawOrbitEllipse(
      ctx,
      EARTH_ELEMENTS.a,
      EARTH_ELEMENTS.e,
      EARTH_ELEMENTS.wbar,
      'rgba(0, 180, 255, 0.4)',
      [4, 4],
      toScreenFn,
      true
    );

    // Mars Orbit (Red/Rust dashed ellipse)
    drawOrbitEllipse(
      ctx,
      MARS_ELEMENTS.a,
      MARS_ELEMENTS.e,
      MARS_ELEMENTS.wbar,
      'rgba(255, 90, 80, 0.45)',
      [4, 4],
      toScreenFn,
      true
    );
  }

  private renderBlackoutCone(ctx: CanvasRenderingContext2D): void {
    // Vector from Earth to Sun (Sun is at [0, 0])
    const esX = -this.earthPos[0];
    const esY = -this.earthPos[1];
    const distES = Math.hypot(esX, esY);
    if (distES < 1e-6) return;

    const phi = Math.atan2(esY, esX);
    const thetaRad = degToRad(BLACKOUT_THETA_DEG);
    const coneLengthAU = 3.6; // Reaches past Mars aphelion

    const [vSx, vSy] = this.toScreen(this.earthPos[0], this.earthPos[1]);
    const r1X = this.earthPos[0] + coneLengthAU * Math.cos(phi - thetaRad);
    const r1Y = this.earthPos[1] + coneLengthAU * Math.sin(phi - thetaRad);
    const r2X = this.earthPos[0] + coneLengthAU * Math.cos(phi + thetaRad);
    const r2Y = this.earthPos[1] + coneLengthAU * Math.sin(phi + thetaRad);

    const [r1Sx, r1Sy] = this.toScreen(r1X, r1Y);
    const [r2Sx, r2Sy] = this.toScreen(r2X, r2Y);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(vSx, vSy);
    ctx.lineTo(r1Sx, r1Sy);
    ctx.lineTo(r2Sx, r2Sy);
    ctx.closePath();

    ctx.fillStyle = 'rgba(255, 171, 0, 0.10)';
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 171, 0, 0.35)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();

    // Solar Exclusion Label
    const midL = 1.6;
    const [lblSx, lblSy] = this.toScreen(
      this.earthPos[0] + midL * Math.cos(phi),
      this.earthPos[1] + midL * Math.sin(phi)
    );

    ctx.font = '9px "Courier New", Consolas, monospace';
    ctx.fillStyle = 'rgba(255, 171, 0, 0.65)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.setLineDash([]);
    ctx.fillText('SOLAR EXCLUSION CONE (±2.0°)', lblSx, lblSy);

    ctx.restore();
  }

  private renderPredictedTrajectory(ctx: CanvasRenderingContext2D): void {
    if (this.predictedTrajectory.length < 2) return;

    ctx.save();
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);

    ctx.beginPath();
    for (let i = 0; i < this.predictedTrajectory.length; i++) {
      const [wx, wy] = this.predictedTrajectory[i];
      const [sx, sy] = this.toScreen(wx, wy);
      if (i === 0) {
        ctx.moveTo(sx, sy);
      } else {
        ctx.lineTo(sx, sy);
      }
    }
    ctx.stroke();

    // Directional chevron marker at the midpoint of predicted trajectory
    const midIdx = Math.floor(this.predictedTrajectory.length / 2);
    if (midIdx > 0 && midIdx < this.predictedTrajectory.length) {
      const [p1x, p1y] = this.toScreen(
        this.predictedTrajectory[midIdx - 1][0],
        this.predictedTrajectory[midIdx - 1][1]
      );
      const [p2x, p2y] = this.toScreen(
        this.predictedTrajectory[midIdx][0],
        this.predictedTrajectory[midIdx][1]
      );
      drawArrow(ctx, p1x, p1y, p2x, p2y, 'rgba(0, 229, 255, 0.8)', 6);
    }

    ctx.restore();
  }

  private renderShipTrail(ctx: CanvasRenderingContext2D): void {
    if (this.shipTrail.length < 2) return;

    ctx.save();
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);

    const total = this.shipTrail.length;
    for (let i = 0; i < total - 1; i++) {
      const [x1, y1] = this.toScreen(this.shipTrail[i][0], this.shipTrail[i][1]);
      const [x2, y2] = this.toScreen(this.shipTrail[i + 1][0], this.shipTrail[i + 1][1]);

      // Fading alpha: older = dimmer (0.05 -> 0.75)
      const alpha = 0.05 + 0.7 * (i / total);
      ctx.strokeStyle = `rgba(0, 229, 255, ${alpha.toFixed(3)})`;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderMarsSOI(ctx: CanvasRenderingContext2D): void {
    const soiAU = MARS_SOI_M / AU_M;
    const soiScreenRadius = soiAU * this.scale;

    // Draw when zoomed in enough to resolve the sphere of influence
    if (soiScreenRadius >= 6) {
      const [mSx, mSy] = this.toScreen(this.marsPos[0], this.marsPos[1]);

      ctx.save();
      ctx.strokeStyle = 'rgba(255, 80, 80, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      ctx.beginPath();
      ctx.arc(mSx, mSy, soiScreenRadius, 0, 2 * Math.PI);
      ctx.stroke();

      // Label
      ctx.font = '9px "Courier New", Consolas, monospace';
      ctx.fillStyle = 'rgba(255, 120, 100, 0.85)';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.setLineDash([]);
      ctx.fillText('SOI', mSx + soiScreenRadius + 4, mSy);

      ctx.restore();
    }
  }

  private renderCommsLine(ctx: CanvasRenderingContext2D): void {
    const [eSx, eSy] = this.toScreen(this.earthPos[0], this.earthPos[1]);
    const [sSx, sSy] = this.toScreen(this.shipPos[0], this.shipPos[1]);

    const distAU = commDistance(this.shipPos, this.earthPos);
    const thetaDeg = sunEarthShipAngle(this.shipPos, this.earthPos);
    const inBlackout =
      this.commState?.linkState === 'BLACKOUT' || isInBlackout(thetaDeg);
    const linkState =
      this.commState?.linkState ?? (inBlackout ? 'BLACKOUT' : 'NOMINAL');
    const owltSec = this.commState?.oneWayLightTimeSec ?? lightTimeAU(distAU);

    // Color based on link state
    let lineColor = '#00e5ff'; // Nominal
    let lineDash: number[] = [];

    switch (linkState) {
      case 'NOMINAL':
        lineColor = '#00e5ff';
        lineDash = [];
        break;
      case 'DEGRADED':
        lineColor = '#ffab00';
        lineDash = [6, 3];
        break;
      case 'BLACKOUT':
        lineColor = '#ff1744';
        lineDash = [4, 4];
        break;
      case 'OVERRIDE':
        lineColor = '#e040fb';
        lineDash = [2, 2];
        break;
    }

    ctx.save();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.2;
    ctx.setLineDash(lineDash);

    // Main communication ray
    ctx.beginPath();
    ctx.moveTo(sSx, sSy);
    ctx.lineTo(eSx, eSy);
    ctx.stroke();

    // Moving packet glyphs (only if link is not in hard blackout)
    if (linkState !== 'BLACKOUT') {
      const numPackets = 4;
      for (let k = 0; k < numPackets; k++) {
        const u = (this.packetAnimOffset + k / numPackets) % 1.0;
        // Ship is origin (u = 0), Earth is receiver (u = 1)
        const px = sSx + u * (eSx - sSx);
        const py = sSy + u * (eSy - sSy);

        ctx.fillStyle = lineColor;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, 2 * Math.PI);
        ctx.fill();

        // Subtle glow halo
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(px, py, 1.2, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    // Midpoint Comms Link Badge
    const midX = (sSx + eSx) / 2;
    const midY = (sSy + eSy) / 2;
    const labelText = `OWLT: ${formatLightTime(owltSec)} [${linkState}]`;

    ctx.font = '10px "Courier New", Consolas, monospace';
    const metrics = ctx.measureText(labelText);
    const badgeW = metrics.width + 12;
    const badgeH = 16;
    const bx = midX - badgeW / 2;
    const by = midY - badgeH / 2;

    ctx.fillStyle = 'rgba(10, 14, 20, 0.85)';
    ctx.fillRect(bx, by, badgeW, badgeH);

    drawCornerBrackets(ctx, bx, by, badgeW, badgeH, lineColor, 3);

    ctx.fillStyle = lineColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.setLineDash([]);
    ctx.fillText(labelText, midX, midY);

    ctx.restore();
  }

  private renderBodies(
    ctx: CanvasRenderingContext2D,
    sunSx: number,
    sunSy: number
  ): void {
    // 1. Sun at Origin (yellow circle with glow)
    drawBody(ctx, sunSx, sunSy, 7, '#ffeb3b', 'SUN', true);

    // 2. Earth (blue circle)
    const [eSx, eSy] = this.toScreen(this.earthPos[0], this.earthPos[1]);
    drawBody(ctx, eSx, eSy, 5, '#29b6f6', 'EARTH', true);

    // 3. Mars (red/rust circle)
    const [mSx, mSy] = this.toScreen(this.marsPos[0], this.marsPos[1]);
    drawBody(ctx, mSx, mSy, 4.5, '#ff5722', 'MARS', true);

    // 4. Spacecraft (cyan diamond with orientation pointer and reticle)
    const [sSx, sSy] = this.toScreen(this.shipPos[0], this.shipPos[1]);

    // Outer target bracket
    drawCornerBrackets(ctx, sSx - 11, sSy - 11, 22, 22, '#00e5ff', 4);

    // Ship diamond glyph
    drawDiamond(ctx, sSx, sSy, 5, '#00e5ff', true);

    // Heading indicator if velocity is defined
    if (this.shipVel) {
      const vAngle = Math.atan2(-this.shipVel[1], this.shipVel[0]);
      const p1x = sSx;
      const p1y = sSy;
      const p2x = sSx + 14 * Math.cos(vAngle);
      const p2y = sSy + 14 * Math.sin(vAngle);
      drawArrow(ctx, p1x, p1y, p2x, p2y, '#00e5ff', 5);
    }

    // Ship Label Badge
    ctx.save();
    ctx.font = '10px "Courier New", Consolas, monospace';
    ctx.fillStyle = '#e0e6ed';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';

    const sLabel = 'AEGIS-1';
    const sMetrics = ctx.measureText(sLabel);
    const slx = sSx + 12;
    const sly = sSy - 8;

    ctx.fillStyle = 'rgba(10, 14, 20, 0.85)';
    ctx.fillRect(slx - 3, sly - 7, sMetrics.width + 6, 14);
    drawCornerBrackets(ctx, slx - 3, sly - 7, sMetrics.width + 6, 14, '#00e5ff', 3);

    ctx.fillStyle = '#00e5ff';
    ctx.fillText(sLabel, slx, sly);
    ctx.restore();
  }

  private renderHUD(ctx: CanvasRenderingContext2D): void {
    const w = this.width;
    const h = this.height;

    ctx.save();

    // --- Top-Left HUD Info ---
    ctx.font = '11px "Courier New", Consolas, monospace';
    ctx.fillStyle = '#00e5ff';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillText('AEGIS TRANSIT // TACTICAL ECLIPTIC DISPLAY', 14, 12);

    ctx.font = '10px "Courier New", Consolas, monospace';
    ctx.fillStyle = '#8899aa';
    ctx.fillText(
      `PHASE: ${this.phase.toUpperCase()} | SCALE: ${this.scale.toFixed(0)} px/AU`,
      14,
      28
    );
    ctx.fillText(`SIM TIME: JD ${this.simTimeJD.toFixed(2)}`, 14, 42);

    // --- Top-Right Target Buttons ---
    this.renderButtons(ctx, w);

    // --- Bottom-Left Hover Readout ---
    if (this.cursorScreen) {
      this.renderHoverReadout(ctx);
    } else {
      // Prompt helper
      ctx.font = '9px "Courier New", Consolas, monospace';
      ctx.fillStyle = 'rgba(136, 153, 170, 0.5)';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(
        'DRAG TO PAN | WHEEL TO ZOOM | DBL-CLICK TO CENTER | +/- TO SCALE',
        14,
        h - 12
      );
    }

    ctx.restore();
  }

  private renderButtons(ctx: CanvasRenderingContext2D, canvasW: number): void {
    const btnConfigs = [
      { id: 'SUN', label: 'SUN', action: () => this.focusOn('SUN') },
      { id: 'EARTH', label: 'EARTH', action: () => this.focusOn('EARTH') },
      { id: 'MARS', label: 'MARS', action: () => this.focusOn('MARS') },
      { id: 'SHIP', label: 'SHIP', action: () => this.focusOn('SHIP') },
      { id: 'RESET', label: 'RESET', action: () => this.resetView() },
    ];

    const btnW = 54;
    const btnH = 20;
    const gap = 6;
    const totalW = btnConfigs.length * btnW + (btnConfigs.length - 1) * gap;
    const startX = canvasW - totalW - 14;
    const startY = 12;

    this.hudButtons = [];

    ctx.font = '10px "Courier New", Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    btnConfigs.forEach((cfg, index) => {
      const bx = startX + index * (btnW + gap);
      const by = startY;

      this.hudButtons.push({
        id: cfg.id,
        label: cfg.label,
        x: bx,
        y: by,
        w: btnW,
        h: btnH,
        action: cfg.action,
      });

      const isHovered = this.hoveredButtonId === cfg.id;
      const isActiveFocus = this.targetFocus === cfg.id;

      ctx.fillStyle = isActiveFocus
        ? 'rgba(0, 229, 255, 0.3)'
        : isHovered
        ? 'rgba(0, 229, 255, 0.15)'
        : 'rgba(10, 14, 20, 0.75)';
      ctx.fillRect(bx, by, btnW, btnH);

      const strokeColor = isActiveFocus
        ? '#00e5ff'
        : isHovered
        ? '#00e5ff'
        : 'rgba(0, 229, 255, 0.3)';
      drawCornerBrackets(ctx, bx, by, btnW, btnH, strokeColor, 3);

      ctx.fillStyle = isActiveFocus
        ? '#ffffff'
        : isHovered
        ? '#00e5ff'
        : '#8899aa';
      ctx.fillText(cfg.label, bx + btnW / 2, by + btnH / 2);
    });
  }

  private renderHoverReadout(ctx: CanvasRenderingContext2D): void {
    if (!this.cursorScreen) return;

    const [cursorX, cursorY] = this.cursorScreen;
    const [worldX, worldY] = this.toWorld(cursorX, cursorY);

    const dSun = Math.hypot(worldX, worldY);
    const dEarth = Math.hypot(worldX - this.earthPos[0], worldY - this.earthPos[1]);
    const dMars = Math.hypot(worldX - this.marsPos[0], worldY - this.marsPos[1]);
    const dShip = Math.hypot(worldX - this.shipPos[0], worldY - this.shipPos[1]);
    const ltEarth = lightTimeAU(dEarth);

    const boxW = 240;
    const boxH = 92;
    const bx = 14;
    const by = this.height - boxH - 14;

    ctx.fillStyle = 'rgba(10, 14, 20, 0.9)';
    ctx.fillRect(bx, by, boxW, boxH);
    drawCornerBrackets(ctx, bx, by, boxW, boxH, '#00e5ff', 4);

    ctx.font = '10px "Courier New", Consolas, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    ctx.fillStyle = '#00e5ff';
    ctx.fillText('[ TACTICAL READOUT ]', bx + 8, by + 8);

    ctx.fillStyle = '#e0e6ed';
    const signX = worldX >= 0 ? '+' : '';
    const signY = worldY >= 0 ? '+' : '';
    ctx.fillText(
      `CURSOR: ${signX}${worldX.toFixed(3)}, ${signY}${worldY.toFixed(3)} AU`,
      bx + 8,
      by + 24
    );

    ctx.fillStyle = '#8899aa';
    ctx.fillText(`SUN   : ${formatDistance(dSun)}`, bx + 8, by + 38);
    ctx.fillText(
      `EARTH : ${formatDistance(dEarth)} (OWLT: ${formatLightTime(ltEarth)})`,
      bx + 8,
      by + 52
    );
    ctx.fillText(
      `MARS  : ${formatDistance(dMars)} | SHIP: ${formatDistance(dShip)}`,
      bx + 8,
      by + 66
    );
  }

  // ============================================================================
  // User Interaction & Camera Controls
  // ============================================================================

  private attachEventListeners(): void {
    this.canvas.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    this.canvas.addEventListener('mouseleave', this.onMouseLeave);
    this.canvas.addEventListener('wheel', this.onWheel, { passive: false });
    this.canvas.addEventListener('dblclick', this.onDblClick);
    this.canvas.addEventListener('keydown', this.onKeyDown);
  }

  private handleMouseDown(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Check HUD button clicks
    for (const btn of this.hudButtons) {
      if (
        mx >= btn.x &&
        mx <= btn.x + btn.w &&
        my >= btn.y &&
        my <= btn.y + btn.h
      ) {
        btn.action();
        this.render();
        return;
      }
    }

    this.isDragging = true;
    this.targetFocus = null; // Dragging disengages tracking
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.dragStartCenterX = this.centerX;
    this.dragStartCenterY = this.centerY;
  }

  private handleMouseMove(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Check button hovers
    let anyButtonHovered = false;
    for (const btn of this.hudButtons) {
      if (
        mx >= btn.x &&
        mx <= btn.x + btn.w &&
        my >= btn.y &&
        my <= btn.y + btn.h
      ) {
        this.hoveredButtonId = btn.id;
        anyButtonHovered = true;
        this.canvas.style.cursor = 'pointer';
        break;
      }
    }
    if (!anyButtonHovered) {
      this.hoveredButtonId = null;
      this.canvas.style.cursor = this.isDragging ? 'grabbing' : 'crosshair';
    }

    if (this.isDragging) {
      const dx = (e.clientX - this.dragStartX) / this.scale;
      const dy = (e.clientY - this.dragStartY) / this.scale;
      this.centerX = this.dragStartCenterX - dx;
      this.centerY = this.dragStartCenterY + dy;
      this.render();
    } else {
      if (mx >= 0 && mx <= this.width && my >= 0 && my <= this.height) {
        this.cursorScreen = [mx, my];
      } else {
        this.cursorScreen = null;
      }
      this.render();
    }
  }

  private handleMouseUp(): void {
    this.isDragging = false;
    this.canvas.style.cursor = 'crosshair';
  }

  private handleMouseLeave(): void {
    this.cursorScreen = null;
    this.render();
  }

  private handleWheel(e: WheelEvent): void {
    e.preventDefault();

    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const [worldAnchorX, worldAnchorY] = this.toWorld(mx, my);

    // Smooth logarithmic zoom
    const zoomFactor = Math.exp(-e.deltaY * 0.0015);
    const minScale = 15;
    const maxScale = 500_000;
    const newScale = Math.max(minScale, Math.min(maxScale, this.scale * zoomFactor));

    // Re-anchor view so cursor world position stays under cursor screen position
    this.centerX = worldAnchorX - (mx - this.width / 2) / newScale;
    this.centerY = worldAnchorY + (my - this.height / 2) / newScale;
    this.scale = newScale;

    this.render();
  }

  private handleDblClick(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Check proximity to bodies (within 25 screen pixels)
    const [sunSx, sunSy] = this.toScreen(0, 0);
    const [eSx, eSy] = this.toScreen(this.earthPos[0], this.earthPos[1]);
    const [mSx, mSy] = this.toScreen(this.marsPos[0], this.marsPos[1]);
    const [sSx, sSy] = this.toScreen(this.shipPos[0], this.shipPos[1]);

    const threshold = 25;

    if (Math.hypot(mx - sunSx, my - sunSy) < threshold) {
      this.focusOn('SUN');
    } else if (Math.hypot(mx - eSx, my - eSy) < threshold) {
      this.focusOn('EARTH');
    } else if (Math.hypot(mx - mSx, my - mSy) < threshold) {
      this.focusOn('MARS');
    } else if (Math.hypot(mx - sSx, my - sSy) < threshold) {
      this.focusOn('SHIP');
    } else {
      // Center on clicked world coordinate
      const [wx, wy] = this.toWorld(mx, my);
      this.centerX = wx;
      this.centerY = wy;
      this.targetFocus = null;
    }

    this.render();
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const panStepAU = 50 / this.scale;

    switch (e.key) {
      case 'ArrowLeft':
        this.centerX -= panStepAU;
        this.targetFocus = null;
        this.render();
        break;
      case 'ArrowRight':
        this.centerX += panStepAU;
        this.targetFocus = null;
        this.render();
        break;
      case 'ArrowUp':
        this.centerY += panStepAU;
        this.targetFocus = null;
        this.render();
        break;
      case 'ArrowDown':
        this.centerY -= panStepAU;
        this.targetFocus = null;
        this.render();
        break;
      case '+':
      case '=':
        this.scale = Math.min(500_000, this.scale * 1.25);
        this.render();
        break;
      case '-':
      case '_':
        this.scale = Math.max(15, this.scale / 1.25);
        this.render();
        break;
      case '0':
      case 'r':
      case 'R':
        this.resetView();
        break;
    }
  }

  // ============================================================================
  // Public Control APIs
  // ============================================================================

  /**
   * Smoothly focuses the camera on a named body or craft.
   */
  public focusOn(target: 'SUN' | 'EARTH' | 'MARS' | 'SHIP'): void {
    this.targetFocus = target;
    switch (target) {
      case 'SUN':
        this.centerX = 0;
        this.centerY = 0;
        break;
      case 'EARTH':
        this.centerX = this.earthPos[0];
        this.centerY = this.earthPos[1];
        break;
      case 'MARS':
        this.centerX = this.marsPos[0];
        this.centerY = this.marsPos[1];
        break;
      case 'SHIP':
        this.centerX = this.shipPos[0];
        this.centerY = this.shipPos[1];
        break;
    }
    this.render();
  }

  /**
   * Resets camera center to the origin (Sun) and default scale.
   */
  public resetView(): void {
    this.centerX = 0;
    this.centerY = 0;
    this.scale = 200;
    this.targetFocus = null;
    this.render();
  }

  /**
   * Explicitly sets camera center in AU.
   */
  public setCenter(x: number, y: number): void {
    this.centerX = x;
    this.centerY = y;
    this.targetFocus = null;
    this.render();
  }

  /**
   * Explicitly sets camera zoom scale in pixels per AU.
   */
  public setScale(scale: number): void {
    this.scale = Math.max(15, Math.min(500_000, scale));
    this.render();
  }

  public getCenter(): [number, number] {
    return [this.centerX, this.centerY];
  }

  public getScale(): number {
    return this.scale;
  }

  /**
   * Releases canvas DOM, animation loops, and event listeners.
   */
  public destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    this.canvas.removeEventListener('mouseleave', this.onMouseLeave);
    this.canvas.removeEventListener('wheel', this.onWheel);
    this.canvas.removeEventListener('dblclick', this.onDblClick);
    this.canvas.removeEventListener('keydown', this.onKeyDown);

    if (this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
    }
  }
}
