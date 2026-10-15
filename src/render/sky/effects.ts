/**
 * AEGIS TRANSIT — Sky View Visual Effects & Atmospheric Polish
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Visual fidelity additions:
 * - ADCS limit-cycle attitude micro-drift (±0.01° harmonic oscillation from deadband hunting)
 * - Sporadic celestial micrometeoroid streaks (seeded, rare, physically modeled)
 * - CRT mission console scanlines & vignetting (respecting prefers-reduced-motion)
 */

import * as THREE from 'three';
import { SeededRng } from '@sim/rng';

export class SkyEffects {
  public mesh: THREE.Group;
  private meteorLine: THREE.Line;
  private meteorGeo: THREE.BufferGeometry;
  private meteorMat: THREE.LineBasicMaterial;
  private meteorPositions: Float32Array;
  private meteorColors: Float32Array;

  // Meteor state
  private meteorActive: boolean = false;
  private meteorProgress: number = 0.0;
  private meteorDuration: number = 0.35; // 350 ms flash
  private nextMeteorTime: number = 12.0; // Seconds until first meteor
  private meteorStart: THREE.Vector3 = new THREE.Vector3();
  private meteorEnd: THREE.Vector3 = new THREE.Vector3();
  private rng: SeededRng;

  // Scanline overlay DOM element
  private overlayElement: HTMLElement | null = null;

  constructor(container?: HTMLElement, seed: number = 555) {
    this.rng = new SeededRng(seed);
    this.mesh = new THREE.Group();
    this.mesh.name = 'SkyEffects';

    // 1. Meteor streak line geometry
    this.meteorPositions = new Float32Array(6); // 2 vertices
    this.meteorColors = new Float32Array(6);

    this.meteorGeo = new THREE.BufferGeometry();
    this.meteorGeo.setAttribute('position', new THREE.BufferAttribute(this.meteorPositions, 3));
    this.meteorGeo.setAttribute('color', new THREE.BufferAttribute(this.meteorColors, 3));

    this.meteorMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.meteorLine = new THREE.Line(this.meteorGeo, this.meteorMat);
    this.meteorLine.visible = false;
    this.mesh.add(this.meteorLine);

    // 2. HUD Scanline & Vignette Overlay
    if (container && typeof document !== 'undefined') {
      this.setupOverlay(container);
    }
  }

  private setupOverlay(container: HTMLElement): void {
    const overlay = document.createElement('div');
    overlay.className = 'sky-hud-overlay';
    overlay.style.cssText = `
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none;
      background: radial-gradient(circle at 50% 50%, transparent 65%, rgba(10, 14, 20, 0.6) 100%);
      box-shadow: inset 0 0 100px rgba(0, 0, 0, 0.5);
      z-index: 2;
    `;

    // Only apply scanlines if user has not set prefers-reduced-motion
    const reducedMotion = typeof window !== 'undefined'
      && window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!reducedMotion) {
      const scanlines = document.createElement('div');
      scanlines.style.cssText = `
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%);
        background-size: 100% 4px;
        opacity: 0.35;
        pointer-events: none;
      `;
      overlay.appendChild(scanlines);
    }

    container.appendChild(overlay);
    this.overlayElement = overlay;
  }

  /**
   * Computes ADCS limit-cycle attitude micro-drift (±0.01 deg deadband oscillation).
   * 
   * @param timeSec Simulation elapsed time
   * @param reducedMotion Whether motion reduction is requested
   * @returns Micro-drift quaternion to multiply onto camera
   */
  public getAdcsDriftQuaternion(timeSec: number, reducedMotion: boolean): THREE.Quaternion {
    if (reducedMotion) {
      return new THREE.Quaternion(); // Identity
    }

    // Reaction wheel deadband limit cycle (~0.05 - 0.15 Hz, ±0.01 degrees)
    const ampRad = (0.01 * Math.PI) / 180.0;
    const yawDrift = ampRad * (0.65 * Math.sin(0.38 * timeSec) + 0.35 * Math.sin(0.82 * timeSec));
    const pitchDrift = ampRad * (0.60 * Math.cos(0.44 * timeSec) + 0.40 * Math.sin(0.95 * timeSec));
    const rollDrift = ampRad * 0.25 * Math.sin(0.25 * timeSec);

    const euler = new THREE.Euler(pitchDrift, yawDrift, rollDrift, 'YXZ');
    return new THREE.Quaternion().setFromEuler(euler);
  }

  /**
   * Updates meteor streaks per frame.
   * 
   * @param dt Frame delta time in seconds
   * @param reducedMotion Reduced motion preference
   */
  public update(dt: number, reducedMotion: boolean): void {
    if (reducedMotion) {
      this.meteorLine.visible = false;
      return;
    }

    if (this.meteorActive) {
      this.meteorProgress += dt / this.meteorDuration;

      if (this.meteorProgress >= 1.0) {
        this.meteorActive = false;
        this.meteorLine.visible = false;
        // Schedule next meteor: random 18 to 45 seconds later
        this.nextMeteorTime = this.rng.range(18.0, 45.0);
      } else {
        this.updateMeteorGeometry();
      }
    } else {
      this.nextMeteorTime -= dt;
      if (this.nextMeteorTime <= 0) {
        this.spawnMeteor();
      }
    }
  }

  private spawnMeteor(): void {
    this.meteorActive = true;
    this.meteorProgress = 0.0;
    this.meteorDuration = this.rng.range(0.25, 0.45);

    // Random point on celestial sphere (radius ~600)
    const u = this.rng.random();
    const v = this.rng.random();
    const theta = 2.0 * Math.PI * u;
    const phi = Math.acos(2.0 * v - 1.0);

    const r = 600.0;
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi);
    const z = r * Math.sin(phi) * Math.sin(theta);

    this.meteorStart.set(x, y, z);

    // Short streak arc (15 - 35 scene units)
    const streakLength = this.rng.range(15.0, 35.0);
    const streakDir = new THREE.Vector3(
      this.rng.range(-1, 1),
      this.rng.range(-1, 1),
      this.rng.range(-1, 1)
    ).normalize();

    this.meteorEnd.copy(this.meteorStart).addScaledVector(streakDir, streakLength);
    this.meteorLine.visible = true;

    this.updateMeteorGeometry();
  }

  private updateMeteorGeometry(): void {
    // Current head position moves from start to end
    const currentHead = new THREE.Vector3().lerpVectors(
      this.meteorStart,
      this.meteorEnd,
      this.meteorProgress
    );

    // Tail follows behind
    const tailProgress = Math.max(0.0, this.meteorProgress - 0.35);
    const currentTail = new THREE.Vector3().lerpVectors(
      this.meteorStart,
      this.meteorEnd,
      tailProgress
    );

    const pos = this.meteorPositions;
    pos[0] = currentHead.x; pos[1] = currentHead.y; pos[2] = currentHead.z;
    pos[3] = currentTail.x; pos[4] = currentTail.y; pos[5] = currentTail.z;

    // Fade brightness with sinusoidal flash envelope
    const alpha = Math.sin(this.meteorProgress * Math.PI);
    const col = this.meteorColors;
    col[0] = 0.8 * alpha; col[1] = 0.95 * alpha; col[2] = 1.0 * alpha; // Head: cyan-white
    col[3] = 0.1 * alpha; col[4] = 0.2 * alpha; col[5] = 0.4 * alpha; // Tail: deep blue

    (this.meteorGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (this.meteorGeo.attributes.color as THREE.BufferAttribute).needsUpdate = true;
  }

  /**
   * Disposes visual effects resources.
   */
  public destroy(): void {
    this.meteorGeo.dispose();
    this.meteorMat.dispose();
    if (this.overlayElement && this.overlayElement.parentElement) {
      this.overlayElement.parentElement.removeChild(this.overlayElement);
    }
  }
}
