/**
 * AEGIS TRANSIT — Physical and Simulation Constants
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * All values are for simulation purposes only. No claims of flight heritage.
 * 
 * Sources noted inline. TODO: verify against JPL "Approximate Positions of the Planets"
 */

// === Fundamental Constants ===
/** Speed of light in m/s */
export const C_LIGHT = 299_792_458;
/** Speed of light in AU/s — derived: 1 AU / 499.005 s */
export const C_LIGHT_AU_S = 1 / 499.005;
/** Light-time for 1 AU in seconds */
export const LIGHT_TIME_1AU_S = 499.005;
/** Gravitational constant * Sun mass (m^3/s^2) — IAU 2015 nominal */
export const MU_SUN = 1.327_124_400_41e20;
/** GM Sun in AU^3/day^2 — Gaussian gravitational constant squared */
export const MU_SUN_AU3D2 = 2.959_122_082_855_91e-4;
/** 1 Astronomical Unit in meters — IAU 2012 exact */
export const AU_M = 1.495_978_707e11;
/** 1 Astronomical Unit in km */
export const AU_KM = 1.495_978_707e8;
/** Gravitational constant * Mars mass (m^3/s^2) */
export const MU_MARS = 4.282_837_14e13;
/** Mars sphere of influence radius in meters (~5.77e8 m) */
export const MARS_SOI_M = 5.772_4e8;
/** Mars radius in meters */
export const MARS_RADIUS_M = 3.389_5e6;
/** Earth radius in meters */
export const EARTH_RADIUS_M = 6.371_0e6;
/** Sun radius in meters */
export const SUN_RADIUS_M = 6.957_0e8;
/** Stefan-Boltzmann constant (W/m^2/K^4) */
export const SIGMA_SB = 5.670_374_419e-8;
/** Solar irradiance at 1 AU (W/m^2) — TSI */
export const SOLAR_IRRADIANCE_1AU = 1361;

// === Time Constants ===
/** Julian Date of J2000.0 epoch (2000 Jan 1.5 TDB) */
export const J2000_JD = 2_451_545.0;
/** Seconds per day */
export const SECONDS_PER_DAY = 86_400;
/** Days per Julian year */
export const DAYS_PER_YEAR = 365.25;

// === Planetary Orbital Elements (J2000 ecliptic, epoch J2000.0) ===
// Source: Standish (1992) via JPL "Approximate Positions of the Planets"
export interface OrbitalElements {
  /** Semi-major axis (AU) */
  a: number;
  /** Eccentricity */
  e: number;
  /** Mean longitude at epoch (degrees) */
  L0: number;
  /** Longitude of perihelion (degrees) */
  wbar: number;
  /** Orbital period (days) */
  period: number;
  /** Mean daily motion (degrees/day) */
  n: number;
  /** Body name */
  name: string;
  /** Body radius in meters */
  radius: number;
}

export const EARTH_ELEMENTS: OrbitalElements = {
  a: 1.000_002_61,
  e: 0.016_711_23,
  L0: 100.464_57,        // mean longitude at J2000 (deg)
  wbar: 102.937_68,      // longitude of perihelion (deg)
  period: 365.256,        // sidereal period (days)
  n: 360 / 365.256,      // mean motion (deg/day)
  name: 'Earth',
  radius: EARTH_RADIUS_M,
};

export const MARS_ELEMENTS: OrbitalElements = {
  a: 1.523_710_34,
  e: 0.093_394_10,
  L0: 355.446_60,
  wbar: 336.056_37,
  period: 686.980,
  n: 360 / 686.980,
  name: 'Mars',
  radius: MARS_RADIUS_M,
};

// === Communication Constants ===
/** Default solar exclusion angle for blackout (degrees) */
export const BLACKOUT_THETA_DEG = 2.0;
/** Earth-Mars synodic period (days) */
export const SYNODIC_PERIOD_DAYS = 779.94;
/** Illustrative downlink rate at 1 AU (bits/s) */
export const DOWNLINK_RATE_1AU = 500_000;
/** Illustrative uplink rate at 1 AU (bits/s) */
export const UPLINK_RATE_1AU = 100_000;

// === Subsystem Constants ===
/** Baseline cruise radiation dose rate (mSv/day) — ref: MSL RAD */
export const RAD_DOSE_CRUISE = 1.8;
/** Surface radiation dose rate (mSv/day) — ref: MSL RAD */
export const RAD_DOSE_SURFACE = 0.64;
/** Crew O2 consumption rate (kg/day per person) */
export const CREW_O2_RATE_KG_DAY = 0.84;
/** Crew CO2 production rate (kg/day per person) */
export const CREW_CO2_RATE_KG_DAY = 1.0;
/** Number of crew */
export const CREW_COUNT = 4;
/** Tier 2 compute active power (W) */
export const TIER2_POWER_ACTIVE_W = 25;
/** Tier 2 compute gated power (W) */
export const TIER2_POWER_GATED_W = 1;

// === Simulation Defaults ===
export const DEFAULT_WARP_PRESETS = [1, 10, 60, 600, 3600, 86400, 604800] as const;
export const MAX_SUBSYSTEM_WARP = 600;
export const SUBSYSTEM_TICK_HZ = 10;

// === Conversion Helpers ===
export function degToRad(deg: number): number { return deg * Math.PI / 180; }
export function radToDeg(rad: number): number { return rad * 180 / Math.PI; }
export function auToM(au: number): number { return au * AU_M; }
export function mToAu(m: number): number { return m / AU_M; }

/** Two-argument arctangent, normalized to [0, 2π) */
export function atan2Pos(y: number, x: number): number {
  const a = Math.atan2(y, x);
  return a < 0 ? a + 2 * Math.PI : a;
}
