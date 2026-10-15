/**
 * AEGIS TRANSIT — Near-Field Interstellar Dust Particles
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Simulates 1,500 micrometeoroid and interplanetary dust particles in the spacecraft reference frame.
 * Translates particles against the spacecraft velocity vector (true motion parallax).
 * 
 * NOTE ON PERCEIVED SPEED:
 * Physically literal interplanetary dust at heliocentric cruise speed (~30 km/s) would appear nearly
 * stationary to human eyes over short intervals due to cosmic scale.
 * When streak mode is enabled, streak length is mapped to perceived kinematic velocity to provide
 * intuitive pilot kinesthetic feedback. The operator can toggle "Physically literal (no streaks)"
 * at any time for absolute physical fidelity.
 */

import * as THREE from 'three';
import { SeededRng } from '@sim/rng';

export const DUST_PARTICLE_COUNT = 1500;
export const DUST_BOUNDS = 14.0; // Half-width of particle bounding volume in scene units

/**
 * Near-field dust field rendering 1,500 drifting particles with true motion parallax.
 */
export class DustField {
  public mesh: THREE.LineSegments;
  private geometry: THREE.BufferGeometry;
  private material: THREE.LineBasicMaterial;

  private particlePositions: Float32Array; // 1500 * 3
  private linePositions: Float32Array; // 1500 * 2 * 3 (head and tail)
  private lineColors: Float32Array; // 1500 * 2 * 3 (head and tail colors)

  private streaksEnabled: boolean = true;
  private rng: SeededRng;

  /**
   * Initializes 1,500 dust particles in the spacecraft frame using seeded RNG.
   * 
   * @param seed Seed for reproducibility (default: 4280)
   */
  constructor(seed: number = 4280) {
    this.rng = new SeededRng(seed);
    const count = DUST_PARTICLE_COUNT;

    this.particlePositions = new Float32Array(count * 3);
    this.linePositions = new Float32Array(count * 6);
    this.lineColors = new Float32Array(count * 6);

    for (let i = 0; i < count; i++) {
      const px = this.rng.range(-DUST_BOUNDS, DUST_BOUNDS);
      const py = this.rng.range(-DUST_BOUNDS, DUST_BOUNDS);
      const pz = this.rng.range(-DUST_BOUNDS, DUST_BOUNDS);

      this.particlePositions[i * 3] = px;
      this.particlePositions[i * 3 + 1] = py;
      this.particlePositions[i * 3 + 2] = pz;

      // Head vertex
      this.linePositions[i * 6] = px;
      this.linePositions[i * 6 + 1] = py;
      this.linePositions[i * 6 + 2] = pz;

      // Tail vertex (initially collapsed)
      this.linePositions[i * 6 + 3] = px;
      this.linePositions[i * 6 + 4] = py;
      this.linePositions[i * 6 + 5] = pz;

      // Head color: subtle cyan/ice-white glow
      const brightness = this.rng.range(0.35, 0.85);
      this.lineColors[i * 6] = 0.5 * brightness;
      this.lineColors[i * 6 + 1] = 0.85 * brightness;
      this.lineColors[i * 6 + 2] = 1.0 * brightness;

      // Tail color: fades to zero alpha/darkness
      this.lineColors[i * 6 + 3] = 0.05;
      this.lineColors[i * 6 + 4] = 0.1;
      this.lineColors[i * 6 + 5] = 0.2;
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.linePositions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.lineColors, 3));

    this.material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      linewidth: 1,
    });

    this.mesh = new THREE.LineSegments(this.geometry, this.material);
    this.mesh.name = 'DustField';
  }

  /**
   * Sets whether velocity streak visualization is enabled.
   * When false, particles are rendered physically literal (no streaks).
   */
  public setStreaksEnabled(enabled: boolean): void {
    this.streaksEnabled = enabled;
  }

  /**
   * Gets current streak mode status.
   */
  public isStreaksEnabled(): boolean {
    return this.streaksEnabled;
  }

  /**
   * Toggles streak visualization mode.
   */
  public toggleStreaks(): boolean {
    this.streaksEnabled = !this.streaksEnabled;
    return this.streaksEnabled;
  }

  /**
   * Updates particle positions and streak vectors based on ship velocity.
   * Translates particles against velocity vector (motion parallax).
   * 
   * @param shipVel Heliocentric velocity in AU/day [vx, vy]
   * @param dt Frame delta time in seconds
   */
  public update(shipVel: [number, number], dt: number): void {
    // Ship velocity vector in 3D scene coordinates (X = vx, Y = 0, Z = -vy)
    const vx = shipVel[0];
    const vy = -shipVel[1];
    const speed = Math.hypot(vx, vy);

    if (speed < 1e-8) {
      return;
    }

    // Unit flow direction (opposing vehicle velocity)
    const flowX = -vx / speed;
    const flowY = 0.0;
    const flowZ = -vy / speed;

    // Visual speed mapping factor:
    // Cruise speed ~0.02 AU/day translates to ~2.5 units/s apparent drift
    const visualSpeedFactor = 120.0;
    const apparentSpeed = speed * visualSpeedFactor;
    const step = Math.min(apparentSpeed * dt, 4.0);

    // Streak length: proportional to speed when enabled, or tiny point when literal
    const streakLength = this.streaksEnabled
      ? Math.max(0.08, Math.min(1.8, speed * 60.0))
      : 0.001; // Physically literal stationary dot

    const count = DUST_PARTICLE_COUNT;
    const posAttr = this.geometry.attributes.position as THREE.BufferAttribute;
    const linePos = this.linePositions;

    for (let i = 0; i < count; i++) {
      const idx3 = i * 3;
      let px = this.particlePositions[idx3] + flowX * step;
      let py = this.particlePositions[idx3 + 1] + flowY * step;
      let pz = this.particlePositions[idx3 + 2] + flowZ * step;

      // Respawn if particle leaves bounding box
      let respawned = false;
      if (px > DUST_BOUNDS) { px = -DUST_BOUNDS; respawned = true; }
      else if (px < -DUST_BOUNDS) { px = DUST_BOUNDS; respawned = true; }

      if (py > DUST_BOUNDS) { py = -DUST_BOUNDS; respawned = true; }
      else if (py < -DUST_BOUNDS) { py = DUST_BOUNDS; respawned = true; }

      if (pz > DUST_BOUNDS) { pz = -DUST_BOUNDS; respawned = true; }
      else if (pz < -DUST_BOUNDS) { pz = DUST_BOUNDS; respawned = true; }

      if (respawned) {
        // Randomize lateral coordinates upon respawn
        if (Math.abs(flowX) > Math.abs(flowZ)) {
          py = this.rng.range(-DUST_BOUNDS, DUST_BOUNDS);
          pz = this.rng.range(-DUST_BOUNDS, DUST_BOUNDS);
        } else {
          px = this.rng.range(-DUST_BOUNDS, DUST_BOUNDS);
          py = this.rng.range(-DUST_BOUNDS, DUST_BOUNDS);
        }
      }

      this.particlePositions[idx3] = px;
      this.particlePositions[idx3 + 1] = py;
      this.particlePositions[idx3 + 2] = pz;

      // Update line segment vertices (head and tail)
      const idx6 = i * 6;
      linePos[idx6] = px;
      linePos[idx6 + 1] = py;
      linePos[idx6 + 2] = pz;

      // Tail extends backwards along flow vector
      linePos[idx6 + 3] = px - flowX * streakLength;
      linePos[idx6 + 4] = py - flowY * streakLength;
      linePos[idx6 + 5] = pz - flowZ * streakLength;
    }

    posAttr.needsUpdate = true;
  }

  /**
   * Disposes geometry and material.
   */
  public destroy(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}
