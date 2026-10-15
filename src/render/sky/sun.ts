/**
 * AEGIS TRANSIT — Solar Body & Optical Flare System
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Physical solar body positioned from true astrodynamic heliocentric state.
 * Employs exact physical angular diameter 2*atan(R_sun / d), procedural glare corona billboard,
 * and subtle optical lens flare elements along the camera optical axis.
 */

import * as THREE from 'three';
import { SUN_RADIUS_M, AU_M } from '@sim/constants';
import { AU_TO_SCENE } from './types';

/** Sun radius in Three.js scene units (0.465 units at 1 AU = 100 units) */
export const SUN_SCENE_RADIUS = (SUN_RADIUS_M / AU_M) * AU_TO_SCENE;

/**
 * Procedurally generates a circular solar glare corona texture with diffraction rays.
 */
function createSunGlareTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined' || !document.createElement) {
    return null;
  }

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return null;
  }

  const center = size / 2;

  // Multi-stop radial glow
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
  gradient.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
  gradient.addColorStop(0.08, 'rgba(255, 250, 220, 0.95)');
  gradient.addColorStop(0.25, 'rgba(255, 200, 110, 0.45)');
  gradient.addColorStop(0.55, 'rgba(255, 140, 40, 0.12)');
  gradient.addColorStop(1.0, 'rgba(255, 100, 20, 0.0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Subtle 4-point solar cross diffraction spikes
  ctx.strokeStyle = 'rgba(255, 245, 220, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(center, 0); ctx.lineTo(center, size);
  ctx.moveTo(0, center); ctx.lineTo(size, center);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedurally generates a soft circular lens flare aperture ghost texture.
 */
function createFlareDiscTexture(color: string): THREE.CanvasTexture | null {
  if (typeof document === 'undefined' || !document.createElement) {
    return null;
  }

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return null;
  }

  const center = size / 2;
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
  gradient.addColorStop(0.0, color);
  gradient.addColorStop(0.6, color.replace(/[\d.]+\)$/, '0.2)'));
  gradient.addColorStop(0.9, color.replace(/[\d.]+\)$/, '0.05)'));
  gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

interface FlareElement {
  mesh: THREE.Mesh;
  material: THREE.MeshBasicMaterial;
  offset: number; // Position along flare axis (-1 to 1)
  baseSize: number;
}

/**
 * Solar body rendering component with physical angular size, HDR glare sprite, and optical flares.
 */
export class SunObject {
  public group: THREE.Group;
  private coreMesh: THREE.Mesh;
  private glareSprite: THREE.Sprite;
  private glareTexture: THREE.CanvasTexture | null = null;
  private flares: FlareElement[] = [];
  private flareGroup: THREE.Group;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'SunSystem';

    // 1. Central solar disc (physically sized sphere)
    const discGeo = new THREE.SphereGeometry(SUN_SCENE_RADIUS, 32, 16);
    const discMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });
    this.coreMesh = new THREE.Mesh(discGeo, discMat);
    this.coreMesh.name = 'SunCore';
    this.group.add(this.coreMesh);

    // 2. Procedural Glare Corona Billboard
    this.glareTexture = createSunGlareTexture();
    const spriteMat = new THREE.SpriteMaterial({
      map: this.glareTexture,
      color: 0xffffff,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.glareSprite = new THREE.Sprite(spriteMat);
    this.glareSprite.name = 'SunGlare';
    // Glare corona spans ~12x solar radius for atmospheric presence
    const glareScale = SUN_SCENE_RADIUS * 14.0;
    this.glareSprite.scale.set(glareScale, glareScale, 1.0);
    this.group.add(this.glareSprite);

    // 3. Optical lens flare elements (screen-space camera line)
    this.flareGroup = new THREE.Group();
    this.flareGroup.name = 'SunFlares';
    this.group.add(this.flareGroup);

    this.initFlares();
  }

  private initFlares(): void {
    const flareSpecs = [
      { color: 'rgba(0, 229, 255, 0.4)', offset: 0.35, size: 0.8 },
      { color: 'rgba(255, 171, 0, 0.35)', offset: 0.65, size: 1.2 },
      { color: 'rgba(224, 64, 251, 0.25)', offset: -0.4, size: 0.5 },
      { color: 'rgba(0, 230, 118, 0.3)', offset: 0.9, size: 0.4 },
    ];

    const planeGeo = new THREE.PlaneGeometry(1, 1);

    flareSpecs.forEach((spec) => {
      const tex = createFlareDiscTexture(spec.color);
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.0,
      });
      const mesh = new THREE.Mesh(planeGeo, mat);
      mesh.visible = false;
      this.flareGroup.add(mesh);
      this.flares.push({
        mesh,
        material: mat,
        offset: spec.offset,
        baseSize: spec.size,
      });
    });
  }

  /**
   * Updates position from spacecraft heliocentric coordinates and updates optical flares.
   * 
   * @param shipPos Spacecraft heliocentric position [x, y] in AU
   * @param camera Active perspective camera for flare projection
   */
  public update(shipPos: [number, number], camera: THREE.PerspectiveCamera): void {
    // Sun is at heliocentric (0, 0).
    // In ship-relative scene coords: (0 - shipPos[0], 0, -(0 - shipPos[1])) * AU_TO_SCENE
    const sx = -shipPos[0] * AU_TO_SCENE;
    const sy = 0.0;
    const sz = shipPos[1] * AU_TO_SCENE;

    this.group.position.set(sx, sy, sz);

    // Distance to Sun
    const distScene = Math.hypot(sx, sz);
    const distAU = distScene / AU_TO_SCENE;

    // Glare size scales slightly with inverse square root of distance
    const glareFactor = Math.max(0.6, Math.min(1.8, 1.0 / Math.sqrt(distAU)));
    const glareScale = SUN_SCENE_RADIUS * 14.0 * glareFactor;
    this.glareSprite.scale.set(glareScale, glareScale, 1.0);

    // Lens flare calculation
    this.updateFlares(camera);
  }

  /**
   * Projects Sun into viewport and aligns optical lens flares along the optical axis.
   */
  private updateFlares(camera: THREE.PerspectiveCamera): void {
    const sunWorld = this.group.position;
    const ndc = sunWorld.clone().project(camera);

    // Check if Sun is in front of camera
    const inFront = ndc.z < 1.0;
    const distFromCenter = Math.hypot(ndc.x, ndc.y);
    const isVisible = inFront && distFromCenter < 1.3;

    if (!isVisible || this.flares.length === 0) {
      this.flares.forEach((f) => {
        f.mesh.visible = false;
      });
      return;
    }

    // Edge fade factor
    const edgeFade = 1.0 - Math.min(1.0, Math.max(0.0, (distFromCenter - 0.7) / 0.6));

    // Vector from Sun to screen center in NDC
    const dirX = -ndc.x;
    const dirY = -ndc.y;

    this.flares.forEach((f) => {
      f.mesh.visible = true;
      f.material.opacity = 0.35 * edgeFade;

      // Position in 3D camera space
      const flareNDC = new THREE.Vector3(
        ndc.x + dirX * f.offset,
        ndc.y + dirY * f.offset,
        0.5
      );
      flareNDC.unproject(camera);

      f.mesh.position.copy(flareNDC);
      f.mesh.quaternion.copy(camera.quaternion);

      const scale = f.baseSize * 0.15 * edgeFade;
      f.mesh.scale.set(scale, scale, 1.0);
    });
  }

  /**
   * Gets current world position of the Sun.
   */
  public getPosition(): THREE.Vector3 {
    return this.group.position;
  }

  /**
   * Physical angular diameter in radians from current viewpoint.
   */
  public getAngularDiameterRad(shipPos: [number, number]): number {
    const distAU = Math.hypot(shipPos[0], shipPos[1]);
    const distM = distAU * AU_M;
    return 2.0 * Math.atan(SUN_RADIUS_M / distM);
  }

  /**
   * Disposes geometries, materials, and textures.
   */
  public destroy(): void {
    this.coreMesh.geometry.dispose();
    (this.coreMesh.material as THREE.Material).dispose();

    if (this.glareTexture) {
      this.glareTexture.dispose();
    }
    this.glareSprite.material.dispose();

    this.flares.forEach((f) => {
      f.mesh.geometry.dispose();
      f.material.dispose();
      if (f.material.map) {
        f.material.map.dispose();
      }
    });
  }
}
