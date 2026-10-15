/**
 * AEGIS TRANSIT — Simulation Clock
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Manages mission elapsed time (MET), Julian Date progression, time warp factors,
 * pause state, and high-warp subsystem gating.
 */

import { DEFAULT_WARP_PRESETS, MAX_SUBSYSTEM_WARP, SECONDS_PER_DAY } from './constants.js';
import type { AlertLevel, WarpPreset } from '../core/types.js';

/**
 * Simulation clock maintaining simulation time, MET, and warp progression.
 */
export class SimClock {
  /** Current Julian Date */
  public simTimeJD: number;

  /** Mission Elapsed Time in seconds */
  public metSeconds: number;

  /** Current time warp multiplier */
  public warp: number;

  /** Whether the simulation clock is paused */
  public paused: boolean;

  /** Mission departure Julian Date */
  private startJD: number;

  /**
   * Initializes the simulation clock at a specific departure Julian Date.
   *
   * @param startJD Departure epoch Julian Date
   */
  constructor(startJD: number) {
    this.startJD = startJD;
    this.simTimeJD = startJD;
    this.metSeconds = 0;
    this.warp = 1;
    this.paused = false;
  }

  /**
   * Advances the simulation clock by wall-clock seconds scaled by current warp factor.
   *
   * @param wallDtSec Elapsed wall-clock time in seconds
   * @returns Elapsed simulation time in seconds (0 if paused)
   */
  tick(wallDtSec: number): number {
    if (this.paused || wallDtSec <= 0) {
      return 0;
    }

    const simDtSec = wallDtSec * this.warp;
    this.metSeconds += simDtSec;
    this.simTimeJD = this.startJD + (this.metSeconds / SECONDS_PER_DAY);
    return simDtSec;
  }

  /**
   * Sets the time warp factor, snapping/clamping to valid presets.
   *
   * @param w Target warp factor
   */
  setWarp(w: number): void {
    const presets = DEFAULT_WARP_PRESETS;
    if (presets.includes(w as WarpPreset)) {
      this.warp = w;
      return;
    }

    // Find nearest preset
    let closest: number = presets[0];
    let minDiff = Math.abs(w - closest);
    for (const p of presets) {
      const diff = Math.abs(w - p);
      if (diff < minDiff) {
        minDiff = diff;
        closest = p;
      }
    }
    this.warp = closest;
  }

  /**
   * Steps to the next higher warp preset.
   *
   * @returns The updated warp factor
   */
  warpUp(): number {
    const idx = (DEFAULT_WARP_PRESETS as readonly number[]).indexOf(this.warp);
    if (idx >= 0 && idx < DEFAULT_WARP_PRESETS.length - 1) {
      this.warp = DEFAULT_WARP_PRESETS[idx + 1];
    } else if (idx === -1) {
      this.setWarp(this.warp);
    }
    return this.warp;
  }

  /**
   * Steps to the next lower warp preset.
   *
   * @returns The updated warp factor
   */
  warpDown(): number {
    const idx = (DEFAULT_WARP_PRESETS as readonly number[]).indexOf(this.warp);
    if (idx > 0) {
      this.warp = DEFAULT_WARP_PRESETS[idx - 1];
    } else if (idx === -1) {
      this.setWarp(this.warp);
    }
    return this.warp;
  }

  /**
   * Pauses simulation time advancement.
   */
  pause(): void {
    this.paused = true;
  }

  /**
   * Resumes simulation time advancement.
   */
  resume(): void {
    this.paused = false;
  }

  /**
   * Toggles pause state.
   */
  togglePause(): void {
    this.paused = !this.paused;
  }

  /**
   * Drops warp factor immediately to 1x real-time.
   */
  dropTo1x(): void {
    this.warp = 1;
  }

  /**
   * Auto-drops warp to 1x if an alert is CAUTION, WARNING, or CRITICAL.
   *
   * @param level Subsystem alert level
   */
  handleAlert(level: AlertLevel): void {
    if (level === 'CAUTION' || level === 'WARNING' || level === 'CRITICAL') {
      this.dropTo1x();
    }
  }

  /**
   * Indicates whether high-fidelity subsystems should be actively integrated.
   * Subsystems pause at high warp (> MAX_SUBSYSTEM_WARP = 600x).
   */
  get subsystemsActive(): boolean {
    return this.warp <= MAX_SUBSYSTEM_WARP;
  }
}
