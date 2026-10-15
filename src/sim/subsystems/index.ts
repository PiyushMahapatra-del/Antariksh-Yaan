/**
 * AEGIS TRANSIT — Subsystem Manager & Telemetry Coordinator
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Central orchestrator stepping all physical subsystems (Thermal, ECLSS, Power,
 * GNC, Radiation, Crew, Compute), processing telemetry through stochastic sensor models,
 * tracking alert limits, and coordinating fault injection.
 */

import { ThermalSubsystem } from './thermal.js';
import { ECLSSSubsystem } from './eclss.js';
import { PowerSubsystem } from './power.js';
import { GNCSubsystem } from './gnc.js';
import { RadiationSubsystem } from './radiation.js';
import { CrewSubsystem } from './crew.js';
import { ComputeSubsystem } from './compute.js';
import { SensorModel, type SensorConfig } from '../sensors.js';
import { FaultInjector } from '../faults.js';
import { SeededRng } from '../rng.js';
import type { AlertLevel, FidelityLevel, SensorReading } from '../../core/types.js';

export * from './thermal.js';
export * from './eclss.js';
export * from './power.js';
export * from './gnc.js';
export * from './radiation.js';
export * from './crew.js';
export * from './compute.js';

export interface ChannelDefinition {
  id: string;
  name: string;
  section: 'Navigation' | 'Thermal A' | 'Thermal B' | 'ECLSS' | 'Power' | 'Propulsion' | 'Radiation' | 'Crew' | 'Compute';
  unit: string;
  fidelity: FidelityLevel;
  getValue: () => number;
  cautionLow?: number;
  cautionHigh?: number;
  warningLow?: number;
  warningHigh?: number;
  sensorConfig: SensorConfig;
}

export interface ChannelAlert {
  channel: string;
  subsystem: string;
  level: AlertLevel;
  value: number;
  limit: number;
}

export class SubsystemManager {
  public thermal: ThermalSubsystem;
  public eclss: ECLSSSubsystem;
  public power: PowerSubsystem;
  public gnc: GNCSubsystem;
  public radiation: RadiationSubsystem;
  public crew: CrewSubsystem;
  public compute: ComputeSubsystem;
  public sensors: Map<string, SensorModel> = new Map();
  public faultInjector: FaultInjector;

  public channelDefs: Map<string, ChannelDefinition> = new Map();
  private latestReadings: Map<string, SensorReading> = new Map();
  private rng: SeededRng;

  public navState = {
    distSun: 1.0,
    distEarth: 0.0,
    distMars: 0.5,
    speedKmS: 32.5,
    etaDays: 200,
  };

  constructor(rng?: SeededRng) {
    this.rng = rng ?? new SeededRng(303);

    // Initialize physical subsystem instances
    this.thermal = new ThermalSubsystem();
    this.eclss = new ECLSSSubsystem();
    this.power = new PowerSubsystem();
    this.gnc = new GNCSubsystem(new SeededRng(404));
    this.radiation = new RadiationSubsystem();
    this.crew = new CrewSubsystem(new SeededRng(505));
    this.compute = new ComputeSubsystem();
    this.faultInjector = new FaultInjector();

    this.registerChannels();
  }

  public updateNavigation(nav: { distSun: number; distEarth: number; distMars: number; speedKmS: number; etaDays: number }): void {
    this.navState.distSun = nav.distSun;
    this.navState.distEarth = nav.distEarth;
    this.navState.distMars = nav.distMars;
    this.navState.speedKmS = nav.speedKmS;
    this.navState.etaDays = nav.etaDays;
  }

  private registerChannels(): void {
    const defaultSensor = (noise: number, quant: number = 0): SensorConfig => ({
      noiseSigma: noise,
      quantization: quant,
      biasDrift: 0.00001,
      dropoutProb: 0.001,
      stuckValue: null,
    });

    const defs: ChannelDefinition[] = [
      // === Navigation ===
      {
        id: 'nav_dist_sun',
        name: 'Sun Distance',
        section: 'Navigation',
        unit: 'AU',
        fidelity: 'HIGH',
        getValue: () => this.navState.distSun,
        sensorConfig: defaultSensor(0.0005, 0.001),
      },
      {
        id: 'nav_dist_earth',
        name: 'Earth Distance',
        section: 'Navigation',
        unit: 'AU',
        fidelity: 'HIGH',
        getValue: () => this.navState.distEarth,
        sensorConfig: defaultSensor(0.0005, 0.001),
      },
      {
        id: 'nav_dist_mars',
        name: 'Mars Distance',
        section: 'Navigation',
        unit: 'AU',
        fidelity: 'HIGH',
        getValue: () => this.navState.distMars,
        sensorConfig: defaultSensor(0.0005, 0.001),
      },
      {
        id: 'nav_speed',
        name: 'Heliocentric Speed',
        section: 'Navigation',
        unit: 'km/s',
        fidelity: 'HIGH',
        getValue: () => this.navState.speedKmS,
        sensorConfig: defaultSensor(0.01, 0.01),
      },
      {
        id: 'nav_eta_arrival',
        name: 'Encounter ETA',
        section: 'Navigation',
        unit: 'days',
        fidelity: 'HIGH',
        getValue: () => this.navState.etaDays,
        sensorConfig: defaultSensor(0.01, 0.1),
      },
      // === Thermal Loop A ===
      {
        id: 'thermal_loopA_tempIn',
        name: 'Loop A Inlet Temp',
        section: 'Thermal A',
        unit: 'K',
        fidelity: 'HIGH',
        getValue: () => this.thermal.loopA.coolantTempIn,
        cautionHigh: 300.0,
        warningHigh: 310.0,
        sensorConfig: defaultSensor(0.05, 0.1),
      },
      {
        id: 'thermal_loopA_tempOut',
        name: 'Loop A Outlet Temp',
        section: 'Thermal A',
        unit: 'K',
        fidelity: 'HIGH',
        getValue: () => this.thermal.loopA.coolantTempOut,
        cautionHigh: 305.0,
        warningHigh: 315.0,
        sensorConfig: defaultSensor(0.05, 0.1),
      },
      {
        id: 'thermal_loopA_flow',
        name: 'Loop A Flow Rate',
        section: 'Thermal A',
        unit: 'kg/s',
        fidelity: 'HIGH',
        getValue: () => this.thermal.loopA.flowRate,
        cautionLow: 0.25,
        warningLow: 0.10,
        sensorConfig: defaultSensor(0.002, 0.01),
      },
      {
        id: 'thermal_loopA_pumpRpm',
        name: 'Loop A Pump Speed',
        section: 'Thermal A',
        unit: 'RPM',
        fidelity: 'HIGH',
        getValue: () => this.thermal.loopA.pumpRpm,
        cautionLow: 2500,
        warningLow: 1500,
        sensorConfig: defaultSensor(5.0, 10),
      },
      {
        id: 'thermal_loopA_pressure',
        name: 'Loop A Pressure',
        section: 'Thermal A',
        unit: 'kPa',
        fidelity: 'HIGH',
        getValue: () => this.thermal.loopA.loopPressure,
        cautionLow: 160.0,
        warningLow: 100.0,
        cautionHigh: 270.0,
        warningHigh: 310.0,
        sensorConfig: defaultSensor(0.5, 0.5),
      },
      {
        id: 'thermal_loopA_accum',
        name: 'Loop A Accumulator',
        section: 'Thermal A',
        unit: '%',
        fidelity: 'HIGH',
        getValue: () => this.thermal.loopA.accumulatorLevel * 100,
        cautionLow: 50.0,
        warningLow: 20.0,
        sensorConfig: defaultSensor(0.2, 0.5),
      },

      // === Thermal Loop B ===
      {
        id: 'thermal_loopB_tempIn',
        name: 'Loop B Inlet Temp',
        section: 'Thermal B',
        unit: 'K',
        fidelity: 'HIGH',
        getValue: () => this.thermal.loopB.coolantTempIn,
        cautionHigh: 300.0,
        warningHigh: 310.0,
        sensorConfig: defaultSensor(0.05, 0.1),
      },
      {
        id: 'thermal_loopB_tempOut',
        name: 'Loop B Outlet Temp',
        section: 'Thermal B',
        unit: 'K',
        fidelity: 'HIGH',
        getValue: () => this.thermal.loopB.coolantTempOut,
        cautionHigh: 305.0,
        warningHigh: 315.0,
        sensorConfig: defaultSensor(0.05, 0.1),
      },
      {
        id: 'thermal_loopB_flow',
        name: 'Loop B Flow Rate',
        section: 'Thermal B',
        unit: 'kg/s',
        fidelity: 'HIGH',
        getValue: () => this.thermal.loopB.flowRate,
        cautionLow: 0.25,
        warningLow: 0.10,
        sensorConfig: defaultSensor(0.002, 0.01),
      },
      {
        id: 'thermal_loopB_pumpRpm',
        name: 'Loop B Pump Speed',
        section: 'Thermal B',
        unit: 'RPM',
        fidelity: 'HIGH',
        getValue: () => this.thermal.loopB.pumpRpm,
        cautionLow: 2500,
        warningLow: 1500,
        sensorConfig: defaultSensor(5.0, 10),
      },
      {
        id: 'thermal_loopB_pressure',
        name: 'Loop B Pressure',
        section: 'Thermal B',
        unit: 'kPa',
        fidelity: 'HIGH',
        getValue: () => this.thermal.loopB.loopPressure,
        cautionLow: 160.0,
        warningLow: 100.0,
        cautionHigh: 270.0,
        warningHigh: 310.0,
        sensorConfig: defaultSensor(0.5, 0.5),
      },
      {
        id: 'thermal_loopB_accum',
        name: 'Loop B Accumulator',
        section: 'Thermal B',
        unit: '%',
        fidelity: 'HIGH',
        getValue: () => this.thermal.loopB.accumulatorLevel * 100,
        cautionLow: 50.0,
        warningLow: 20.0,
        sensorConfig: defaultSensor(0.2, 0.5),
      },

      // === ECLSS ===
      {
        id: 'eclss_cabin_pressure',
        name: 'Cabin Total Pressure',
        section: 'ECLSS',
        unit: 'kPa',
        fidelity: 'HIGH',
        getValue: () => this.eclss.state.cabinPressure,
        cautionLow: 95.0,
        warningLow: 85.0,
        sensorConfig: defaultSensor(0.04, 0.1),
      },
      {
        id: 'eclss_ppO2',
        name: 'Cabin ppO2',
        section: 'ECLSS',
        unit: 'kPa',
        fidelity: 'HIGH',
        getValue: () => this.eclss.state.ppO2,
        cautionLow: 19.5,
        warningLow: 16.0,
        cautionHigh: 23.5,
        warningHigh: 25.0,
        sensorConfig: defaultSensor(0.02, 0.05),
      },
      {
        id: 'eclss_ppCO2',
        name: 'Cabin ppCO2',
        section: 'ECLSS',
        unit: 'kPa',
        fidelity: 'HIGH',
        getValue: () => this.eclss.state.ppCO2,
        cautionHigh: 0.8,
        warningHigh: 1.5,
        sensorConfig: defaultSensor(0.005, 0.01),
      },
      {
        id: 'eclss_ppN2',
        name: 'Cabin ppN2',
        section: 'ECLSS',
        unit: 'kPa',
        fidelity: 'HIGH',
        getValue: () => this.eclss.state.ppN2,
        cautionLow: 70.0,
        sensorConfig: defaultSensor(0.05, 0.1),
      },
      {
        id: 'eclss_o2_flow',
        name: 'O2 Supply Flow Rate',
        section: 'ECLSS',
        unit: 'g/s',
        fidelity: 'HIGH',
        getValue: () => this.eclss.state.o2FlowRate * 1000,
        sensorConfig: defaultSensor(0.001, 0.01),
      },
      {
        id: 'eclss_scrubber_eff',
        name: 'CO2 Scrubber Efficiency',
        section: 'ECLSS',
        unit: '%',
        fidelity: 'HIGH',
        getValue: () => this.eclss.state.co2ScrubberEfficiency * 100,
        cautionLow: 60.0,
        warningLow: 35.0,
        sensorConfig: defaultSensor(0.1, 0.5),
      },

      // === Power ===
      {
        id: 'power_solar_irradiance',
        name: 'Solar Irradiance',
        section: 'Power',
        unit: 'W/m²',
        fidelity: 'HIGH',
        getValue: () => this.power.state.solarIrradiance,
        sensorConfig: defaultSensor(0.5, 1.0),
      },
      {
        id: 'power_irradiance_pct',
        name: 'Relative Solar Flux',
        section: 'Power',
        unit: '%',
        fidelity: 'HIGH',
        getValue: () => this.power.state.irradiancePercent,
        sensorConfig: defaultSensor(0.1, 0.1),
      },
      {
        id: 'power_array_output',
        name: 'Photovoltaic Output',
        section: 'Power',
        unit: 'W',
        fidelity: 'HIGH',
        getValue: () => this.power.state.arrayOutput,
        cautionLow: 4000.0,
        warningLow: 2500.0,
        sensorConfig: defaultSensor(2.0, 5.0),
      },
      {
        id: 'power_bus_loads',
        name: 'Bus Electrical Load',
        section: 'Power',
        unit: 'W',
        fidelity: 'HIGH',
        getValue: () => this.power.state.busLoads,
        sensorConfig: defaultSensor(1.0, 1.0),
      },
      {
        id: 'power_battery_soc',
        name: 'Battery State of Charge',
        section: 'Power',
        unit: '%',
        fidelity: 'HIGH',
        getValue: () => this.power.state.batterySoC * 100,
        cautionLow: 40.0,
        warningLow: 20.0,
        sensorConfig: defaultSensor(0.1, 0.5),
      },
      {
        id: 'power_bus_voltage',
        name: 'Main Bus Voltage',
        section: 'Power',
        unit: 'V',
        fidelity: 'HIGH',
        getValue: () => this.power.state.busVoltage,
        cautionLow: 110.0,
        warningLow: 100.0,
        sensorConfig: defaultSensor(0.05, 0.1),
      },

      // === Propulsion / GNC ===
      {
        id: 'gnc_thrust',
        name: 'OMS Engine Thrust',
        section: 'Propulsion',
        unit: 'kN',
        fidelity: 'HIGH',
        getValue: () => this.gnc.state.thrustN / 1000,
        sensorConfig: defaultSensor(0.02, 0.1),
      },
      {
        id: 'gnc_propellant_mass',
        name: 'Propellant Mass',
        section: 'Propulsion',
        unit: 'kg',
        fidelity: 'HIGH',
        getValue: () => this.gnc.state.propellantMass,
        cautionLow: 3000.0,
        warningLow: 1000.0,
        sensorConfig: defaultSensor(2.0, 5.0),
      },
      {
        id: 'gnc_deltav_remaining',
        name: 'Remaining Delta-V',
        section: 'Propulsion',
        unit: 'm/s',
        fidelity: 'HIGH',
        getValue: () => this.gnc.state.deltaVRemaining,
        cautionLow: 500.0,
        warningLow: 200.0,
        sensorConfig: defaultSensor(0.5, 1.0),
      },
      {
        id: 'gnc_rcs_jitter',
        name: 'RCS Deadband Jitter',
        section: 'Propulsion',
        unit: 'deg/s',
        fidelity: 'HIGH',
        getValue: () => this.gnc.state.rcsJitter,
        sensorConfig: defaultSensor(0.0005, 0.001),
      },

      // === Radiation ===
      {
        id: 'rad_dose_rate',
        name: 'Ambient Dose Rate',
        section: 'Radiation',
        unit: 'mSv/d',
        fidelity: 'HIGH',
        getValue: () => this.radiation.state.doseRate,
        cautionHigh: 3.0,
        warningHigh: 10.0,
        sensorConfig: defaultSensor(0.02, 0.01),
      },
      {
        id: 'rad_cumulative_dose',
        name: 'Cumulative Dose',
        section: 'Radiation',
        unit: 'mSv',
        fidelity: 'HIGH',
        getValue: () => this.radiation.state.cumulativeDose,
        cautionHigh: 400.0,
        warningHigh: 700.0,
        sensorConfig: defaultSensor(0.05, 0.1),
      },

      // === Crew Biometrics ===
      {
        id: 'crew_1_spO2',
        name: 'CDR Rostova SpO2',
        section: 'Crew',
        unit: '%',
        fidelity: 'HIGH',
        getValue: () => this.crew.crew[0]?.spO2 ?? 99.0,
        cautionLow: 94.0,
        warningLow: 90.0,
        sensorConfig: defaultSensor(0.1, 0.5),
      },
      {
        id: 'crew_1_hr',
        name: 'CDR Rostova Heart Rate',
        section: 'Crew',
        unit: 'bpm',
        fidelity: 'HIGH',
        getValue: () => this.crew.crew[0]?.heartRate ?? 70,
        cautionHigh: 100.0,
        warningHigh: 125.0,
        sensorConfig: defaultSensor(0.5, 1.0),
      },
      {
        id: 'crew_2_spO2',
        name: 'PLT Vance SpO2',
        section: 'Crew',
        unit: '%',
        fidelity: 'HIGH',
        getValue: () => this.crew.crew[1]?.spO2 ?? 99.0,
        cautionLow: 94.0,
        warningLow: 90.0,
        sensorConfig: defaultSensor(0.1, 0.5),
      },
      {
        id: 'crew_2_hr',
        name: 'PLT Vance Heart Rate',
        section: 'Crew',
        unit: 'bpm',
        fidelity: 'HIGH',
        getValue: () => this.crew.crew[1]?.heartRate ?? 70,
        cautionHigh: 100.0,
        warningHigh: 125.0,
        sensorConfig: defaultSensor(0.5, 1.0),
      },
      {
        id: 'crew_3_spO2',
        name: 'MS1 Tanaka SpO2',
        section: 'Crew',
        unit: '%',
        fidelity: 'HIGH',
        getValue: () => this.crew.crew[2]?.spO2 ?? 99.0,
        cautionLow: 94.0,
        warningLow: 90.0,
        sensorConfig: defaultSensor(0.1, 0.5),
      },
      {
        id: 'crew_3_hr',
        name: 'MS1 Tanaka Heart Rate',
        section: 'Crew',
        unit: 'bpm',
        fidelity: 'HIGH',
        getValue: () => this.crew.crew[2]?.heartRate ?? 70,
        cautionHigh: 100.0,
        warningHigh: 125.0,
        sensorConfig: defaultSensor(0.5, 1.0),
      },
      {
        id: 'crew_4_spO2',
        name: 'MS2 Okafor SpO2',
        section: 'Crew',
        unit: '%',
        fidelity: 'HIGH',
        getValue: () => this.crew.crew[3]?.spO2 ?? 99.0,
        cautionLow: 94.0,
        warningLow: 90.0,
        sensorConfig: defaultSensor(0.1, 0.5),
      },
      {
        id: 'crew_4_hr',
        name: 'MS2 Okafor Heart Rate',
        section: 'Crew',
        unit: 'bpm',
        fidelity: 'HIGH',
        getValue: () => this.crew.crew[3]?.heartRate ?? 70,
        cautionHigh: 100.0,
        warningHigh: 125.0,
        sensorConfig: defaultSensor(0.5, 1.0),
      },

      // === Compute Architecture ===
      {
        id: 'compute_tier1_pwr',
        name: 'Tier 1 FSW Core Power',
        section: 'Compute',
        unit: 'W',
        fidelity: 'HIGH',
        getValue: () => this.compute.state.tier1PowerW,
        sensorConfig: defaultSensor(0.1, 0.1),
      },
      {
        id: 'compute_tier2_pwr',
        name: 'Tier 2 AI Core Power',
        section: 'Compute',
        unit: 'W',
        fidelity: 'HIGH',
        getValue: () => this.compute.state.tier2PowerW,
        sensorConfig: defaultSensor(0.1, 0.1),
      },
      {
        id: 'compute_total_pwr',
        name: 'Total Compute Power',
        section: 'Compute',
        unit: 'W',
        fidelity: 'HIGH',
        getValue: () => this.compute.state.totalPowerW,
        sensorConfig: defaultSensor(0.1, 0.5),
      },
    ];

    for (const def of defs) {
      this.channelDefs.set(def.id, def);
      const sensorRng = new SeededRng(this.rng.randInt(1, 1000000));
      this.sensors.set(def.id, new SensorModel(def.sensorConfig, sensorRng));
    }
  }

  /**
   * Syncs active fault definitions from FaultInjector directly into subsystem physical models.
   */
  private applyActiveFaults(): void {
    const active = this.faultInjector.getActive();
    const activeTypes = new Set(active.map(f => f.type));

    // Thermal pump fault
    if (activeTypes.has('coolant_pump_failure')) {
      this.thermal.injectPumpFailure('A');
    } else if (this.thermal.loopA.pumpDegraded) {
      this.thermal.clearFault('A', 'pump');
    }

    // Thermal leak fault
    if (activeTypes.has('coolant_leak')) {
      const f = active.find(f => f.type === 'coolant_leak');
      const rate = f?.params.rate ?? 0.005;
      this.thermal.injectLeak('A', rate);
    } else if (this.thermal.loopA.leaking) {
      this.thermal.clearFault('A', 'leak');
    }

    // Thermal blockage fault
    if (activeTypes.has('coolant_blockage')) {
      this.thermal.injectBlockage('A');
    } else if (this.thermal.loopA.blocked) {
      this.thermal.clearFault('A', 'blockage');
    }

    // ECLSS O2 regulator stuck
    if (activeTypes.has('o2_regulator_stuck')) {
      this.eclss.injectRegulatorStuck();
    } else if (this.eclss.state.regulatorStuck) {
      this.eclss.clearFault('regulator');
    }

    // ECLSS Cabin leak
    if (activeTypes.has('cabin_leak')) {
      const f = active.find(f => f.type === 'cabin_leak');
      const rate = f?.params.rate ?? 0.003;
      this.eclss.injectLeak(rate);
    } else if (this.eclss.state.cabinLeak) {
      this.eclss.clearFault('leak');
    }

    // ECLSS Scrubber degradation
    if (activeTypes.has('scrubber_degradation')) {
      const f = active.find(f => f.type === 'scrubber_degradation');
      const eff = f?.params.efficiency ?? 0.3;
      this.eclss.injectScrubberDegradation(eff);
    } else if (this.eclss.state.scrubberDegraded) {
      this.eclss.clearFault('scrubber');
    }

    // Radiation Solar Particle Event
    if (activeTypes.has('solar_particle_event')) {
      const f = active.find(f => f.type === 'solar_particle_event');
      const mult = f?.params.multiplier ?? 18.0;
      this.radiation.injectSPE(mult);
    } else if (this.radiation.state.speActive) {
      this.radiation.clearSPE();
    }

    // Sensor stuck fault
    const sensorStuckActive = activeTypes.has('sensor_stuck');
    const tempSensor = this.sensors.get('thermal_loopA_tempOut');
    if (tempSensor) {
      if (sensorStuckActive && !tempSensor.isStuck()) {
        const f = active.find(f => f.type === 'sensor_stuck');
        const stuckVal = f?.params.stuckValue ?? 298.5;
        tempSensor.setStuck(stuckVal);
      } else if (!sensorStuckActive && tempSensor.isStuck()) {
        tempSensor.clearStuck();
      }
    }
  }

  /**
   * Advances all physical subsystems, synchronizes cross-subsystem energy/mass flows,
   * and updates stochastic sensor telemetry.
   *
   * @param dt Elapsed simulation delta time in seconds
   * @param solarDistAU Heliocentric distance in AU
   * @param phase Mission phase string
   * @param simTimeJD Julian date timestamp
   */
  step(dt: number, solarDistAU: number, phase: string, simTimeJD: number = 0): void {
    if (dt <= 0) return;

    // Synchronize active faults to physical models
    this.applyActiveFaults();

    // 1. Advance Compute Subsystem
    this.compute.step(dt);

    // 2. Advance Thermal Subsystem (fed by compute heat dissipation)
    this.thermal.computeHeatLoad = this.compute.state.thermalOutputW;
    this.thermal.step(dt, solarDistAU);

    // 3. Advance Power Subsystem (fed by dynamic compute/pump electrical loads)
    const extraLoads = this.compute.state.totalPowerW;
    this.power.step(dt, solarDistAU, extraLoads);

    // 4. Advance GNC / Propulsion Kinematics
    this.gnc.step(dt);

    // 5. Advance Radiation Environment
    this.radiation.step(dt, phase);

    // 6. Advance ECLSS (4 crew)
    this.eclss.step(dt, 4);

    // 7. Advance Crew Physiology (fed by ECLSS atmosphere and radiation)
    this.crew.step(dt, this.eclss.state.ppO2, this.eclss.state.ppCO2, this.radiation.state.doseRate);

    // 8. Process all channels through Sensor Models
    for (const [id, def] of this.channelDefs.entries()) {
      const sensor = this.sensors.get(id);
      if (sensor) {
        const raw = def.getValue();
        const reading = sensor.read(raw, dt, simTimeJD);
        this.latestReadings.set(id, reading);
      }
    }
  }

  /**
   * Returns current sensor readings for all telemetry channels.
   */
  getTelemetry(): Map<string, SensorReading> {
    return this.latestReadings;
  }

  /**
   * Evaluates all telemetry channels against warning and caution limits.
   *
   * @returns List of active threshold violations
   */
  getAlerts(): ChannelAlert[] {
    const alerts: ChannelAlert[] = [];

    for (const [id, def] of this.channelDefs.entries()) {
      const reading = this.latestReadings.get(id);
      if (!reading) continue;

      const val = reading.measured;

      // Check Warning Limits
      if (def.warningLow !== undefined && val < def.warningLow) {
        alerts.push({
          channel: id,
          subsystem: def.section,
          level: 'WARNING',
          value: val,
          limit: def.warningLow,
        });
        continue;
      }
      if (def.warningHigh !== undefined && val > def.warningHigh) {
        alerts.push({
          channel: id,
          subsystem: def.section,
          level: 'WARNING',
          value: val,
          limit: def.warningHigh,
        });
        continue;
      }

      // Check Caution Limits
      if (def.cautionLow !== undefined && val < def.cautionLow) {
        alerts.push({
          channel: id,
          subsystem: def.section,
          level: 'CAUTION',
          value: val,
          limit: def.cautionLow,
        });
        continue;
      }
      if (def.cautionHigh !== undefined && val > def.cautionHigh) {
        alerts.push({
          channel: id,
          subsystem: def.section,
          level: 'CAUTION',
          value: val,
          limit: def.cautionHigh,
        });
        continue;
      }
    }

    return alerts;
  }
}
