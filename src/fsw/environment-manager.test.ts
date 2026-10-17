/**
 * AEGIS TRANSIT — Environment Manager & Dynamic Memory Unit Tests
 * 
 * Tests:
 * Test A: Earth to Mars transition
 * Test B: Mars to Earth transition
 * Test C: All other environments (Lunar Orbit, Interplanetary Cruise, Mars Surface)
 * Test D: Profile validation failure and rejection
 * Test E: Simulated bit-flip fault injection & golden image restoration
 * Test F: Reset & repeatability
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EnvironmentManager } from './environment-manager.js';
import {
  ENVIRONMENT_PROFILES,
  getAllEnvironments,
  computeDiff,
} from './environment-profiles.js';

describe('EnvironmentManager & Dynamic Situational Memory', () => {
  let manager: EnvironmentManager;

  beforeEach(() => {
    manager = new EnvironmentManager();
  });

  it('initializes at Earth Orbit with verified permanent memory', () => {
    expect(manager.currentEnvironment).toBe('EarthOrbit');
    expect(manager.activeProfile.profileName).toBe('EARTH_ORBIT_PROFILE');
    expect(manager.previousProfile).toBeNull();
    expect(manager.permanentMemory.length).toBe(2);

    const permCheck = manager.verifyPermanentMemory();
    expect(permCheck.allValid).toBe(true);
    expect(permCheck.results.length).toBe(2);
    expect(manager.auditLog.length).toBeGreaterThan(0);
  });

  it('Test A: transitions from Earth Orbit to Mars Orbit with real diff and immutable permanent memory', () => {
    const initialPerm = manager.permanentMemory.map(r => ({ ...r }));

    const result = manager.transitionImmediate('MarsOrbit');
    expect(result.success).toBe(true);
    expect(result.fromEnvironment).toBe('EarthOrbit');
    expect(result.toEnvironment).toBe('MarsOrbit');
    expect(result.verificationPassed).toBe(true);
    expect(result.validationPassed).toBe(true);
    expect(result.changedParameterCount).toBeGreaterThan(0);

    // Active profile updated
    expect(manager.currentEnvironment).toBe('MarsOrbit');
    expect(manager.activeProfile.profileName).toBe('MARS_ORBIT_PROFILE');
    expect(manager.activeProfile.measurements.solarIrradiance).toBe(590);
    expect(manager.activeProfile.configuration.navigationProfile).toBe('MARS_ORBIT_NAV');

    // Previous profile preserved
    expect(manager.previousProfile).not.toBeNull();
    expect(manager.previousProfile!.profileName).toBe('EARTH_ORBIT_PROFILE');

    // Permanent memory is strictly unchanged
    const currentPerm = manager.permanentMemory;
    expect(currentPerm.length).toBe(initialPerm.length);
    for (let i = 0; i < currentPerm.length; i++) {
      expect(currentPerm[i].checksum).toBe(initialPerm[i].checksum);
      expect(currentPerm[i].integrityPercent).toBe(100);
      expect(currentPerm[i].writeProtected).toBe(true);
    }
    expect(manager.verifyPermanentMemory().allValid).toBe(true);

    // Audit log records transition
    const lastLog = manager.auditLog[manager.auditLog.length - 1];
    expect(lastLog.type).toBe('TRANSITION');
    expect(lastLog.success).toBe(true);
    expect(lastLog.fromEnvironment).toBe('EarthOrbit');
    expect(lastLog.toEnvironment).toBe('MarsOrbit');
  });

  it('Test B: transitions from Mars Orbit back to Earth Orbit with previous state as Mars', () => {
    manager.transitionImmediate('MarsOrbit');
    expect(manager.currentEnvironment).toBe('MarsOrbit');

    const result = manager.transitionImmediate('EarthOrbit');
    expect(result.success).toBe(true);
    expect(result.fromEnvironment).toBe('MarsOrbit');
    expect(result.toEnvironment).toBe('EarthOrbit');
    expect(manager.activeProfile.profileName).toBe('EARTH_ORBIT_PROFILE');
    expect(manager.activeProfile.measurements.solarIrradiance).toBe(1361);
    expect(manager.activeProfile.configuration.navigationProfile).toBe('EARTH_ORBIT_NAV');
    expect(manager.previousProfile!.profileName).toBe('MARS_ORBIT_PROFILE');
    expect(manager.verifyPermanentMemory().allValid).toBe(true);
  });

  it('Test C: supports all five operational environments with distinct profiles', () => {
    const envs = getAllEnvironments();
    expect(envs.length).toBe(5);

    for (const env of envs) {
      if (env === manager.currentEnvironment) continue;
      const res = manager.transitionImmediate(env);
      expect(res.success).toBe(true);
      expect(manager.currentEnvironment).toBe(env);
      expect(manager.activeProfile.environment).toBe(env);
      expect(manager.verifyPermanentMemory().allValid).toBe(true);
    }
  });

  it('Test D: rejects transition if target environment is the current environment', () => {
    const res = manager.transitionImmediate('EarthOrbit');
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
    expect(manager.currentEnvironment).toBe('EarthOrbit');
  });

  it('Test E: simulated bit-flip affects test buffer only, never permanent memory', () => {
    const initialPermCheck = manager.verifyPermanentMemory();
    expect(initialPermCheck.allValid).toBe(true);

    // Initial test buffer is nominal
    const initialTestCheck = manager.verifyTestBuffer();
    expect(initialTestCheck.valid).toBe(true);
    expect(manager.testBuffer.corrupted).toBe(false);

    // Inject bit flip
    const injectRes = manager.injectTestBitFlip();
    expect(injectRes.corrupted).toBe(true);
    expect(injectRes.originalChecksum).not.toBe(injectRes.corruptedChecksum);
    expect(manager.testBuffer.corrupted).toBe(true);

    // Test buffer verification fails
    const corruptedTestCheck = manager.verifyTestBuffer();
    expect(corruptedTestCheck.valid).toBe(false);

    // CRITICAL: Permanent memory is 100% unaffected
    const permCheckDuringFault = manager.verifyPermanentMemory();
    expect(permCheckDuringFault.allValid).toBe(true);

    // Restore from backup
    const restoreRes = manager.restoreTestBuffer();
    expect(restoreRes.restored).toBe(true);
    expect(manager.testBuffer.corrupted).toBe(false);

    // Test buffer verification passes again
    const restoredTestCheck = manager.verifyTestBuffer();
    expect(restoredTestCheck.valid).toBe(true);
    expect(manager.verifyPermanentMemory().allValid).toBe(true);
  });

  it('Test F: resets to initial state and supports repeatable execution', () => {
    manager.transitionImmediate('MarsOrbit');
    manager.transitionImmediate('MarsSurface');
    expect(manager.currentEnvironment).toBe('MarsSurface');

    manager.reset();
    expect(manager.currentEnvironment).toBe('EarthOrbit');
    expect(manager.activeProfile.profileName).toBe('EARTH_ORBIT_PROFILE');
    expect(manager.previousProfile).toBeNull();
    expect(manager.verifyPermanentMemory().allValid).toBe(true);
    expect(manager.verifyTestBuffer().valid).toBe(true);
  });

  it('computes parameter diff accurately between profiles', () => {
    const earth = ENVIRONMENT_PROFILES['EarthOrbit'];
    const mars = ENVIRONMENT_PROFILES['MarsOrbit'];
    const diff = computeDiff(earth, mars);

    expect(diff.length).toBeGreaterThan(10);
    const solarDiff = diff.find(d => d.parameter.includes('Solar Irradiance'));
    expect(solarDiff).toBeDefined();
    expect(solarDiff!.changed).toBe(true);
    expect(solarDiff!.previousValue).toContain('1,361');
    expect(solarDiff!.newValue).toContain('590');
  });
});
