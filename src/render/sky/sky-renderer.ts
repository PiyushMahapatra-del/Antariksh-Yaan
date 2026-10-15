/**
 * AEGIS TRANSIT — Main Sky Scene Renderer
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Central Three.js WebGL scene for immersive deep-space transit visualization.
 * Incorporates:
 * - 9,000+ procedural stars with blackbody coloring and twinkle shader
 * - Procedural Milky Way band with equirectangular fbm canvas and physical galactic tilt
 * - 1,500 drifting near-field dust particles with true motion parallax and velocity streak toggle
 * - Physical Sun with real angular size 2*atan(R_sun / d), HDR corona, and optical flares
 * - Procedural Earth & Mars with 3D fBm surface textures, real Sun phase lighting, limb darkening, and beacon cross-fading
 * - Multi-mode camera controller (FORWARD, RETROGRADE, TARGET_LOCK, FREE_LOOK) with slerp transitions
 * - Off-screen edge indicators for celestial bodies outside the viewport
 * - UnrealBloomPass post-processing bloom
 * - Responsive ResizeObserver and adaptive device pixel ratio (capped at 2.0)
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

import { StarField } from './stars';
import { MilkyWayBand } from './milky-way';
import { DustField } from './dust';
import { SunObject } from './sun';
import { PlanetBody } from './planets';
import { CameraController } from './camera';
import { SkyEffects } from './effects';
import type {
  SkySimState,
  SimState,
  CameraMode,
  LockTarget,
  OffscreenIndicator,
} from './types';

/** Background space color matching CSS variable --bg-primary (#0a0e14) */
export const SPACE_BG_COLOR = 0x0a0e14;

export class SkyRenderer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer | null = null;
  private composer: EffectComposer | null = null;

  // Visual layers
  private stars: StarField;
  private milkyWay: MilkyWayBand;
  private dust: DustField;
  private sun: SunObject;
  private earthBody: PlanetBody;
  private marsBody: PlanetBody;

  // Camera & Effects
  private cameraController: CameraController;
  private effects: SkyEffects;

  // DOM & Sizing
  private container: HTMLElement;
  private resizeObserver: ResizeObserver | null = null;
  private lastRenderTime: number = 0;
  private indicatorOverlay: HTMLDivElement | null = null;
  private lastState: SkySimState | null = null;

  /**
   * Initializes the Three.js WebGL sky renderer within the specified DOM container.
   * 
   * @param container DOM element hosting the WebGL canvas
   */
  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(SPACE_BG_COLOR);

    // 2. Camera: PerspectiveCamera (FOV 60, near 0.001, far 10000)
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;
    this.camera = new THREE.PerspectiveCamera(60, width / Math.max(1, height), 0.001, 10000.0);
    this.camera.position.set(0, 0, 0);

    // 3. WebGL2 Renderer with adaptive DPR (capped at 2.0)
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1.0, 2.0) : 1.0;

    try {
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
      this.renderer.setPixelRatio(dpr);
      this.renderer.setSize(width, height);
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.0;

      const canvas = this.renderer.domElement;
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';

      this.container.appendChild(canvas);

      // 4. EffectComposer for UnrealBloomPass post-processing
      this.composer = new EffectComposer(this.renderer);
      const renderPass = new RenderPass(this.scene, this.camera);
      this.composer.addPass(renderPass);

      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(width, height),
        0.75, // strength
        0.35, // radius
        0.80  // threshold
      );
      this.composer.addPass(bloomPass);

      const outputPass = new OutputPass();
      this.composer.addPass(outputPass);
    } catch {
      // Graceful fallback for environments without WebGL2 support (e.g. headless unit tests)
      this.renderer = null;
      this.composer = null;
    }

    // 5. Instantiate Visual Layers
    this.stars = new StarField();
    this.scene.add(this.stars.mesh);

    this.milkyWay = new MilkyWayBand();
    this.scene.add(this.milkyWay.mesh);

    this.dust = new DustField();
    this.scene.add(this.dust.mesh);

    this.sun = new SunObject();
    this.scene.add(this.sun.group);

    this.earthBody = new PlanetBody('EARTH');
    this.scene.add(this.earthBody.group);

    this.marsBody = new PlanetBody('MARS');
    this.scene.add(this.marsBody.group);

    // 6. Camera Controller & Visual Effects
    this.cameraController = new CameraController(this.camera, this.container);
    this.effects = new SkyEffects(this.container);
    this.scene.add(this.effects.mesh);

    // 7. Off-screen Indicator Overlay Container
    if (typeof document !== 'undefined') {
      this.setupIndicatorOverlay();
    }

    // 8. Responsive ResizeObserver
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.resize();
      });
      this.resizeObserver.observe(this.container);
    }

    this.lastRenderTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  }

  private setupIndicatorOverlay(): void {
    const overlay = document.createElement('div');
    overlay.className = 'sky-indicator-overlay';
    overlay.style.cssText = `
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none;
      overflow: hidden;
      z-index: 5;
    `;
    this.container.appendChild(overlay);
    this.indicatorOverlay = overlay;
  }

  /**
   * Renders a frame of the deep space sky scene derived strictly from simulation state.
   * 
   * @param state Current simulation state
   */
  public render(state: SimState): void {
    this.lastState = state;

    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const dt = Math.min(0.1, Math.max(0.001, (now - this.lastRenderTime) / 1000.0));
    this.lastRenderTime = now;

    const reducedMotion = typeof window !== 'undefined'
      && window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Convert simulation JD to relative simulation seconds for shader animations
    const simTimeSec = (state.simTimeJD - 2451545.0) * 86400.0;

    // 1. Update Sun position & optical flares
    this.sun.update(state.shipPos, this.camera);

    // 2. Update Earth & Mars positions, illumination, and beacon dot fading
    this.earthBody.update(state.earthPos, state.shipPos, simTimeSec, this.camera);
    this.marsBody.update(state.marsPos, state.shipPos, simTimeSec, this.camera);

    // 3. Update Dust motion parallax against ship velocity
    this.dust.update(state.shipVel, dt);

    // 4. Update Camera orientation from tracking mode (FORWARD/RETROGRADE/TARGET_LOCK/FREE_LOOK)
    this.cameraController.update(state, dt);

    // 5. Apply ADCS attitude micro-drift (±0.01 deg oscillation)
    const adcsDrift = this.effects.getAdcsDriftQuaternion(simTimeSec, reducedMotion);
    this.camera.quaternion.multiply(adcsDrift);

    // 6. Update Stars & Milky Way
    this.stars.update(simTimeSec, reducedMotion);
    this.milkyWay.update();

    // 7. Update Visual Effects (sporadic micrometeors)
    this.effects.update(dt, reducedMotion);

    // 8. Render WebGL Frame via EffectComposer (or fallback to renderer)
    if (this.composer) {
      this.composer.render();
    } else if (this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }

    // 9. Update Off-Screen Directional Indicators
    this.renderOffscreenIndicators(state);
  }

  /**
   * Updates HUD off-screen indicator badges pointing to bodies outside the viewport.
   */
  private renderOffscreenIndicators(state: SkySimState): void {
    if (!this.indicatorOverlay) {
      return;
    }

    const indicators = this.cameraController.getOffscreenIndicators(state);

    // Reuse or create badge elements
    let html = '';
    indicators.forEach((ind) => {
      if (!ind.visible) {
        return;
      }

      // Convert angle to rotation degrees for indicator arrow
      const deg = (ind.angleRad * 180.0) / Math.PI;

      html += `
        <div class="offscreen-badge" data-target="${ind.name}" style="
          position: absolute;
          left: ${Math.round(ind.screenX)}px;
          top: ${Math.round(ind.screenY)}px;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(10, 14, 20, 0.85);
          border: 1px solid ${ind.color};
          padding: 2px 6px;
          border-radius: 2px;
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          font-weight: 700;
          color: ${ind.color};
          box-shadow: 0 0 8px ${ind.color}40;
          user-select: none;
          pointer-events: auto;
          cursor: pointer;
        " title="Click to lock camera onto ${ind.name}">
          <span style="display: inline-block; transform: rotate(${deg}deg); font-size: 11px;">▶</span>
          <span>${ind.name}</span>
          <span style="font-weight: normal; color: var(--text-secondary, #8899aa);">${ind.distanceAU.toFixed(3)} AU</span>
        </div>
      `;
    });

    this.indicatorOverlay.innerHTML = html;

    // Attach click listeners to lock camera to clicked body
    const badges = this.indicatorOverlay.querySelectorAll('.offscreen-badge');
    badges.forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const target = (el as HTMLElement).dataset.target as LockTarget;
        if (target) {
          this.cameraController.setMode('TARGET_LOCK', target);
        }
      });
    });
  }

  /**
   * Resizes renderer, composer, and camera projection matrix to match container dimensions.
   */
  public resize(): void {
    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 600;

    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();

    if (this.renderer) {
      this.renderer.setSize(width, height);
    }
    if (this.composer) {
      this.composer.setSize(width, height);
    }

    if (this.lastState) {
      this.renderOffscreenIndicators(this.lastState);
    }
  }

  /** Returns calculated offscreen indicators for current frame */
  public getOffscreenIndicators(): OffscreenIndicator[] {
    if (!this.lastState) {
      return [];
    }
    return this.cameraController.getOffscreenIndicators(this.lastState);
  }

  /** Sets active camera tracking mode */
  public setCameraMode(mode: CameraMode, targetBody?: LockTarget): void {
    this.cameraController.setMode(mode, targetBody);
  }

  /** Sets target body for TARGET_LOCK mode */
  public setLockTarget(target: LockTarget): void {
    this.cameraController.setLockTarget(target);
  }

  /** Current camera tracking mode */
  public getCameraMode(): CameraMode {
    return this.cameraController.mode;
  }

  /** Current target body */
  public getLockTarget(): LockTarget {
    return this.cameraController.target;
  }

  /** Enables or disables dust velocity streaks */
  public setStreaksEnabled(enabled: boolean): void {
    this.dust.setStreaksEnabled(enabled);
  }

  /** Toggles dust velocity streaks */
  public toggleStreaks(): boolean {
    return this.dust.toggleStreaks();
  }

  /** Returns whether dust velocity streaks are enabled */
  public isStreaksEnabled(): boolean {
    return this.dust.isStreaksEnabled();
  }

  /** Resets camera FOV to default 60 deg */
  public resetFov(): void {
    this.cameraController.resetFov();
  }

  /** Gets active PerspectiveCamera */
  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  /** Gets active Three.js Scene */
  public getScene(): THREE.Scene {
    return this.scene;
  }

  /**
   * Fully disposes all WebGL geometries, materials, textures, and DOM elements.
   */
  public destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    this.cameraController.destroy();
    this.effects.destroy();
    this.stars.destroy();
    this.milkyWay.destroy();
    this.dust.destroy();
    this.sun.destroy();
    this.earthBody.destroy();
    this.marsBody.destroy();

    if (this.composer) {
      this.composer.dispose();
      this.composer = null;
    }

    if (this.renderer) {
      this.renderer.dispose();
      const dom = this.renderer.domElement;
      if (dom && dom.parentElement) {
        dom.parentElement.removeChild(dom);
      }
      this.renderer = null;
    }

    if (this.indicatorOverlay && this.indicatorOverlay.parentElement) {
      this.indicatorOverlay.parentElement.removeChild(this.indicatorOverlay);
      this.indicatorOverlay = null;
    }
  }
}
