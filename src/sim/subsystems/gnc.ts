/**
 * AEGIS TRANSIT — Guidance, Navigation, Control & Propulsion (GNC)
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Spacecraft rigid-body attitude kinematics, RCS limit-cycle deadband jitter,
 * Tsiolkovsky rocket equation delta-V estimation, and main engine burn execution.
 */

import { SeededRng } from '../rng.js';

export interface GNCState {
  attitudeQuat: [number, number, number, number]; // [w, x, y, z]
  attitudeEuler: [number, number, number]; // [roll, pitch, yaw] in degrees
  angularRate: [number, number, number]; // [wx, wy, wz] in deg/s
  rcsJitter: number;          // magnitude of RCS limit-cycle deg/s
  propellantMass: number;     // kg
  dryMass: number;            // kg
  isp: number;                // seconds
  thrustN: number;            // N (current thrust)
  deltaVRemaining: number;    // m/s
  isBurning: boolean;
}

const G0 = 9.80665; // Standard gravity m/s^2

/**
 * Converts a unit quaternion [w, x, y, z] to Tait-Bryan Euler angles [roll, pitch, yaw] in degrees.
 */
export function quatToEuler(w: number, x: number, y: number, z: number): [number, number, number] {
  const sinr_cosp = 2 * (w * x + y * z);
  const cosr_cosp = 1 - 2 * (x * x + y * y);
  const roll = (Math.atan2(sinr_cosp, cosr_cosp) * 180) / Math.PI;

  const sinp = 2 * (w * y - z * x);
  let pitch: number;
  if (Math.abs(sinp) >= 1) {
    pitch = Math.sign(sinp) * 90;
  } else {
    pitch = (Math.asin(sinp) * 180) / Math.PI;
  }

  const siny_cosp = 2 * (w * z + x * y);
  const cosy_cosp = 1 - 2 * (y * y + z * z);
  const yaw = (Math.atan2(siny_cosp, cosy_cosp) * 180) / Math.PI;

  return [roll, pitch, yaw];
}

export class GNCSubsystem {
  public state: GNCState;
  private rng: SeededRng;
  private remainingBurnDv: number = 0;
  public burnDirection: [number, number] = [1, 0];
  private nominalThrustN: number = 45000; // 45 kN OMS main engine

  constructor(rng?: SeededRng) {
    this.rng = rng ?? new SeededRng(101);

    const dryMass = 15000;
    const propellantMass = 25000;
    const isp = 380; // OMS bipropellant
    const deltaV = isp * G0 * Math.log((dryMass + propellantMass) / dryMass);

    const quat: [number, number, number, number] = [1, 0, 0, 0];
    const euler = quatToEuler(...quat);

    this.state = {
      attitudeQuat: quat,
      attitudeEuler: euler,
      angularRate: [0, 0, 0],
      rcsJitter: 0.008,
      propellantMass,
      dryMass,
      isp,
      thrustN: 0,
      deltaVRemaining: deltaV,
      isBurning: false,
    };
  }

  /**
   * Advances GNC attitude kinematics and active propulsion burns by dt seconds.
   *
   * @param dt Elapsed simulation time in seconds
   */
  step(dt: number): void {
    if (dt <= 0) return;

    // 1. Propulsion Engine Burn Execution
    if (this.state.isBurning && this.remainingBurnDv > 0 && this.state.propellantMass > 0) {
      const mTotal = this.state.dryMass + this.state.propellantMass;
      const mDot = this.state.thrustN / (this.state.isp * G0); // kg/s
      const deltaM = Math.min(this.state.propellantMass, mDot * dt);

      const mAfter = mTotal - deltaM;
      const dvDelivered = this.state.isp * G0 * Math.log(mTotal / mAfter);

      this.state.propellantMass = Math.max(0, this.state.propellantMass - deltaM);
      this.remainingBurnDv = Math.max(0, this.remainingBurnDv - dvDelivered);

      if (this.remainingBurnDv <= 0.001 || this.state.propellantMass <= 0) {
        this.stopBurn();
      }
    }

    // 2. Tsiolkovsky Rocket Equation Delta-V Update
    const currentTotalMass = this.state.dryMass + this.state.propellantMass;
    this.state.deltaVRemaining = this.state.isp * G0 * Math.log(currentTotalMass / this.state.dryMass);

    // 3. Attitude Kinematics & RCS Limit-Cycle Deadband Jitter
    const jitterMagnitude = this.state.isBurning ? 0.02 : 0.006;
    const wx = this.rng.gaussian(0, jitterMagnitude);
    const wy = this.rng.gaussian(0, jitterMagnitude);
    const wz = this.rng.gaussian(0, jitterMagnitude);

    this.state.angularRate = [wx, wy, wz];
    this.state.rcsJitter = Math.sqrt(wx * wx + wy * wy + wz * wz);

    // Small attitude integration for visualization
    const [w, x, y, z] = this.state.attitudeQuat;
    const halfDt = (dt * Math.PI) / (180 * 2);
    const nw = w - halfDt * (x * wx + y * wy + z * wz);
    const nx = x + halfDt * (w * wx + y * wz - z * wy);
    const ny = y + halfDt * (w * wy - x * wz + z * wx);
    const nz = z + halfDt * (w * wz + x * wy - y * wx);

    // Normalize quaternion
    const norm = Math.hypot(nw, nx, ny, nz) || 1.0;
    this.state.attitudeQuat = [nw / norm, nx / norm, ny / norm, nz / norm];
    this.state.attitudeEuler = quatToEuler(...this.state.attitudeQuat);
  }

  /**
   * Commands the start of an orbital propulsion burn.
   *
   * @param dv Target delta-V in m/s
   * @param direction Ecliptic thrust vector direction
   */
  startBurn(dv: number, direction: [number, number] = [1, 0]): void {
    if (this.state.propellantMass <= 0 || dv <= 0) return;
    this.remainingBurnDv = dv;
    this.burnDirection = direction;
    this.state.thrustN = this.nominalThrustN;
    this.state.isBurning = true;
  }

  /**
   * Commands engine shutdown.
   */
  stopBurn(): void {
    this.state.isBurning = false;
    this.state.thrustN = 0;
    this.remainingBurnDv = 0;
  }
}
