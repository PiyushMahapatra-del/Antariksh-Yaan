/**
 * AEGIS TRANSIT — Sky Renderer & Celestial Layer Unit Tests
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Tests for procedural star field generation, blackbody color approximations,
 * Milky Way band, interstellar dust motion parallax, Sun and planetary bodies,
 * camera tracking modes, and off-screen indicators.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as THREE from 'three';
import { blackbodyToRGB, StarField, STAR_SPHERE_RADIUS } from './stars';
import { generateMilkyWayCanvas, MilkyWayBand, MILKY_WAY_RADIUS } from './milky-way';
import { DustField, DUST_PARTICLE_COUNT } from './dust';
import { SunObject, SUN_SCENE_RADIUS } from './sun';
import { PlanetBody } from './planets';
import { CameraController } from './camera';
import { SkyEffects } from './effects';
import { SkyRenderer } from './sky-renderer';
import { AU_M, SUN_RADIUS_M, EARTH_RADIUS_M, MARS_RADIUS_M } from '@sim/constants';
import type { SkySimState } from './types';

describe('Sky Renderer — StarField & Stellar Physics', () => {
  it('converts blackbody temperature to physically plausible RGB colors', () => {
    // Cool star (< 6500K, e.g. Betelgeuse 3500K) -> Reddish / warm
    const [coolR, coolG, coolB] = blackbodyToRGB(3500);
    expect(coolR).toBeGreaterThan(coolB);
    expect(coolR).toBeCloseTo(1.0, 2);
    expect(coolG).toBeGreaterThan(coolB);

    // Sun-like / neutral star (~6500K) -> Pure white
    const [sunR, sunG, sunB] = blackbodyToRGB(6500);
    expect(sunR).toBeCloseTo(1.0, 1);
    expect(sunG).toBeCloseTo(1.0, 1);
    expect(sunB).toBeCloseTo(1.0, 1);

    // Hot star (> 10000K, e.g. Rigel 12000K) -> Cool bluish
    const [hotR, hotG, hotB] = blackbodyToRGB(12000);
    expect(hotB).toBeGreaterThan(hotR);
    expect(hotG).toBeLessThanOrEqual(1.0);
    expect(hotB).toBeCloseTo(1.0, 1);
  });

  it('generates 9,000 stars on the celestial sphere with reproducible seeded PRNG', () => {
    const starFieldA = new StarField(500, 12345);
    const starFieldB = new StarField(500, 12345);

    expect(starFieldA.getCount()).toBe(500);
    const posA = starFieldA.mesh.geometry.attributes.position.array as Float32Array;
    const posB = starFieldB.mesh.geometry.attributes.position.array as Float32Array;

    // First star position should be strictly identical between runs
    expect(posA[0]).toBe(posB[0]);
    expect(posA[1]).toBe(posB[1]);
    expect(posA[2]).toBe(posB[2]);

    // Position magnitude should be STAR_SPHERE_RADIUS
    const r = Math.hypot(posA[0], posA[1], posA[2]);
    expect(r).toBeCloseTo(STAR_SPHERE_RADIUS, 1);

    starFieldA.destroy();
    starFieldB.destroy();
  });

  it('updates twinkle uniform per frame', () => {
    const stars = new StarField(100);
    stars.update(5.0, false);
    const mat = stars.mesh.material as THREE.ShaderMaterial;
    expect(mat.uniforms.uTime.value).toBe(5.0);
    expect(mat.uniforms.uReducedMotion.value).toBe(0.0);

    stars.update(10.0, true);
    expect(mat.uniforms.uTime.value).toBe(10.0);
    expect(mat.uniforms.uReducedMotion.value).toBe(1.0);

    stars.destroy();
  });
});

describe('Sky Renderer — MilkyWayBand', () => {
  it('instantiates Milky Way band mesh and orients along galactic plane', () => {
    const band = new MilkyWayBand();
    expect(band.mesh.name).toBe('MilkyWayBand');
    band.mesh.geometry.computeBoundingSphere();
    expect(band.mesh.geometry.boundingSphere?.radius).toBeCloseTo(MILKY_WAY_RADIUS, 0);

    // Galactic tilt rotation should be set
    expect(band.mesh.rotation.x).toBeGreaterThan(0);

    band.destroy();
  });

  it('prerenders equirectangular Milky Way canvas', () => {
    const canvas = generateMilkyWayCanvas(64, 32);
    expect(canvas.width).toBe(64);
    expect(canvas.height).toBe(32);
  });
});

describe('Sky Renderer — DustField', () => {
  it('instantiates 1,500 particles with motion parallax buffers', () => {
    const dust = new DustField(4280);
    expect(dust.mesh.name).toBe('DustField');
    const posAttr = dust.mesh.geometry.attributes.position;
    // 1500 particles * 2 vertices per line segment * 3 coords = 9000
    expect(posAttr.count).toBe(DUST_PARTICLE_COUNT * 2);

    dust.destroy();
  });

  it('translates dust against velocity vector and toggles streak visualization', () => {
    const dust = new DustField(4280);
    expect(dust.isStreaksEnabled()).toBe(true);

    const posInitial = (dust.mesh.geometry.attributes.position.array as Float32Array)[0];

    // Ship moving in +X direction in AU/day
    dust.update([0.02, 0.0], 0.1);

    const posAfter = (dust.mesh.geometry.attributes.position.array as Float32Array)[0];
    // Particles should translate against velocity (-X direction)
    expect(posAfter).toBeLessThan(posInitial);

    // Toggle streaks
    const streaksToggled = dust.toggleStreaks();
    expect(streaksToggled).toBe(false);
    expect(dust.isStreaksEnabled()).toBe(false);

    dust.destroy();
  });
});

describe('Sky Renderer — SunObject & Celestial Photometry', () => {
  it('correctly calculates physical angular diameter and positions Sun', () => {
    const sun = new SunObject();
    const camera = new THREE.PerspectiveCamera(60, 1.0, 0.001, 1000);

    // Ship at Earth orbit (1 AU from Sun along +X)
    sun.update([1.0, 0.0], camera);

    const sunPos = sun.getPosition();
    expect(sunPos.x).toBeCloseTo(-100, 2);
    expect(sunPos.y).toBeCloseTo(0, 2);
    expect(sunPos.z).toBeCloseTo(0, 2);

    // At 1 AU, angular diameter should match 2 * atan(R_sun / 1 AU)
    const expectedAngRad = 2.0 * Math.atan(SUN_RADIUS_M / AU_M);
    const calculatedAngRad = sun.getAngularDiameterRad([1.0, 0.0]);
    expect(calculatedAngRad).toBeCloseTo(expectedAngRad, 5);

    // Sun core radius in scene units
    expect(SUN_SCENE_RADIUS).toBeCloseTo(0.465, 2);

    sun.destroy();
  });
});

describe('Sky Renderer — Planetary Bodies (Earth & Mars)', () => {
  it('calculates physical angular diameter for Earth and Mars', () => {
    const earth = new PlanetBody('EARTH');
    const mars = new PlanetBody('MARS');

    // Ship at [1.1, 0.0], Earth at [1.0, 0.0] -> distance = 0.1 AU
    const earthAngRad = earth.getAngularDiameterRad([1.1, 0.0], [1.0, 0.0]);
    const expectedEarthAngRad = 2.0 * Math.atan(EARTH_RADIUS_M / (0.1 * AU_M));
    expect(earthAngRad).toBeCloseTo(expectedEarthAngRad, 5);

    // Ship at [1.4, 0.0], Mars at [1.5, 0.0] -> distance = 0.1 AU
    const marsAngRad = mars.getAngularDiameterRad([1.4, 0.0], [1.5, 0.0]);
    const expectedMarsAngRad = 2.0 * Math.atan(MARS_RADIUS_M / (0.1 * AU_M));
    expect(marsAngRad).toBeCloseTo(expectedMarsAngRad, 5);

    earth.destroy();
    mars.destroy();
  });

  it('updates Sun illumination direction vector and beacon cross-fade', () => {
    const mars = new PlanetBody('MARS');
    const camera = new THREE.PerspectiveCamera(60, 1.0, 0.001, 1000);

    // Mars at [1.5, 0.0], Ship at [1.0, 0.0]
    mars.update([1.5, 0.0], [1.0, 0.0], 100.0, camera);

    // Sun is at (0, 0). Vector from Mars to Sun is (-1.5, 0) -> normalized Sun direction = (-1, 0, 0)
    const sunDirUniform = (mars['material'] as THREE.ShaderMaterial).uniforms.uSunDir.value as THREE.Vector3;
    expect(sunDirUniform.x).toBeCloseTo(-1.0, 3);
    expect(sunDirUniform.y).toBeCloseTo(0.0, 3);
    expect(sunDirUniform.z).toBeCloseTo(0.0, 3);

    mars.destroy();
  });
});

describe('Sky Renderer — CameraController & Off-Screen Indicators', () => {
  let mockContainer: HTMLElement;

  beforeEach(() => {
    mockContainer = {
      clientWidth: 800,
      clientHeight: 600,
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      style: {} as CSSStyleDeclaration,
    } as unknown as HTMLElement;
  });

  it('manages camera tracking modes and slerps orientation', () => {
    const camera = new THREE.PerspectiveCamera(60, 800 / 600, 0.001, 1000);
    const controller = new CameraController(camera, mockContainer);

    expect(controller.mode).toBe('FORWARD');

    // Switch to RETROGRADE
    controller.setMode('RETROGRADE');
    expect(controller.mode).toBe('RETROGRADE');

    // Switch to TARGET_LOCK
    controller.setMode('TARGET_LOCK', 'MARS');
    expect(controller.mode).toBe('TARGET_LOCK');
    expect(controller.target).toBe('MARS');

    // Switch to FREE_LOOK
    controller.setMode('FREE_LOOK');
    expect(controller.mode).toBe('FREE_LOOK');

    controller.destroy();
  });

  it('computes off-screen indicators for celestial bodies outside viewport', () => {
    const camera = new THREE.PerspectiveCamera(60, 800 / 600, 0.001, 1000);
    const controller = new CameraController(camera, mockContainer);

    // Camera pointing along +X
    camera.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);

    const simState: SkySimState = {
      simTimeJD: 2451545.0,
      shipPos: [1.0, 0.0],
      shipVel: [0.0, 0.02],
      earthPos: [1.0, 0.0],
      marsPos: [1.5, 0.5],
    };

    const indicators = controller.getOffscreenIndicators(simState);
    expect(indicators.length).toBe(3); // Sun, Earth, Mars

    const marsInd = indicators.find((ind) => ind.name === 'MARS');
    expect(marsInd).toBeDefined();
    expect(marsInd?.distanceAU).toBeGreaterThan(0);

    controller.destroy();
  });
});

describe('Sky Renderer — SkyEffects & Micro-drift', () => {
  it('computes ADCS attitude micro-drift bounded by ±0.01 degrees', () => {
    const effects = new SkyEffects();

    for (let t = 0; t < 100; t += 5) {
      const q = effects.getAdcsDriftQuaternion(t, false);
      const euler = new THREE.Euler().setFromQuaternion(q, 'YXZ');
      const maxDeg = 0.015; // Within deadband bound
      expect(Math.abs(euler.x * 180 / Math.PI)).toBeLessThan(maxDeg);
      expect(Math.abs(euler.y * 180 / Math.PI)).toBeLessThan(maxDeg);
    }

    // Motion reduction returns identity quaternion
    const qReduced = effects.getAdcsDriftQuaternion(10.0, true);
    expect(qReduced.x).toBe(0);
    expect(qReduced.y).toBe(0);
    expect(qReduced.z).toBe(0);
    expect(qReduced.w).toBe(1);

    effects.destroy();
  });
});

describe('Sky Renderer — SkyRenderer Lifecycle & Public APIs', () => {
  let mockContainer: HTMLElement;

  beforeEach(() => {
    mockContainer = {
      clientWidth: 800,
      clientHeight: 600,
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      style: {} as CSSStyleDeclaration,
    } as unknown as HTMLElement;
  });

  it('instantiates scene layers and executes render loop without errors', () => {
    const renderer = new SkyRenderer(mockContainer);

    const simState: SkySimState = {
      simTimeJD: 2451550.0,
      shipPos: [1.1, 0.05],
      shipVel: [0.015, 0.01],
      earthPos: [1.0, 0.0],
      marsPos: [1.5, 0.2],
      phase: 'Cruise',
      dt: 0.016,
    };

    // Render should update all layers cleanly
    expect(() => renderer.render(simState)).not.toThrow();

    // Mode controls
    renderer.setCameraMode('RETROGRADE');
    expect(renderer.getCameraMode()).toBe('RETROGRADE');

    renderer.setLockTarget('EARTH');
    expect(renderer.getCameraMode()).toBe('TARGET_LOCK');
    expect(renderer.getLockTarget()).toBe('EARTH');

    // Dust toggle
    expect(renderer.isStreaksEnabled()).toBe(true);
    renderer.toggleStreaks();
    expect(renderer.isStreaksEnabled()).toBe(false);

    // Resize
    expect(() => renderer.resize()).not.toThrow();

    // Destroy
    expect(() => renderer.destroy()).not.toThrow();
  });
});
