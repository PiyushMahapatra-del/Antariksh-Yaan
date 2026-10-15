/**
 * AEGIS TRANSIT — Crew Physiology Subsystem
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Models 4-person crew biometrics: blood oxygen saturation (SpO2) sigmoid curve,
 * hypoxic tachycardia, hypercapnic hyperventilation, and cumulative radiation dose.
 */

import { SeededRng } from '../rng.js';
import { SECONDS_PER_DAY } from '../constants.js';

export interface CrewMember {
  id: number;
  name: string;
  spO2: number;              // % (blood oxygen saturation)
  heartRate: number;         // bpm
  respRate: number;          // breaths/min
  bodyTemp: number;          // °C
  radiationDose: number;     // mSv cumulative
  status: 'NOMINAL' | 'CAUTION' | 'WARNING' | 'CRITICAL';
}

interface CrewBaseline {
  baseHr: number;
  baseRr: number;
  baseTemp: number;
  o2SensitivityOffset: number;
}

export class CrewSubsystem {
  public crew: CrewMember[];
  private baselines: CrewBaseline[];

  constructor(rng?: SeededRng) {
    const r = rng ?? new SeededRng(202);

    const crewRoster = [
      { id: 1, name: 'CDR Elena Rostova' },
      { id: 2, name: 'PLT Marcus Vance' },
      { id: 3, name: 'MS1 Aiko Tanaka' },
      { id: 4, name: 'MS2 David Okafor' },
    ];

    this.baselines = crewRoster.map(() => ({
      baseHr: 68 + r.range(-4, 6),
      baseRr: 15 + r.range(-1.5, 2),
      baseTemp: 36.9 + r.range(-0.2, 0.2),
      o2SensitivityOffset: r.range(-0.3, 0.3),
    }));

    this.crew = crewRoster.map((m, idx) => ({
      id: m.id,
      name: m.name,
      spO2: 99.2,
      heartRate: Math.round(this.baselines[idx].baseHr),
      respRate: Math.round(this.baselines[idx].baseRr),
      bodyTemp: Number(this.baselines[idx].baseTemp.toFixed(1)),
      radiationDose: 12.4,
      status: 'NOMINAL',
    }));
  }

  /**
   * Advances crew biometrics integration based on environmental life support conditions.
   *
   * @param dt Elapsed simulation time in seconds
   * @param ppO2 Habitat O2 partial pressure in kPa
   * @param ppCO2 Habitat CO2 partial pressure in kPa
   * @param radDoseRate Radiation dose rate in mSv/day
   */
  step(dt: number, ppO2: number, ppCO2: number, radDoseRate: number): void {
    if (dt <= 0) return;

    for (let i = 0; i < this.crew.length; i++) {
      const member = this.crew[i];
      const base = this.baselines[i];

      // 1. Oxygen Saturation Sigmoid Function
      // Calibrated: normal ppO2 (21 kPa) -> ~99%, low ppO2 (12 kPa) -> ~88%
      const effectivePpO2 = ppO2 + base.o2SensitivityOffset;
      const spO2Calc = 100 / (1 + Math.exp(-0.29 * (effectivePpO2 - 5.5)));
      member.spO2 = Math.min(100, Math.max(0, spO2Calc));

      // 2. Heart Rate Response (Hypoxia + Hypercapnia)
      const hypoxiaTachycardia = Math.max(0, (96.0 - member.spO2) * 2.8);
      const hypercapniaTachycardia = Math.max(0, (ppCO2 - 0.5) * 35.0);
      member.heartRate = Math.round(base.baseHr + hypoxiaTachycardia + hypercapniaTachycardia);

      // 3. Respiratory Rate Response
      const hypercapniaTachypnea = Math.max(0, (ppCO2 - 0.5) * 16.0);
      const hypoxiaTachypnea = Math.max(0, (96.0 - member.spO2) * 0.4);
      member.respRate = Math.round(base.baseRr + hypercapniaTachypnea + hypoxiaTachypnea);

      // 4. Cumulative Radiation Dose
      member.radiationDose += radDoseRate * (dt / SECONDS_PER_DAY);

      // 5. Triage Status Classification
      if (member.spO2 < 85 || member.heartRate > 140 || ppCO2 > 2.0) {
        member.status = 'CRITICAL';
      } else if (member.spO2 < 90 || member.heartRate > 115 || ppCO2 > 1.2) {
        member.status = 'WARNING';
      } else if (member.spO2 < 94 || member.heartRate > 95 || ppCO2 > 0.8) {
        member.status = 'CAUTION';
      } else {
        member.status = 'NOMINAL';
      }
    }
  }
}
