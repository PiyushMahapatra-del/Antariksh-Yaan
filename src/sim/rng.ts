/**
 * AEGIS TRANSIT — Seeded PRNG and Core Utilities
 * 
 * Uses mulberry32 for reproducible pseudo-random numbers.
 * Every random value in the simulation flows through this.
 */

/**
 * Mulberry32 seeded PRNG.
 * Returns a function that produces uniform [0, 1) on each call.
 */
export function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A seeded RNG instance with convenience methods.
 */
export class SeededRng {
  private _next: () => number;
  public readonly seed: number;

  constructor(seed: number = 42) {
    this.seed = seed;
    this._next = mulberry32(seed);
  }

  /** Uniform [0, 1) */
  random(): number {
    return this._next();
  }

  /** Uniform [min, max) */
  range(min: number, max: number): number {
    return min + this._next() * (max - min);
  }

  /** Integer in [min, max] inclusive */
  randInt(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  /** Gaussian via Box-Muller, mean μ, std σ */
  gaussian(mu: number = 0, sigma: number = 1): number {
    const u1 = this._next();
    const u2 = this._next();
    const z = Math.sqrt(-2 * Math.log(u1 || 1e-20)) * Math.cos(2 * Math.PI * u2);
    return mu + sigma * z;
  }

  /** Pick one element from array */
  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this._next() * arr.length)];
  }

  /** Fisher-Yates shuffle (in place) */
  shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this._next() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}

/** Global simulation RNG — seed 42 for reproducibility */
export const simRng = new SeededRng(42);
