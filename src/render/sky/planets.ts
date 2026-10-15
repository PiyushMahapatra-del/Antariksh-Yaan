/**
 * AEGIS TRANSIT — Planetary Bodies (Earth & Mars)
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Renders Earth and Mars as physically positioned, physically sized celestial spheres.
 * Custom GLSL shaders calculate procedural surface terrain via 3D fractal brownian motion (fBm),
 * real heliocentric phase lighting (Sun-directed day/night terminator), limb darkening,
 * and atmospheric Rayleigh/dust rim scattering.
 * 
 * Includes beacon flare cross-fading so distant planets appear as bright navigational "dots"
 * that seamlessly resolve into textured, lit planetary discs on approach.
 */

import * as THREE from 'three';
import {
  EARTH_RADIUS_M,
  MARS_RADIUS_M,
  AU_M,
} from '@sim/constants';
import { AU_TO_SCENE } from './types';

/** Common GLSL 3D Simplex & fBm Noise routines */
const GLSL_COMMON_NOISE = /* glsl */ `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  float fbm(vec3 p) {
    float val = 0.0;
    float amp = 0.5;
    vec3 q = p;
    for (int i = 0; i < 4; i++) {
      val += amp * (0.5 + 0.5 * snoise(q));
      q *= 2.05;
      amp *= 0.5;
    }
    return val;
  }
`;

/** Vertex shader shared by Earth and Mars */
const PLANET_VERTEX_SHADER = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vObjectPos;
  varying vec3 vWorldPos;
  varying vec3 vViewDir;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vObjectPos = position;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

/** Earth procedural fragment shader */
const EARTH_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uSunDir;
  uniform float uTime;

  varying vec3 vNormal;
  varying vec3 vObjectPos;
  varying vec3 vWorldPos;
  varying vec3 vViewDir;

  ${GLSL_COMMON_NOISE}

  void main() {
    // 1. Surface terrain via 3D fBm
    float elev = fbm(vObjectPos * 2.2);

    vec3 albedo;
    float isWater = 0.0;

    if (elev < 0.48) {
      // Ocean: deep ocean to coastal shallows
      isWater = 1.0;
      float depth = smoothstep(0.2, 0.48, elev);
      albedo = mix(vec3(0.015, 0.08, 0.22), vec3(0.04, 0.22, 0.32), depth);
    } else {
      // Continents: lowlands, arid plateaus, mountains
      float landElev = smoothstep(0.48, 0.85, elev);
      vec3 greenLand = vec3(0.12, 0.26, 0.09);
      vec3 aridLand = vec3(0.36, 0.28, 0.16);
      vec3 mountain = vec3(0.75, 0.78, 0.82);

      if (landElev < 0.5) {
        albedo = mix(greenLand, aridLand, landElev * 2.0);
      } else {
        albedo = mix(aridLand, mountain, (landElev - 0.5) * 2.0);
      }
    }

    // 2. Dynamic clouds layer (swirling wisps)
    vec3 cloudCoord = vObjectPos * 3.6 + vec3(uTime * 0.015, 0.0, uTime * 0.005);
    float cloudNoise = fbm(cloudCoord);
    float cloud = smoothstep(0.50, 0.74, cloudNoise);
    albedo = mix(albedo, vec3(0.95, 0.98, 1.0), cloud * 0.9);

    // 3. Phase lighting from Sun direction
    float NdotL = dot(vNormal, uSunDir);
    float diff = max(0.0, NdotL);

    // Ocean specular reflection (sun glint)
    if (isWater > 0.5 && diff > 0.0) {
      vec3 halfVec = normalize(uSunDir + vViewDir);
      float spec = pow(max(0.0, dot(vNormal, halfVec)), 32.0);
      albedo += vec3(1.0, 0.95, 0.8) * spec * (1.0 - cloud) * 0.8;
    }

    // 4. Limb darkening
    float mu = max(0.0, dot(vNormal, vViewDir));
    float limbDark = 1.0 - 0.35 * (1.0 - mu);

    // 5. Electric blue atmosphere rim glow (Rayleigh scattering)
    float rim = pow(1.0 - mu, 3.2) * max(0.04, NdotL + 0.25);
    vec3 atmoColor = vec3(0.18, 0.55, 1.0) * rim * 1.5;

    // Diffuse lighting + night-side ambient starlight
    vec3 litColor = albedo * (diff * limbDark + 0.03) + atmoColor;

    gl_FragColor = vec4(litColor, 1.0);
  }
`;

/** Mars procedural fragment shader */
const MARS_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uSunDir;
  uniform float uTime;

  varying vec3 vNormal;
  varying vec3 vObjectPos;
  varying vec3 vWorldPos;
  varying vec3 vViewDir;

  ${GLSL_COMMON_NOISE}

  void main() {
    // 1. Martian topography via 3D fBm
    float terrain = fbm(vObjectPos * 2.6);

    // Albedo base: rich rust-ochre
    vec3 rustBright = vec3(0.82, 0.40, 0.16);
    vec3 rustDark = vec3(0.60, 0.24, 0.09);
    vec3 albedo = mix(rustDark, rustBright, terrain);

    // Dark volcanic basalt patches (Syrtis Major style)
    float darkPatch = smoothstep(0.42, 0.28, terrain);
    vec3 basalt = vec3(0.24, 0.13, 0.08);
    albedo = mix(albedo, basalt, darkPatch * 0.75);

    // 2. Polar ice caps (North & South poles)
    float poleDist = abs(vObjectPos.y);
    float iceBorder = 0.80 + 0.05 * snoise(vObjectPos * 6.0);
    float ice = smoothstep(iceBorder, iceBorder + 0.06, poleDist);
    vec3 polarFrost = vec3(0.92, 0.95, 0.98);
    albedo = mix(albedo, polarFrost, ice);

    // 3. Phase lighting from Sun direction
    float NdotL = dot(vNormal, uSunDir);
    float diff = max(0.0, NdotL);

    // 4. Limb darkening
    float mu = max(0.0, dot(vNormal, vViewDir));
    float limbDark = 1.0 - 0.28 * (1.0 - mu);

    // 5. Faint dusty atmospheric haze rim
    float rim = pow(1.0 - mu, 4.0) * max(0.04, NdotL + 0.2);
    vec3 atmoHaze = vec3(0.78, 0.48, 0.35) * rim * 1.1;

    // Diffuse lighting + night-side starlight
    vec3 litColor = albedo * (diff * limbDark + 0.02) + atmoHaze;

    gl_FragColor = vec4(litColor, 1.0);
  }
`;

/**
 * Creates procedural circular dot texture for navigational point beacon.
 */
function createPlanetDotTexture(colorHex: string): THREE.CanvasTexture | null {
  if (typeof document === 'undefined' || !document.createElement) {
    return null;
  }

  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return null;
  }

  const center = size / 2;
  const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
  grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
  grad.addColorStop(0.25, colorHex);
  grad.addColorStop(0.7, colorHex.replace(/[\d.]+\)$/, '0.2)'));
  grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export type PlanetType = 'EARTH' | 'MARS';

/**
 * Planetary body component supporting physical angular scaling, 3D fBm shaders,
 * and distant beacon dot cross-fading.
 */
export class PlanetBody {
  public group: THREE.Group;
  public type: PlanetType;
  public physicalRadiusM: number;
  public sceneRadius: number;

  private sphereMesh: THREE.Mesh;
  private material: THREE.ShaderMaterial;
  private beaconSprite: THREE.Sprite;
  private beaconTexture: THREE.CanvasTexture | null = null;

  constructor(type: PlanetType) {
    this.type = type;
    this.physicalRadiusM = type === 'EARTH' ? EARTH_RADIUS_M : MARS_RADIUS_M;
    this.sceneRadius = (this.physicalRadiusM / AU_M) * AU_TO_SCENE;

    this.group = new THREE.Group();
    this.group.name = `Planet_${type}`;

    // 1. Procedural 3D Lit Sphere
    const sphereGeo = new THREE.SphereGeometry(1.0, 48, 24);
    const fragmentShader = type === 'EARTH' ? EARTH_FRAGMENT_SHADER : MARS_FRAGMENT_SHADER;

    this.material = new THREE.ShaderMaterial({
      vertexShader: PLANET_VERTEX_SHADER,
      fragmentShader,
      uniforms: {
        uSunDir: { value: new THREE.Vector3(1, 0, 0) },
        uTime: { value: 0.0 },
      },
    });

    this.sphereMesh = new THREE.Mesh(sphereGeo, this.material);
    this.sphereMesh.name = `${type}_Surface`;
    this.group.add(this.sphereMesh);

    // 2. Distant Navigational Beacon Point
    const dotColor = type === 'EARTH' ? 'rgba(0, 229, 255, 0.95)' : 'rgba(255, 120, 50, 0.95)';
    this.beaconTexture = createPlanetDotTexture(dotColor);

    const spriteMat = new THREE.SpriteMaterial({
      map: this.beaconTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 1.0,
    });

    this.beaconSprite = new THREE.Sprite(spriteMat);
    this.beaconSprite.name = `${type}_Beacon`;
    this.group.add(this.beaconSprite);
  }

  /**
   * Updates planet position, apparent size, and illumination geometry from simulation state.
   * 
   * @param bodyPos Heliocentric position of this planet [x, y] in AU
   * @param shipPos Heliocentric position of spacecraft [x, y] in AU
   * @param timeSec Simulation elapsed time in seconds
   * @param camera Active perspective camera for pixel-size calculations
   */
  public update(
    bodyPos: [number, number],
    shipPos: [number, number],
    timeSec: number,
    camera: THREE.PerspectiveCamera
  ): void {
    // Relative position in scene coordinates
    const rx = (bodyPos[0] - shipPos[0]) * AU_TO_SCENE;
    const ry = 0.0;
    const rz = -(bodyPos[1] - shipPos[1]) * AU_TO_SCENE;

    this.group.position.set(rx, ry, rz);

    // Distance to body in scene units
    const distScene = Math.hypot(rx, rz);
    const distAU = distScene / AU_TO_SCENE;
    const distM = distAU * AU_M;

    // Physical angular radius: atan(R / d)
    const angularRadiusRad = Math.atan(this.physicalRadiusM / distM);

    // Apparent screen pixel radius on active viewport
    const fovRad = (camera.fov * Math.PI) / 180.0;
    const viewportHeightPx = typeof window !== 'undefined' ? window.innerHeight : 800;
    const apparentPixelRadius = (angularRadiusRad / (fovRad / 2.0)) * (viewportHeightPx / 2.0);

    // 1. Minimum visual sphere scale to prevent subpixel rasterizer dropout
    // When far away, ensure sphere maintains at least 2 pixels so shaders remain active
    const minPixelRadius = 2.0;
    const minAngularRadius = (minPixelRadius / (viewportHeightPx / 2.0)) * (fovRad / 2.0);
    const effectiveAngularRadius = Math.max(angularRadiusRad, minAngularRadius);
    const visualSceneRadius = Math.max(this.sceneRadius, distScene * Math.tan(effectiveAngularRadius));

    this.sphereMesh.scale.set(visualSceneRadius, visualSceneRadius, visualSceneRadius);

    // 2. Beacon Sprite Cross-fade:
    // When apparent disk is small (< 8px), beacon dot is prominent.
    // As spacecraft approaches and disk expands (> 8px), beacon fades out completely.
    const beaconFade = Math.max(0.0, Math.min(1.0, 1.0 - (apparentPixelRadius - 2.0) / 7.0));
    this.beaconSprite.material.opacity = beaconFade;
    this.beaconSprite.visible = beaconFade > 0.01;

    // Beacon size scales smoothly in scene units
    const beaconSize = Math.max(0.08, distScene * 0.012);
    this.beaconSprite.scale.set(beaconSize, beaconSize, 1.0);

    // 3. Sun direction vector from planet center
    // Sun is at heliocentric origin (0, 0), so vector from planet to Sun is (-bodyPos[0], -bodyPos[1])
    const sunDirLen = Math.hypot(bodyPos[0], bodyPos[1]);
    if (sunDirLen > 1e-8) {
      // In 3D scene: X = -bodyPos[0], Y = 0, Z = bodyPos[1]
      const lx = -bodyPos[0] / sunDirLen;
      const ly = 0.0;
      const lz = bodyPos[1] / sunDirLen;
      this.material.uniforms.uSunDir.value.set(lx, ly, lz);
    }

    // 4. Update time uniform for cloud/terrain animation
    this.material.uniforms.uTime.value = timeSec;
  }

  /**
   * Gets current world position of the planet.
   */
  public getPosition(): THREE.Vector3 {
    return this.group.position;
  }

  /**
   * Physical angular diameter in radians from current viewpoint.
   */
  public getAngularDiameterRad(shipPos: [number, number], bodyPos: [number, number]): number {
    const distAU = Math.hypot(bodyPos[0] - shipPos[0], bodyPos[1] - shipPos[1]);
    const distM = distAU * AU_M;
    return 2.0 * Math.atan(this.physicalRadiusM / distM);
  }

  /**
   * Disposes geometries, materials, and textures.
   */
  public destroy(): void {
    this.sphereMesh.geometry.dispose();
    this.material.dispose();
    if (this.beaconTexture) {
      this.beaconTexture.dispose();
    }
    this.beaconSprite.material.dispose();
  }
}
