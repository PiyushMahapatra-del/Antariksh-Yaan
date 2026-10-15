/**
 * AEGIS TRANSIT — Procedural Milky Way Galactic Band
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Prerenders a high-resolution equirectangular texture of the Milky Way along a great circle.
 * Multi-octave fractal brownian motion (fBm) simulates galactic star clouds, the Sagittarius central bulge,
 * and the interstellar Great Rift dust absorption lanes.
 * Oriented along the physical galactic inclination (~63° to ecliptic).
 */

import * as THREE from 'three';
import { degToRad } from '@sim/constants';
import { SeededRng } from '@sim/rng';

/** Radius of the Milky Way celestial sphere (nested inside star sphere) */
export const MILKY_WAY_RADIUS = 950.0;

/**
 * 2D Seeded Simplex-like Value Noise with smooth hermite interpolation.
 */
class FastNoise2D {
  private perm: Uint8Array;

  constructor(seed: number = 101) {
    const rng = new SeededRng(seed);
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      p[i] = i;
    }
    rng.shuffle(Array.from(p)).forEach((val, i) => {
      p[i] = val;
    });
    this.perm = new Uint8Array(512);
    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255];
    }
  }

  private hash(x: number, y: number): number {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const g = this.perm[this.perm[xi] + yi];
    return g / 255.0;
  }

  public noise(x: number, y: number): number {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = x - x0;
    const fy = y - y0;

    // Hermite smoothstep
    const sx = fx * fx * (3.0 - 2.0 * fx);
    const sy = fy * fy * (3.0 - 2.0 * fy);

    const n00 = this.hash(x0, y0);
    const n10 = this.hash(x0 + 1, y0);
    const n01 = this.hash(x0, y0 + 1);
    const n11 = this.hash(x0 + 1, y0 + 1);

    const nx0 = n00 * (1.0 - sx) + n10 * sx;
    const nx1 = n01 * (1.0 - sx) + n11 * sx;

    return nx0 * (1.0 - sy) + nx1 * sy;
  }

  public fbm(x: number, y: number, octaves: number = 4): number {
    let sum = 0.0;
    let amp = 0.5;
    let freq = 1.0;
    let max = 0.0;

    for (let i = 0; i < octaves; i++) {
      sum += this.noise(x * freq, y * freq) * amp;
      max += amp;
      amp *= 0.5;
      freq *= 2.02;
    }

    return sum / max;
  }
}

/**
 * Procedurally generates the equirectangular Milky Way texture onto an HTMLCanvasElement.
 * 
 * @param width Canvas width in pixels
 * @param height Canvas height in pixels
 * @returns Rendered HTMLCanvasElement containing diffuse galactic band
 */
export function generateMilkyWayCanvas(width: number = 1024, height: number = 512): HTMLCanvasElement {
  let canvas: HTMLCanvasElement;
  if (typeof document !== 'undefined' && document.createElement) {
    canvas = document.createElement('canvas');
  } else {
    // Vitest / node environment mock fallback
    canvas = {
      width,
      height,
      getContext: () => null,
    } as unknown as HTMLCanvasElement;
    return canvas;
  }

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return canvas;
  }

  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  const noise = new FastNoise2D(777);
  const dustNoise = new FastNoise2D(12345);

  const halfH = height / 2.0;

  for (let y = 0; y < height; y++) {
    // Galactic latitude b in radians [-pi/2, +pi/2]
    const b = ((y - halfH) / halfH) * (Math.PI / 2.0);
    const bDeg = Math.abs(b * (180.0 / Math.PI));

    // Fast reject if far from galactic plane (> 40 degrees)
    if (bDeg > 38.0) {
      continue;
    }

    // Disk profile: Gaussian falloff from galactic equator
    const sigmaB = 0.15; // ~8.5 degrees standard deviation
    const diskProfile = Math.exp(-(b * b) / (2.0 * sigmaB * sigmaB));

    for (let x = 0; x < width; x++) {
      // Galactic longitude l in radians [-pi, +pi]
      const l = ((x - width / 2.0) / (width / 2.0)) * Math.PI;

      // 1. Central Bulge (Sagittarius region at l = 0, b = 0)
      const sigmaBulgeL = 0.35; // ~20 degrees
      const sigmaBulgeB = 0.18; // ~10 degrees
      const bulge = 1.6 * Math.exp(
        -((l * l) / (2.0 * sigmaBulgeL * sigmaBulgeL) + (b * b) / (2.0 * sigmaBulgeB * sigmaBulgeB))
      );

      // 2. Star Clouds (Multi-octave fBm along disk)
      // Wrap longitude seamlessly for equirectangular projection
      const uCoords = (x / width) * 8.0;
      const vCoords = (y / height) * 6.0;
      const cloudNoise = noise.fbm(uCoords, vCoords, 4);

      // 3. Great Rift / Dark Dust Nebulae Absorption Lanes
      // Interstellar dust concentrates along the midplane (b within ±3 degrees)
      const dustDust = dustNoise.fbm(uCoords * 1.8 + 4.5, vCoords * 2.2 + 1.2, 3);
      const dustBand = Math.exp(-(b * b) / (2.0 * 0.05 * 0.05));
      const dustAbsorption = 1.0 - 0.7 * Math.pow(dustDust, 1.5) * dustBand;

      // Combined galactic radiance
      const radiance = (diskProfile * 0.55 + bulge + cloudNoise * 0.45) * dustAbsorption;

      if (radiance <= 0.01) {
        continue;
      }

      // Bulge is warmer gold/amber, outer spiral arms are cool silver/blue-white
      const bulgeMix = Math.min(1.0, bulge * 0.8);
      const r = Math.round((210 * (1.0 - bulgeMix) + 255 * bulgeMix) * radiance);
      const g = Math.round((225 * (1.0 - bulgeMix) + 215 * bulgeMix) * radiance);
      const bColor = Math.round((255 * (1.0 - bulgeMix) + 170 * bulgeMix) * radiance);

      // Low alpha (0.08 - 0.15) subtle glow
      const alphaVal = Math.min(0.15, radiance * 0.14);

      const idx = (y * width + x) * 4;
      data[idx] = Math.min(255, r);
      data[idx + 1] = Math.min(255, g);
      data[idx + 2] = Math.min(255, bColor);
      data[idx + 3] = Math.round(alphaVal * 255);
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

/**
 * Milky Way Band celestial layer.
 */
export class MilkyWayBand {
  public mesh: THREE.Mesh;
  private geometry: THREE.SphereGeometry;
  private material: THREE.MeshBasicMaterial;
  private texture: THREE.CanvasTexture | null = null;

  constructor() {
    this.geometry = new THREE.SphereGeometry(MILKY_WAY_RADIUS, 48, 24);

    const canvas = generateMilkyWayCanvas(1024, 512);

    if (canvas && typeof canvas.getContext === 'function' && canvas.getContext('2d')) {
      this.texture = new THREE.CanvasTexture(canvas);
      this.texture.wrapS = THREE.RepeatWrapping;
      this.texture.wrapT = THREE.ClampToEdgeWrapping;
      this.texture.colorSpace = THREE.SRGBColorSpace;
    }

    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
      side: THREE.BackSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.95,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.name = 'MilkyWayBand';

    // Orient along the physical galactic plane (~63° inclination relative to ecliptic)
    this.mesh.rotation.order = 'YXZ';
    this.mesh.rotation.x = degToRad(63.0);
    this.mesh.rotation.y = degToRad(120.0);
    this.mesh.rotation.z = degToRad(25.0);
  }

  /**
   * Updates Milky Way band per frame.
   */
  public update(): void {
    // Celestial background remains fixed relative to celestial sphere
  }

  /**
   * Disposes geometry, texture, and material to prevent memory leaks.
   */
  public destroy(): void {
    this.geometry.dispose();
    this.material.dispose();
    if (this.texture) {
      this.texture.dispose();
    }
  }
}
