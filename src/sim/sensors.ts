/**
 * AEGIS TRANSIT — Sensor Modeling Subsystem
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Applies stochastic sensor modeling (Gaussian noise, quantization,
 * bias drift, dropout, and stuck-at values) to true physical state.
 */

import type { SensorReading } from '../core/types.js';
import type { SeededRng } from './rng.js';

export interface SensorConfig {
  /** Gaussian noise standard deviation (0 for noiseless) */
  noiseSigma: number;
  /** Quantization step size (0 = continuous / no quantization) */
  quantization: number;
  /** Bias drift rate per second */
  biasDrift: number;
  /** Probability of dropout per reading [0, 1] */
  dropoutProb: number;
  /** If non-null, sensor is stuck at this value */
  stuckValue: number | null;
  /** Minimum clamped value for measurement (e.g. 0 for Euclidean norm/distance) */
  min?: number;
  /** Maximum clamped value for measurement */
  max?: number;
}

/**
 * Sensor hardware simulation model.
 * Injects noise, drift, quantization, dropout, and hardware stuck faults.
 */
export class SensorModel {
  private bias: number = 0;
  private stuck: boolean = false;
  private stuckValue: number = 0;
  private lastMeasured: number = 0;
  private initialized: boolean = false;

  constructor(public config: SensorConfig, private rng: SeededRng) {
    if (config.stuckValue !== null) {
      this.stuck = true;
      this.stuckValue = config.stuckValue;
    }
  }

  /**
   * Applies sensor effects to a true physical value.
   *
   * @param trueValue Uncorrupted physical simulation value
   * @param dtSec Elapsed delta time in seconds (for bias drift integration)
   * @param timestampJD Simulation timestamp in Julian Date
   * @returns SensorReading with raw and measured values
   */
  read(trueValue: number, dtSec: number, timestampJD: number = 0): SensorReading {
    if (!this.initialized) {
      let initVal = trueValue;
      if (this.config.min !== undefined) initVal = Math.max(this.config.min, initVal);
      if (this.config.max !== undefined) initVal = Math.min(this.config.max, initVal);
      this.lastMeasured = initVal;
      this.initialized = true;
    }

    // 1. If stuck, return stuck value with status 'STUCK'
    if (this.stuck || this.config.stuckValue !== null) {
      let val = this.stuck ? this.stuckValue : (this.config.stuckValue as number);
      if (this.config.min !== undefined) val = Math.max(this.config.min, val);
      if (this.config.max !== undefined) val = Math.min(this.config.max, val);
      this.lastMeasured = val;
      return {
        raw: trueValue,
        measured: val,
        status: 'STUCK',
        timestamp: timestampJD,
      };
    }

    // 2. Check dropout probability, if hit return last value with status 'DROPOUT'
    if (this.config.dropoutProb > 0 && this.rng.random() < this.config.dropoutProb) {
      let val = this.lastMeasured;
      if (this.config.min !== undefined) val = Math.max(this.config.min, val);
      if (this.config.max !== undefined) val = Math.min(this.config.max, val);
      return {
        raw: trueValue,
        measured: val,
        status: 'DROPOUT',
        timestamp: timestampJD,
      };
    }

    // 3. Add Gaussian noise: measured = true + noise(sigma)
    const noise = this.config.noiseSigma > 0 ? this.rng.gaussian(0, this.config.noiseSigma) : 0;
    let measured = trueValue + noise;

    // 4. Add bias: measured += bias (bias drifts: bias += biasDrift * dt)
    this.bias += this.config.biasDrift * dtSec;
    measured += this.bias;

    // 5. Quantize: measured = round(measured / quantization) * quantization (if quantization > 0)
    if (this.config.quantization > 0) {
      measured = Math.round(measured / this.config.quantization) * this.config.quantization;
    }

    // 6. Physical boundary clamp (e.g., reported distances can never be below 0)
    if (this.config.min !== undefined) {
      measured = Math.max(this.config.min, measured);
    }
    if (this.config.max !== undefined) {
      measured = Math.min(this.config.max, measured);
    }

    this.lastMeasured = measured;

    // 7. Return {raw: trueValue, measured, status: 'OK', timestamp}
    return {
      raw: trueValue,
      measured,
      status: 'OK',
      timestamp: timestampJD,
    };
  }

  /**
   * Injects a stuck-at value hardware fault.
   */
  setStuck(value: number): void {
    this.stuck = true;
    this.stuckValue = value;
    this.config.stuckValue = value;
  }

  /**
   * Clears any stuck-at fault.
   */
  clearStuck(): void {
    this.stuck = false;
    this.config.stuckValue = null;
  }

  /**
   * Returns whether the sensor is currently stuck.
   */
  isStuck(): boolean {
    return this.stuck || this.config.stuckValue !== null;
  }

  /**
   * Resets the accumulated bias drift to zero.
   */
  resetBias(): void {
    this.bias = 0;
  }

  /**
   * Returns current accumulated bias.
   */
  getBias(): number {
    return this.bias;
  }
}
