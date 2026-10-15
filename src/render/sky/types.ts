/**
 * AEGIS TRANSIT — Sky Renderer Type Definitions
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Core types, interfaces, and coordinate scaling constants for the 3D celestial sky view.
 */

/** Coordinate scaling: 1 Astronomical Unit = 100 Three.js scene units */
export const AU_TO_SCENE = 100;

/**
 * Snapshot of astrodynamic simulation state passed to the SkyRenderer.
 * Strictly derived from physical simulation state.
 */
export interface SkySimState {
  /** Julian Date of current simulation time */
  simTimeJD: number;
  /** Spacecraft heliocentric position [x, y] in AU */
  shipPos: [number, number];
  /** Spacecraft heliocentric velocity [vx, vy] in AU/day */
  shipVel: [number, number];
  /** Earth heliocentric position [x, y] in AU */
  earthPos: [number, number];
  /** Mars heliocentric position [x, y] in AU */
  marsPos: [number, number];
  /** Active mission flight phase */
  phase?: string;
  /** Simulation delta time in seconds */
  dt?: number;
}

/** Alias for SkySimState to support standard naming */
export type SimState = SkySimState;

/**
 * Available camera tracking modes.
 */
export type CameraMode = 'FORWARD' | 'RETROGRADE' | 'TARGET_LOCK' | 'FREE_LOOK';

/**
 * Valid celestial targets for TARGET_LOCK camera mode.
 */
export type LockTarget = 'MARS' | 'EARTH' | 'SUN';

/**
 * Viewport edge indicator for celestial bodies outside the camera frustum.
 */
export interface OffscreenIndicator {
  /** Celestial body identifier */
  name: LockTarget;
  /** Screen position X in CSS pixels */
  screenX: number;
  /** Screen position Y in CSS pixels */
  screenY: number;
  /** Angle in radians pointing toward the off-screen body */
  angleRad: number;
  /** Distance to body in AU */
  distanceAU: number;
  /** Color theme for marker badge */
  color: string;
  /** Whether the body is currently off-screen and marker should be shown */
  visible: boolean;
}
