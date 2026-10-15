/**
 * AEGIS TRANSIT — Sky View Camera Controller
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Multi-mode camera director supporting:
 * - FORWARD: Track vehicle heliocentric velocity vector
 * - RETROGRADE: Track opposite velocity vector
 * - TARGET_LOCK: Track celestial bodies (Mars, Earth, Sun)
 * - FREE_LOOK: Interactive pitch/yaw mouse drag and FOV zoom (50° - 90°)
 * 
 * Features smooth quaternion slerp transitions (0.5 - 1.0 s) and calculates
 * edge vector indicators for off-screen celestial bodies.
 */

import * as THREE from 'three';
import { degToRad } from '@sim/constants';
import {
  AU_TO_SCENE,
  type CameraMode,
  type LockTarget,
  type OffscreenIndicator,
  type SkySimState,
} from './types';

export class CameraController {
  public camera: THREE.PerspectiveCamera;
  public mode: CameraMode = 'FORWARD';
  public target: LockTarget = 'MARS';

  private container: HTMLElement;
  private currentQuat: THREE.Quaternion = new THREE.Quaternion();
  private targetQuat: THREE.Quaternion = new THREE.Quaternion();
  private dummyLookObject: THREE.Object3D = new THREE.Object3D();

  // Free look state
  private yaw: number = 0;
  private pitch: number = 0;
  private isDragging: boolean = false;
  private lastMouseX: number = 0;
  private lastMouseY: number = 0;

  // Zoom FOV
  private minFov: number = 50.0;
  private maxFov: number = 90.0;

  // DOM Event handlers
  private onMouseDownBound: (e: MouseEvent) => void;
  private onMouseMoveBound: (e: MouseEvent) => void;
  private onMouseUpBound: (e: MouseEvent) => void;
  private onWheelBound: (e: WheelEvent) => void;

  constructor(camera: THREE.PerspectiveCamera, container: HTMLElement) {
    this.camera = camera;
    this.container = container;

    this.currentQuat.copy(camera.quaternion);
    this.targetQuat.copy(camera.quaternion);

    this.onMouseDownBound = this.onMouseDown.bind(this);
    this.onMouseMoveBound = this.onMouseMove.bind(this);
    this.onMouseUpBound = this.onMouseUp.bind(this);
    this.onWheelBound = this.onWheel.bind(this);

    this.attachEvents();
  }

  private attachEvents(): void {
    this.container.addEventListener('mousedown', this.onMouseDownBound);
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', this.onMouseMoveBound);
      window.addEventListener('mouseup', this.onMouseUpBound);
    }
    this.container.addEventListener('wheel', this.onWheelBound, { passive: false });
  }

  private detachEvents(): void {
    this.container.removeEventListener('mousedown', this.onMouseDownBound);
    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', this.onMouseMoveBound);
      window.removeEventListener('mouseup', this.onMouseUpBound);
    }
    this.container.removeEventListener('wheel', this.onWheelBound);
  }

  /**
   * Sets the active camera tracking mode.
   * Smoothly slerps orientation toward the new mode's look vector.
   */
  public setMode(mode: CameraMode, targetBody?: LockTarget): void {
    this.mode = mode;
    if (targetBody) {
      this.target = targetBody;
    }

    if (mode === 'FREE_LOOK') {
      // Synchronize free-look pitch and yaw with current camera quaternion to prevent jump
      const euler = new THREE.Euler().setFromQuaternion(this.camera.quaternion, 'YXZ');
      this.yaw = euler.y;
      this.pitch = euler.x;
      this.container.style.cursor = 'grab';
    } else {
      this.container.style.cursor = 'default';
    }
  }

  /**
   * Sets the target celestial body for TARGET_LOCK mode.
   */
  public setLockTarget(target: LockTarget): void {
    this.target = target;
    this.mode = 'TARGET_LOCK';
  }

  private onMouseDown(e: MouseEvent): void {
    if (e.button !== 0) {
      return; // Only primary button
    }
    this.isDragging = true;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;

    if (this.mode === 'FREE_LOOK') {
      this.container.style.cursor = 'grabbing';
    }
  }

  private onMouseMove(e: MouseEvent): void {
    if (!this.isDragging) {
      return;
    }

    const dx = e.clientX - this.lastMouseX;
    const dy = e.clientY - this.lastMouseY;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;

    if (this.mode === 'FREE_LOOK') {
      const sensitivity = 0.0035;
      this.yaw -= dx * sensitivity;
      this.pitch -= dy * sensitivity;

      // Clamp pitch to avoid gimbal singularity (±85 degrees)
      const maxPitch = degToRad(85.0);
      this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));

      const euler = new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ');
      this.targetQuat.setFromEuler(euler);
    }
  }

  private onMouseUp(): void {
    if (this.isDragging) {
      this.isDragging = false;
      if (this.mode === 'FREE_LOOK') {
        this.container.style.cursor = 'grab';
      }
    }
  }

  private onWheel(e: WheelEvent): void {
    e.preventDefault();
    const zoomStep = 0.04;
    this.camera.fov += e.deltaY * zoomStep;
    this.camera.fov = Math.max(this.minFov, Math.min(this.maxFov, this.camera.fov));
    this.camera.updateProjectionMatrix();
  }

  /**
   * Updates camera orientation based on simulation state and tracking mode.
   * Performs smooth slerp interpolation (0.5 - 1.0 s transition).
   * 
   * @param state Current astrodynamic simulation state
   * @param dt Frame delta time in seconds
   */
  public update(state: SkySimState, dt: number): void {
    const origin = new THREE.Vector3(0, 0, 0);

    if (this.mode === 'FORWARD' || this.mode === 'RETROGRADE') {
      const vx = state.shipVel[0];
      const vy = -state.shipVel[1];
      const speed = Math.hypot(vx, vy);

      if (speed > 1e-8) {
        const sign = this.mode === 'FORWARD' ? 1.0 : -1.0;
        const dir = new THREE.Vector3(vx * sign, 0.0, vy * sign).normalize();

        this.dummyLookObject.position.copy(origin);
        this.dummyLookObject.lookAt(dir);
        this.targetQuat.copy(this.dummyLookObject.quaternion);
      }
    } else if (this.mode === 'TARGET_LOCK') {
      let targetPosAU: [number, number];

      if (this.target === 'SUN') {
        targetPosAU = [0, 0];
      } else if (this.target === 'EARTH') {
        targetPosAU = state.earthPos;
      } else {
        targetPosAU = state.marsPos;
      }

      // Relative vector in scene units: X = dx * 100, Y = 0, Z = -dy * 100
      const dx = (targetPosAU[0] - state.shipPos[0]) * AU_TO_SCENE;
      const dz = -(targetPosAU[1] - state.shipPos[1]) * AU_TO_SCENE;
      const targetVec = new THREE.Vector3(dx, 0.0, dz);

      if (targetVec.lengthSq() > 1e-6) {
        this.dummyLookObject.position.copy(origin);
        this.dummyLookObject.lookAt(targetVec);
        this.targetQuat.copy(this.dummyLookObject.quaternion);
      }
    }

    // Smooth slerp transition: ~0.5 - 0.8 s responsive dampening
    const slerpSpeed = this.mode === 'FREE_LOOK' && this.isDragging ? 25.0 : 4.5;
    const slerpFactor = 1.0 - Math.exp(-Math.max(0.001, dt) * slerpSpeed);

    this.currentQuat.slerp(this.targetQuat, Math.min(1.0, slerpFactor));
    this.camera.quaternion.copy(this.currentQuat);
  }

  /**
   * Calculates off-screen indicator vectors for celestial bodies outside the camera viewport.
   * 
   * @param state Active simulation state
   * @returns Array of calculated OffscreenIndicator markers
   */
  public getOffscreenIndicators(state: SkySimState): OffscreenIndicator[] {
    const bodies: { name: LockTarget; posAU: [number, number]; color: string }[] = [
      { name: 'SUN', posAU: [0, 0], color: '#ffab00' },
      { name: 'EARTH', posAU: state.earthPos, color: '#00e5ff' },
      { name: 'MARS', posAU: state.marsPos, color: '#ff5252' },
    ];

    const rect = this.container.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 600;

    const indicators: OffscreenIndicator[] = [];

    bodies.forEach(({ name, posAU, color }) => {
      const dxAU = posAU[0] - state.shipPos[0];
      const dyAU = posAU[1] - state.shipPos[1];
      const distAU = Math.hypot(dxAU, dyAU);

      // 3D relative position
      const relPos = new THREE.Vector3(dxAU * AU_TO_SCENE, 0, -dyAU * AU_TO_SCENE);

      // Project into Normalized Device Coordinates (NDC) [-1, +1]
      const ndc = relPos.clone().project(this.camera);

      // Behind camera check: when z > 1, ray direction is inverted
      const isBehind = ndc.z > 1.0;
      let nx = ndc.x;
      let ny = ndc.y;

      if (isBehind) {
        nx = -nx;
        ny = -ny;
      }

      // Check if inside screen margin
      const margin = 0.88;
      const isInside = !isBehind && Math.abs(nx) <= margin && Math.abs(ny) <= margin;

      if (isInside) {
        indicators.push({
          name,
          screenX: ((nx + 1.0) / 2.0) * width,
          screenY: ((-ny + 1.0) / 2.0) * height,
          angleRad: 0,
          distanceAU: distAU,
          color,
          visible: false, // Inside viewport, marker not needed
        });
        return;
      }

      // Intersect ray (0,0) -> (nx, ny) with bounding box [-margin, margin]
      const rayLen = Math.hypot(nx, ny);
      if (rayLen < 1e-6) {
        return;
      }

      const dirX = nx / rayLen;
      const dirY = ny / rayLen;

      // Scale to border
      const scaleX = dirX !== 0 ? margin / Math.abs(dirX) : Infinity;
      const scaleY = dirY !== 0 ? margin / Math.abs(dirY) : Infinity;
      const edgeScale = Math.min(scaleX, scaleY);

      const edgeX = dirX * edgeScale;
      const edgeY = dirY * edgeScale;

      const screenX = ((edgeX + 1.0) / 2.0) * width;
      const screenY = ((-edgeY + 1.0) / 2.0) * height;

      // Screen angle: pointing outward from screen center towards target
      const angleRad = Math.atan2(screenY - height / 2.0, screenX - width / 2.0);

      indicators.push({
        name,
        screenX,
        screenY,
        angleRad,
        distanceAU: distAU,
        color,
        visible: true,
      });
    });

    return indicators;
  }

  /**
   * Resets camera to default FOV (60 deg).
   */
  public resetFov(): void {
    this.camera.fov = 60.0;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Disposes DOM listeners.
   */
  public destroy(): void {
    this.detachEvents();
  }
}
