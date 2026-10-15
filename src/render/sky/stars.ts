/**
 * AEGIS TRANSIT — Procedural Deep Space Star Field
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Generates 9,000+ stars on an infinite celestial sphere using seeded PRNG (mulberry32).
 * Physical power-law apparent magnitude distribution, blackbody stellar temperature coloring,
 * and GLSL shader-driven twinkling with prefers-reduced-motion support.
 */

import * as THREE from 'three';
import { SeededRng } from '@sim/rng';

/** Radius of the celestial star sphere */
export const STAR_SPHERE_RADIUS = 1000.0;

/** Default number of procedural stars */
export const DEFAULT_STAR_COUNT = 9000;

/**
 * Computes sRGB color [0, 1] from blackbody Kelvin temperature (1000K - 40000K)
 * using the Tanner-Helland / Mitchell Charity Planckian locus algorithm.
 * 
 * @param kelvin Stellar effective temperature in Kelvin
 * @returns [r, g, b] color tuple in range [0, 1]
 */
export function blackbodyToRGB(kelvin: number): [number, number, number] {
  const t = Math.max(1000, Math.min(40000, kelvin)) / 100.0;
  let r: number;
  let g: number;
  let b: number;

  // Red
  if (t <= 66.0) {
    r = 255.0;
  } else {
    r = 329.698727446 * Math.pow(t - 60.0, -0.1332047592);
  }

  // Green
  if (t <= 66.0) {
    g = 99.4708025861 * Math.log(t) - 161.1195681661;
  } else {
    g = 288.1221695283 * Math.pow(t - 60.0, -0.0755148492);
  }

  // Blue
  if (t >= 66.0) {
    b = 255.0;
  } else if (t <= 19.0) {
    b = 0.0;
  } else {
    b = 138.5177312231 * Math.log(t - 10.0) - 305.0447927307;
  }

  const clamp = (v: number) => Math.max(0.0, Math.min(1.0, v / 255.0));
  return [clamp(r), clamp(g), clamp(b)];
}

const STAR_VERTEX_SHADER = /* glsl */ `
  attribute float size;
  attribute vec3 color;
  attribute float twinklePhase;
  attribute float twinkleSpeed;

  varying vec3 vColor;
  varying float vTwinkle;

  uniform float uTime;
  uniform float uReducedMotion;

  void main() {
    vColor = color;
    if (uReducedMotion > 0.5) {
      vTwinkle = 1.0;
    } else {
      // Subtle physical astronomical scintillation (twinkle)
      vTwinkle = 0.78 + 0.22 * sin(uTime * twinkleSpeed + twinklePhase);
    }

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    // Point size with fixed celestial perspective
    gl_PointSize = size;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const STAR_FRAGMENT_SHADER = /* glsl */ `
  varying vec3 vColor;
  varying float vTwinkle;

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) {
      discard;
    }

    // Antialiased circular profile with soft corona and intense core
    float alpha = smoothstep(0.5, 0.04, dist);
    float core = smoothstep(0.18, 0.0, dist) * 0.6;
    vec3 outColor = (vColor + vec3(core)) * vTwinkle;

    gl_FragColor = vec4(outColor, alpha);
  }
`;

/**
 * Procedural star field rendering 9,000+ stars on an infinite sphere.
 */
export class StarField {
  public mesh: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private starCount: number;

  /**
   * Constructs the star field using seeded PRNG for absolute reproducibility.
   * 
   * @param count Number of stars to generate (defaults to 9000)
   * @param seed PRNG seed for reproducible sky map (defaults to 19690720 Apollo 11)
   */
  constructor(count: number = DEFAULT_STAR_COUNT, seed: number = 19690720) {
    this.starCount = count;
    const rng = new SeededRng(seed);

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const twinklePhases = new Float32Array(count);
    const twinkleSpeeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // 1. Uniform distribution on celestial sphere
      const u = rng.random();
      const v = rng.random();
      const theta = 2.0 * Math.PI * u;
      const phi = Math.acos(2.0 * v - 1.0);

      const sinPhi = Math.sin(phi);
      const x = STAR_SPHERE_RADIUS * sinPhi * Math.cos(theta);
      const y = STAR_SPHERE_RADIUS * Math.cos(phi);
      const z = STAR_SPHERE_RADIUS * sinPhi * Math.sin(theta);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // 2. Power-law magnitude distribution (apparent magnitudes -0.5 to 6.5)
      // Astronomical distribution: many faint stars, rare brilliant navigational stars
      const magPow = rng.random();
      const mag = -0.5 + 7.0 * Math.pow(magPow, 0.35);

      // Point size: magnitude 0 -> ~5.5px, magnitude 6 -> ~1.5px
      const pointSize = Math.max(1.2, 5.8 - mag * 0.72);
      sizes[i] = pointSize;

      // 3. Blackbody temperature distribution (3000K to 30000K)
      // Most stars are K/M dwarfs, with hot O/B/A stars scattered across the celestial sphere
      const tempRand = rng.random();
      const kelvin = 3000 + 27000 * Math.pow(tempRand, 2.4);
      const [cr, cg, cb] = blackbodyToRGB(kelvin);

      // Boost brightness of bright stars slightly for visual pop
      const brightness = Math.max(0.4, 1.2 - mag * 0.12);
      colors[i * 3] = cr * brightness;
      colors[i * 3 + 1] = cg * brightness;
      colors[i * 3 + 2] = cb * brightness;

      // 4. Twinkle phase & speed
      twinklePhases[i] = rng.random() * 2.0 * Math.PI;
      twinkleSpeeds[i] = 1.0 + rng.random() * 3.0;
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    this.geometry.setAttribute('twinklePhase', new THREE.BufferAttribute(twinklePhases, 1));
    this.geometry.setAttribute('twinkleSpeed', new THREE.BufferAttribute(twinkleSpeeds, 1));

    this.material = new THREE.ShaderMaterial({
      vertexShader: STAR_VERTEX_SHADER,
      fragmentShader: STAR_FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0.0 },
        uReducedMotion: { value: 0.0 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.mesh = new THREE.Points(this.geometry, this.material);
    this.mesh.name = 'StarField';
  }

  /**
   * Updates shader uniforms per frame.
   * 
   * @param timeSec Elapsed presentation time in seconds
   * @param reducedMotion Whether the user prefers reduced motion
   */
  public update(timeSec: number, reducedMotion: boolean): void {
    this.material.uniforms.uTime.value = timeSec;
    this.material.uniforms.uReducedMotion.value = reducedMotion ? 1.0 : 0.0;
  }

  /**
   * Total number of stars in the procedural field.
   */
  public getCount(): number {
    return this.starCount;
  }

  /**
   * Disposes WebGL buffers and material to prevent memory leaks.
   */
  public destroy(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}
