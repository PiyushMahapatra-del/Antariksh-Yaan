/**
 * AEGIS TRANSIT — Electrical Power Subsystem (EPS)
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Models 1/r^2 solar irradiance, photovoltaic generation,
 * battery energy storage state-of-charge (SoC), and bus voltage regulation.
 */

import { SOLAR_IRRADIANCE_1AU } from '../constants.js';

export interface PowerState {
  solarArrayArea: number;     // m^2
  solarArrayEfficiency: number; // fraction
  solarIrradiance: number;    // W/m^2 at current distance
  irradiancePercent: number;  // % of Earth's (live computed)
  arrayOutput: number;        // W
  batteryCapacity: number;    // Wh
  batterySoC: number;         // fraction 0-1
  busLoads: number;           // W
  busVoltage: number;         // V
  pointingFactor: number;     // 0-1
  dustFactor: number;         // 0-1 (for surface ops)
}

export class PowerSubsystem {
  public state: PowerState;
  private batteryEnergyWh: number;

  constructor() {
    const area = 60.0;
    const eff = 0.30;
    const capacity = 30000; // 30 kWh
    const initialSoC = 0.92;

    this.batteryEnergyWh = capacity * initialSoC;

    this.state = {
      solarArrayArea: area,
      solarArrayEfficiency: eff,
      solarIrradiance: SOLAR_IRRADIANCE_1AU,
      irradiancePercent: 100.0,
      arrayOutput: area * eff * SOLAR_IRRADIANCE_1AU,
      batteryCapacity: capacity,
      batterySoC: initialSoC,
      busLoads: 3200,
      busVoltage: 120.0,
      pointingFactor: 0.99,
      dustFactor: 1.0,
    };
  }

  /**
   * Advances the power subsystem simulation by dt seconds.
   *
   * @param dt Elapsed simulation time in seconds
   * @param solarDistAU Current distance from Sun in AU
   * @param dynamicLoads Optional additional load in Watts (e.g. compute/transmitters)
   */
  step(dt: number, solarDistAU: number, dynamicLoads: number = 0): void {
    if (dt <= 0) return;

    const r = Math.max(0.1, solarDistAU);

    // 1. Solar Irradiance 1/r^2 law
    const irradiance = SOLAR_IRRADIANCE_1AU / (r * r);
    this.state.solarIrradiance = irradiance;
    this.state.irradiancePercent = (1.0 / (r * r)) * 100.0;

    // 2. Photovoltaic Array Generation
    const rawOutput = this.state.solarArrayArea * 
      this.state.solarArrayEfficiency * 
      irradiance * 
      this.state.pointingFactor * 
      this.state.dustFactor;
    this.state.arrayOutput = Math.max(0, rawOutput);

    // 3. Total Bus Electrical Loads
    const baseLoads = 3200; // avionics, pumps, ECLSS baseline
    this.state.busLoads = baseLoads + Math.max(0, dynamicLoads);

    // 4. Battery Charge / Discharge Integration
    const netPowerW = this.state.arrayOutput - this.state.busLoads;
    if (netPowerW >= 0) {
      // Charging: 95% charge efficiency
      const chargeDeltaWh = (netPowerW * 0.95 * dt) / 3600;
      this.batteryEnergyWh = Math.min(this.state.batteryCapacity, this.batteryEnergyWh + chargeDeltaWh);
    } else {
      // Discharging into bus
      const dischargeDeltaWh = (Math.abs(netPowerW) * dt) / 3600;
      this.batteryEnergyWh = Math.max(0, this.batteryEnergyWh - dischargeDeltaWh);
    }

    this.state.batterySoC = this.batteryEnergyWh / this.state.batteryCapacity;

    // 5. Bus Voltage Regulation: 120 V nominal regulated bus
    // Slumps to ~114V at low SoC or drops rapidly if depleted
    if (this.state.batterySoC > 0.15) {
      this.state.busVoltage = 114.0 + (8.0 * this.state.batterySoC);
    } else {
      this.state.busVoltage = Math.max(0, 114.0 * (this.state.batterySoC / 0.15));
    }
  }
}
