/**
 * AEGIS TRANSIT — Spacecraft Environment Profiles
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Defines the 5 spacecraft environment profiles for the Dynamic Situational
 * Memory system. Each profile contains environmental measurements (simulated)
 * and adaptive configuration parameters.
 * 
 * All measurement values are illustrative simulation data — not certified
 * spacecraft engineering specifications.
 */

// ============================================================================
// Types
// ============================================================================

/** Valid spacecraft operating environments */
export type SpacecraftEnvironment =
  | 'EarthOrbit'
  | 'LunarOrbit'
  | 'InterplanetaryCruise'
  | 'MarsOrbit'
  | 'MarsSurface';

/** Environmental sensor measurements (all simulated) */
export interface EnvironmentMeasurements {
  /** Solar irradiance in W/m² */
  solarIrradiance: number;
  /** Simulated thermal reading in Kelvin */
  thermalReading: number;
  /** Simulated radiation index (arbitrary units) */
  radiationIndex: number;
  /** Solar power availability as percentage */
  solarPowerAvailability: number;
  /** Communication one-way latency in milliseconds (fixed demo approximation) */
  commLatencyMs: number;
  /** Power reserve as percentage */
  powerReserve: number;
}

/** Adaptive operational configuration */
export interface AdaptiveConfiguration {
  navigationProfile: string;
  communicationMode: string;
  thermalMode: string;
  propulsionMode: string;
  powerMode: string;
  radiationMode: string;
  instrumentMode: string;
}

/** Complete environment profile */
export interface EnvironmentProfile {
  environment: SpacecraftEnvironment;
  displayName: string;
  profileName: string;
  version: string;
  measurements: EnvironmentMeasurements;
  configuration: AdaptiveConfiguration;
  checksum: string;
}

/** Permanent (immutable) memory region */
export interface PermanentMemoryRegion {
  regionId: 'R0' | 'R1';
  name: string;
  contents: string[];
  checksum: string;
  writeProtected: boolean;
  integrityPercent: number;
  lastVerified: number;
}

/** Diff entry between two profiles */
export interface ProfileDiffEntry {
  parameter: string;
  previousValue: string;
  newValue: string;
  changed: boolean;
  category: 'measurement' | 'configuration';
}

// ============================================================================
// Deterministic Hashing (FNV-1a)
// ============================================================================

function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/** Compute a deterministic checksum for a profile */
export function computeProfileChecksum(
  profile: Omit<EnvironmentProfile, 'checksum'>
): string {
  const data = JSON.stringify({
    e: profile.environment,
    n: profile.profileName,
    v: profile.version,
    m: profile.measurements,
    c: profile.configuration,
  });
  const h = fnv1a(data);
  return h.repeat(8);
}

// ============================================================================
// Permanent Memory
// ============================================================================

const PM_TIMESTAMP = Date.now();

export const PERMANENT_MEMORY: PermanentMemoryRegion[] = [
  {
    regionId: 'R0',
    name: 'GOLDEN ROM',
    contents: [
      'Physical constants',
      'Core spacecraft safety rules',
      'Emergency recovery procedures',
      'Crew medical emergency protocols',
      'Fundamental system configuration',
      'Protected authentication metadata',
      'Emergency communication procedures',
    ],
    checksum: fnv1a('R0_GOLDEN_ROM_AEGIS_TRANSIT_v1').repeat(8),
    writeProtected: true,
    integrityPercent: 100,
    lastVerified: PM_TIMESTAMP,
  },
  {
    regionId: 'R1',
    name: 'PROTECTED RECOVERY DATA',
    contents: [
      'Recovery instructions',
      'Recovery configuration',
      'Backup verification metadata',
      'System restoration procedures',
    ],
    checksum: fnv1a('R1_PROTECTED_RECOVERY_AEGIS_TRANSIT_v1').repeat(8),
    writeProtected: true,
    integrityPercent: 100,
    lastVerified: PM_TIMESTAMP,
  },
];

// ============================================================================
// Environment Profiles
// ============================================================================

function buildProfile(
  environment: SpacecraftEnvironment,
  displayName: string,
  profileName: string,
  version: string,
  measurements: EnvironmentMeasurements,
  configuration: AdaptiveConfiguration
): EnvironmentProfile {
  const partial = { environment, displayName, profileName, version, measurements, configuration };
  return { ...partial, checksum: computeProfileChecksum(partial) };
}

export const ENVIRONMENT_PROFILES: Record<SpacecraftEnvironment, EnvironmentProfile> = {
  EarthOrbit: buildProfile(
    'EarthOrbit', 'Earth Orbit', 'EARTH_ORBIT_PROFILE', '1.0',
    { solarIrradiance: 1361, thermalReading: 290, radiationIndex: 25, solarPowerAvailability: 100, commLatencyMs: 10, powerReserve: 85 },
    { navigationProfile: 'EARTH_ORBIT_NAV', communicationMode: 'EARTH_RELAY', thermalMode: 'EARTH_THERMAL', propulsionMode: 'ORBITAL', powerMode: 'NORMAL_POWER', radiationMode: 'STANDARD_MONITOR', instrumentMode: 'EARTH_OBSERVATION' }
  ),
  LunarOrbit: buildProfile(
    'LunarOrbit', 'Lunar Orbit', 'LUNAR_ORBIT_PROFILE', '1.2',
    { solarIrradiance: 1361, thermalReading: 285, radiationIndex: 40, solarPowerAvailability: 95, commLatencyMs: 1300, powerReserve: 80 },
    { navigationProfile: 'LUNAR_NAV', communicationMode: 'LUNAR_RELAY', thermalMode: 'LUNAR_THERMAL', propulsionMode: 'LUNAR_TRANSFER', powerMode: 'LUNAR_POWER', radiationMode: 'ENHANCED_MONITOR', instrumentMode: 'LUNAR_SCAN' }
  ),
  InterplanetaryCruise: buildProfile(
    'InterplanetaryCruise', 'Interplanetary Cruise', 'CRUISE_PROFILE', '1.5',
    { solarIrradiance: 1000, thermalReading: 280, radiationIndex: 55, solarPowerAvailability: 75, commLatencyMs: 600000, powerReserve: 75 },
    { navigationProfile: 'CRUISE_NAV', communicationMode: 'DEEP_SPACE', thermalMode: 'CRUISE_THERMAL', propulsionMode: 'CRUISE', powerMode: 'CRUISE_POWER', radiationMode: 'DEEP_SPACE_MONITOR', instrumentMode: 'CRUISE_SCIENCE' }
  ),
  MarsOrbit: buildProfile(
    'MarsOrbit', 'Mars Orbit', 'MARS_ORBIT_PROFILE', '2.1',
    { solarIrradiance: 590, thermalReading: 275, radiationIndex: 65, solarPowerAvailability: 60, commLatencyMs: 720000, powerReserve: 70 },
    { navigationProfile: 'MARS_ORBIT_NAV', communicationMode: 'MARS_RELAY', thermalMode: 'MARS_THERMAL', propulsionMode: 'ORBITAL_INSERTION', powerMode: 'MARS_POWER', radiationMode: 'HIGH_ALERT_MONITOR', instrumentMode: 'MARS_MAPPING' }
  ),
  MarsSurface: buildProfile(
    'MarsSurface', 'Mars Surface', 'MARS_SURFACE_PROFILE', '2.3',
    { solarIrradiance: 590, thermalReading: 270, radiationIndex: 70, solarPowerAvailability: 55, commLatencyMs: 720000, powerReserve: 65 },
    { navigationProfile: 'MARS_SURFACE_NAV', communicationMode: 'MARS_RELAY', thermalMode: 'SURFACE_THERMAL', propulsionMode: 'SURFACE_DESCENT', powerMode: 'SURFACE_POWER', radiationMode: 'HIGH_ALERT_MONITOR', instrumentMode: 'SURFACE_SCIENCE' }
  ),
};

// ============================================================================
// Helpers
// ============================================================================

export function getEnvironmentDisplayName(env: SpacecraftEnvironment): string {
  return ENVIRONMENT_PROFILES[env].displayName;
}

export function getAllEnvironments(): SpacecraftEnvironment[] {
  return ['EarthOrbit', 'LunarOrbit', 'InterplanetaryCruise', 'MarsOrbit', 'MarsSurface'];
}

const MEAS_LABELS: Record<keyof EnvironmentMeasurements, [string, string]> = {
  solarIrradiance: ['Solar Irradiance', 'W/m²'],
  thermalReading: ['Thermal Reading (sim)', 'K'],
  radiationIndex: ['Radiation Index (sim)', 'units'],
  solarPowerAvailability: ['Solar Power Availability', '%'],
  commLatencyMs: ['Comm Latency (demo approx)', 'ms'],
  powerReserve: ['Power Reserve', '%'],
};

const CFG_LABELS: Record<keyof AdaptiveConfiguration, string> = {
  navigationProfile: 'Navigation Profile',
  communicationMode: 'Communication Mode',
  thermalMode: 'Thermal Mode',
  propulsionMode: 'Propulsion Mode',
  powerMode: 'Power Mode',
  radiationMode: 'Radiation Mode',
  instrumentMode: 'Instrument Mode',
};

/** Compute a full diff between two environment profiles */
export function computeDiff(
  oldProfile: EnvironmentProfile,
  newProfile: EnvironmentProfile
): ProfileDiffEntry[] {
  const entries: ProfileDiffEntry[] = [];

  // Environment name
  entries.push({
    parameter: 'Environment',
    previousValue: oldProfile.displayName,
    newValue: newProfile.displayName,
    changed: oldProfile.environment !== newProfile.environment,
    category: 'configuration',
  });

  // Profile name
  entries.push({
    parameter: 'Active Profile',
    previousValue: oldProfile.profileName,
    newValue: newProfile.profileName,
    changed: oldProfile.profileName !== newProfile.profileName,
    category: 'configuration',
  });

  // Measurements
  for (const key of Object.keys(MEAS_LABELS) as (keyof EnvironmentMeasurements)[]) {
    const [label, unit] = MEAS_LABELS[key];
    const oldVal = oldProfile.measurements[key];
    const newVal = newProfile.measurements[key];
    entries.push({
      parameter: label,
      previousValue: `${oldVal.toLocaleString()} ${unit}`,
      newValue: `${newVal.toLocaleString()} ${unit}`,
      changed: oldVal !== newVal,
      category: 'measurement',
    });
  }

  // Configuration
  for (const key of Object.keys(CFG_LABELS) as (keyof AdaptiveConfiguration)[]) {
    const label = CFG_LABELS[key];
    const oldVal = oldProfile.configuration[key];
    const newVal = newProfile.configuration[key];
    entries.push({
      parameter: label,
      previousValue: oldVal,
      newValue: newVal,
      changed: oldVal !== newVal,
      category: 'configuration',
    });
  }

  return entries;
}
