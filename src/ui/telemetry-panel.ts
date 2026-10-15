/**
 * AEGIS TRANSIT — Subsystems Telemetry Panel UI
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * High-density mission telemetry monitoring console.
 * Displays physical state channels grouped by subsystem, 60-second sparkline trends,
 * stochastic sensor status (OK/DROPOUT/STUCK), and real-time limit threshold color-coding.
 */

import { RingBuffer } from '../core/store.js';
import type { AlertLevel, FidelityLevel, SensorReading } from '../core/types.js';

export interface TelemetryChannelUIConfig {
  id: string;
  name: string;
  unit: string;
  decimals: number;
  fidelity: FidelityLevel;
  section: string;
}

interface ChannelRowElements {
  container: HTMLDivElement;
  valueEl: HTMLSpanElement;
  statusBadgeEl: HTMLSpanElement;
  sparklineCanvas: HTMLCanvasElement;
  sparklineCtx: CanvasRenderingContext2D | null;
  history: RingBuffer<number>;
}

export class TelemetryPanel {
  private container: HTMLElement;
  private channelElements: Map<string, ChannelRowElements> = new Map();
  private sectionContainers: Map<string, HTMLElement> = new Map();

  private readonly channelConfigs: TelemetryChannelUIConfig[] = [
    // Navigation
    { id: 'nav_dist_sun', name: 'Sun Distance', unit: 'AU', decimals: 3, fidelity: 'HIGH', section: 'Navigation' },
    { id: 'nav_dist_earth', name: 'Earth Distance', unit: 'AU', decimals: 3, fidelity: 'HIGH', section: 'Navigation' },
    { id: 'nav_dist_mars', name: 'Mars Distance', unit: 'AU', decimals: 3, fidelity: 'HIGH', section: 'Navigation' },
    { id: 'nav_speed', name: 'Heliocentric Speed', unit: 'km/s', decimals: 2, fidelity: 'HIGH', section: 'Navigation' },
    { id: 'gnc_deltav_remaining', name: 'Remaining Delta-V', unit: 'm/s', decimals: 0, fidelity: 'HIGH', section: 'Navigation' },
    { id: 'nav_eta_arrival', name: 'Encounter ETA', unit: 'days', decimals: 1, fidelity: 'HIGH', section: 'Navigation' },

    // Propulsion
    { id: 'gnc_thrust', name: 'OMS Main Thrust', unit: 'kN', decimals: 1, fidelity: 'HIGH', section: 'Propulsion' },
    { id: 'gnc_propellant_mass', name: 'OMS Propellant', unit: 'kg', decimals: 0, fidelity: 'HIGH', section: 'Propulsion' },
    { id: 'gnc_rcs_jitter', name: 'RCS Rate Jitter', unit: '°/s', decimals: 4, fidelity: 'HIGH', section: 'Propulsion' },

    // Power
    { id: 'power_solar_irradiance', name: 'Solar Irradiance', unit: 'W/m²', decimals: 0, fidelity: 'HIGH', section: 'Power' },
    { id: 'power_irradiance_pct', name: 'Relative Solar Flux', unit: '%', decimals: 1, fidelity: 'HIGH', section: 'Power' },
    { id: 'power_array_output', name: 'Array Generation', unit: 'W', decimals: 0, fidelity: 'HIGH', section: 'Power' },
    { id: 'power_bus_loads', name: 'Total Bus Loads', unit: 'W', decimals: 0, fidelity: 'HIGH', section: 'Power' },
    { id: 'power_battery_soc', name: 'Battery SoC', unit: '%', decimals: 1, fidelity: 'HIGH', section: 'Power' },
    { id: 'power_bus_voltage', name: 'Regulated Bus Volts', unit: 'V', decimals: 1, fidelity: 'HIGH', section: 'Power' },

    // Thermal A
    { id: 'thermal_loopA_tempIn', name: 'Loop A Temp In', unit: 'K', decimals: 1, fidelity: 'HIGH', section: 'Thermal A' },
    { id: 'thermal_loopA_tempOut', name: 'Loop A Temp Out', unit: 'K', decimals: 1, fidelity: 'HIGH', section: 'Thermal A' },
    { id: 'thermal_loopA_flow', name: 'Loop A Mass Flow', unit: 'kg/s', decimals: 2, fidelity: 'HIGH', section: 'Thermal A' },
    { id: 'thermal_loopA_pumpRpm', name: 'Loop A Pump Speed', unit: 'RPM', decimals: 0, fidelity: 'HIGH', section: 'Thermal A' },
    { id: 'thermal_loopA_pressure', name: 'Loop A Pressure', unit: 'kPa', decimals: 1, fidelity: 'HIGH', section: 'Thermal A' },
    { id: 'thermal_loopA_accum', name: 'Loop A Accumulator', unit: '%', decimals: 1, fidelity: 'HIGH', section: 'Thermal A' },

    // Thermal B
    { id: 'thermal_loopB_tempIn', name: 'Loop B Temp In', unit: 'K', decimals: 1, fidelity: 'HIGH', section: 'Thermal B' },
    { id: 'thermal_loopB_tempOut', name: 'Loop B Temp Out', unit: 'K', decimals: 1, fidelity: 'HIGH', section: 'Thermal B' },
    { id: 'thermal_loopB_flow', name: 'Loop B Mass Flow', unit: 'kg/s', decimals: 2, fidelity: 'HIGH', section: 'Thermal B' },
    { id: 'thermal_loopB_pumpRpm', name: 'Loop B Pump Speed', unit: 'RPM', decimals: 0, fidelity: 'HIGH', section: 'Thermal B' },
    { id: 'thermal_loopB_pressure', name: 'Loop B Pressure', unit: 'kPa', decimals: 1, fidelity: 'HIGH', section: 'Thermal B' },
    { id: 'thermal_loopB_accum', name: 'Loop B Accumulator', unit: '%', decimals: 1, fidelity: 'HIGH', section: 'Thermal B' },

    // ECLSS
    { id: 'eclss_cabin_pressure', name: 'Cabin Total Pressure', unit: 'kPa', decimals: 1, fidelity: 'HIGH', section: 'ECLSS' },
    { id: 'eclss_ppO2', name: 'Oxygen ppO2', unit: 'kPa', decimals: 2, fidelity: 'HIGH', section: 'ECLSS' },
    { id: 'eclss_ppN2', name: 'Nitrogen ppN2', unit: 'kPa', decimals: 1, fidelity: 'HIGH', section: 'ECLSS' },
    { id: 'eclss_ppCO2', name: 'Carbon Dioxide ppCO2', unit: 'kPa', decimals: 3, fidelity: 'HIGH', section: 'ECLSS' },
    { id: 'eclss_o2_flow', name: 'O2 Supply Rate', unit: 'g/s', decimals: 2, fidelity: 'HIGH', section: 'ECLSS' },
    { id: 'eclss_scrubber_eff', name: 'CO2 Scrubber Eff', unit: '%', decimals: 1, fidelity: 'HIGH', section: 'ECLSS' },

    // Radiation
    { id: 'rad_dose_rate', name: 'Ambient Dose Rate', unit: 'mSv/d', decimals: 2, fidelity: 'HIGH', section: 'Radiation' },
    { id: 'rad_cumulative_dose', name: 'Cumulative Dose', unit: 'mSv', decimals: 2, fidelity: 'HIGH', section: 'Radiation' },

    // Crew
    { id: 'crew_1_spO2', name: 'CDR Rostova SpO2', unit: '%', decimals: 1, fidelity: 'HIGH', section: 'Crew' },
    { id: 'crew_1_hr', name: 'CDR Rostova Heart', unit: 'bpm', decimals: 0, fidelity: 'HIGH', section: 'Crew' },
    { id: 'crew_2_spO2', name: 'PLT Vance SpO2', unit: '%', decimals: 1, fidelity: 'HIGH', section: 'Crew' },
    { id: 'crew_2_hr', name: 'PLT Vance Heart', unit: 'bpm', decimals: 0, fidelity: 'HIGH', section: 'Crew' },
    { id: 'crew_3_spO2', name: 'MS1 Tanaka SpO2', unit: '%', decimals: 1, fidelity: 'HIGH', section: 'Crew' },
    { id: 'crew_3_hr', name: 'MS1 Tanaka Heart', unit: 'bpm', decimals: 0, fidelity: 'HIGH', section: 'Crew' },
    { id: 'crew_4_spO2', name: 'MS2 Okafor SpO2', unit: '%', decimals: 1, fidelity: 'HIGH', section: 'Crew' },
    { id: 'crew_4_hr', name: 'MS2 Okafor Heart', unit: 'bpm', decimals: 0, fidelity: 'HIGH', section: 'Crew' },

    // Compute
    { id: 'compute_tier1_pwr', name: 'Tier 1 FSW Power', unit: 'W', decimals: 1, fidelity: 'HIGH', section: 'Compute' },
    { id: 'compute_tier2_pwr', name: 'Tier 2 AI Power', unit: 'W', decimals: 1, fidelity: 'HIGH', section: 'Compute' },
    { id: 'compute_total_pwr', name: 'Total Compute Pwr', unit: 'W', decimals: 1, fidelity: 'HIGH', section: 'Compute' },
  ];

  constructor(container: HTMLElement) {
    this.container = container;
    this.initDOM();
  }

  private initDOM(): void {
    this.container.innerHTML = `
      <div class="telem-panel-header">
        <div class="telem-panel-title">SUBSYSTEM TELEMETRY</div>
        <div class="telem-badge-row">
          <span class="fidelity-badge fidelity-high">60s TRENDS</span>
          <span class="synthetic-banner">SYNTHETIC</span>
        </div>
      </div>
      <div class="telem-sections-container"></div>
    `;

    const sectionsWrapper = this.container.querySelector('.telem-sections-container') as HTMLElement;

    // Group configs by section
    const sectionGroups: Map<string, TelemetryChannelUIConfig[]> = new Map();
    for (const cfg of this.channelConfigs) {
      if (!sectionGroups.has(cfg.section)) {
        sectionGroups.set(cfg.section, []);
      }
      sectionGroups.get(cfg.section)!.push(cfg);
    }

    for (const [sectionName, channels] of sectionGroups.entries()) {
      const secEl = document.createElement('div');
      secEl.className = 'telem-section';

      const secHeader = document.createElement('div');
      secHeader.className = 'telem-sec-header';
      secHeader.textContent = sectionName.toUpperCase();
      secEl.appendChild(secHeader);

      const secContent = document.createElement('div');
      secContent.className = 'telem-sec-content';

      for (const ch of channels) {
        const row = document.createElement('div');
        row.className = 'telem-row';
        row.dataset.channel = ch.id;

        // Meta info (name + unit + badge)
        const metaDiv = document.createElement('div');
        metaDiv.className = 'telem-meta';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'telem-name';
        nameSpan.textContent = ch.name;
        metaDiv.appendChild(nameSpan);

        const badgeSpan = document.createElement('span');
        badgeSpan.className = `fidelity-badge fidelity-${ch.fidelity.toLowerCase()}`;
        badgeSpan.textContent = ch.fidelity;
        metaDiv.appendChild(badgeSpan);

        const statusBadge = document.createElement('span');
        statusBadge.className = 'telem-status-badge';
        statusBadge.style.display = 'none';
        metaDiv.appendChild(statusBadge);

        row.appendChild(metaDiv);

        // Numeric value
        const valSpan = document.createElement('span');
        valSpan.className = 'telem-value level-nominal';
        valSpan.textContent = '-- ' + ch.unit;
        row.appendChild(valSpan);

        // Canvas Sparkline
        const canvas = document.createElement('canvas');
        canvas.className = 'telem-sparkline';
        canvas.width = 80;
        canvas.height = 20;
        row.appendChild(canvas);

        secContent.appendChild(row);

        this.channelElements.set(ch.id, {
          container: row,
          valueEl: valSpan,
          statusBadgeEl: statusBadge,
          sparklineCanvas: canvas,
          sparklineCtx: canvas.getContext('2d'),
          history: new RingBuffer<number>(60),
        });
      }

      secEl.appendChild(secContent);
      sectionsWrapper.appendChild(secEl);
      this.sectionContainers.set(sectionName, secEl);
    }

    // Inject dedicated styles
    this.injectStyles();
  }

  private injectStyles(): void {
    if (document.getElementById('telem-panel-styles')) return;

    const style = document.createElement('style');
    style.id = 'telem-panel-styles';
    style.textContent = `
      .telem-panel-header {
        padding: 8px 10px;
        background: var(--bg-panel);
        border-bottom: var(--border);
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: sticky;
        top: 0;
        z-index: 5;
      }
      .telem-panel-title {
        font-family: var(--font-mono);
        font-size: 11px;
        font-weight: 700;
        color: var(--cyan);
        letter-spacing: 1.2px;
      }
      .telem-badge-row {
        display: flex;
        gap: 4px;
        align-items: center;
      }
      .telem-sections-container {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 6px 4px;
      }
      .telem-section {
        background: rgba(14, 20, 28, 0.7);
        border: 1px solid rgba(0, 229, 255, 0.15);
        border-radius: 2px;
        overflow: hidden;
      }
      .telem-sec-header {
        background: rgba(0, 229, 255, 0.08);
        padding: 3px 8px;
        font-family: var(--font-mono);
        font-size: 10px;
        font-weight: 700;
        color: var(--cyan);
        letter-spacing: 1px;
        border-bottom: 1px solid rgba(0, 229, 255, 0.1);
      }
      .telem-sec-content {
        display: flex;
        flex-direction: column;
      }
      .telem-row {
        display: grid;
        grid-template-columns: 1fr auto 80px;
        align-items: center;
        gap: 6px;
        padding: 2px 6px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.03);
      }
      .telem-row:last-child {
        border-bottom: none;
      }
      .telem-meta {
        display: flex;
        align-items: center;
        gap: 4px;
        overflow: hidden;
      }
      .telem-name {
        font-family: var(--font-mono);
        font-size: 10px;
        color: var(--text-secondary);
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
      .telem-status-badge {
        font-family: var(--font-mono);
        font-size: 8px;
        font-weight: 700;
        padding: 0 3px;
        border-radius: 2px;
        background: var(--amber);
        color: #000;
      }
      .telem-value {
        font-family: var(--font-mono);
        font-size: 11px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        text-align: right;
        white-space: nowrap;
      }
      .telem-sparkline {
        background: rgba(0, 0, 0, 0.35);
        border: 1px solid rgba(0, 229, 255, 0.1);
        border-radius: 2px;
      }
      .level-nominal { color: var(--green); }
      .level-caution { color: var(--amber); text-shadow: 0 0 4px rgba(255, 171, 0, 0.4); }
      .level-warning { color: var(--red); font-weight: 700; text-shadow: 0 0 6px rgba(255, 23, 68, 0.6); }
      .level-critical { color: var(--magenta); font-weight: 700; text-shadow: 0 0 8px rgba(224, 64, 251, 0.8); }
    `;
    document.head.appendChild(style);
  }

  /**
   * Updates all telemetry rows with latest sensor readings and active alert states.
   *
   * @param telemetry Map of sensor readings
   * @param alerts Active threshold alert violations
   */
  update(
    telemetry: Map<string, SensorReading>,
    alerts: { channel: string; level: AlertLevel; value: number; limit: number }[]
  ): void {
    // Build quick alert lookup
    const alertMap = new Map<string, AlertLevel>();
    for (const a of alerts) {
      alertMap.set(a.channel, a.level);
    }

    for (const cfg of this.channelConfigs) {
      const row = this.channelElements.get(cfg.id);
      if (!row) continue;

      const reading = telemetry.get(cfg.id);
      if (!reading) continue;

      const val = reading.measured;
      row.history.push(val);

      // 1. Format value text
      row.valueEl.textContent = `${val.toFixed(cfg.decimals)} ${cfg.unit}`;

      // 2. Alert level styling
      const level = alertMap.get(cfg.id) ?? 'NOMINAL';
      row.valueEl.className = `telem-value level-${level.toLowerCase()}`;

      // 3. Sensor status badge (OK / DROPOUT / STUCK)
      if (reading.status === 'STUCK') {
        row.statusBadgeEl.style.display = 'inline-block';
        row.statusBadgeEl.textContent = 'STUCK';
        row.statusBadgeEl.style.background = 'var(--red)';
        row.statusBadgeEl.style.color = '#fff';
      } else if (reading.status === 'DROPOUT') {
        row.statusBadgeEl.style.display = 'inline-block';
        row.statusBadgeEl.textContent = 'DROP';
        row.statusBadgeEl.style.background = 'var(--amber)';
        row.statusBadgeEl.style.color = '#000';
      } else {
        row.statusBadgeEl.style.display = 'none';
      }

      // 4. Render 60-second Canvas Sparkline
      this.drawSparkline(row, level);
    }
  }

  private drawSparkline(row: ChannelRowElements, level: AlertLevel): void {
    const ctx = row.sparklineCtx;
    if (!ctx) return;

    const canvas = row.sparklineCanvas;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const len = row.history.length;
    if (len < 2) return;

    const data = row.history.toArray();

    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < len; i++) {
      const v = data[i];
      if (v < min) min = v;
      if (v > max) max = v;
    }

    const range = max - min;
    const pad = range > 1e-6 ? range * 0.1 : 1.0;
    const plotMin = min - pad;
    const plotMax = max + pad;
    const plotRange = plotMax - plotMin;

    // Pick stroke color based on alert state
    let strokeColor = '#00e676'; // green nominal
    if (level === 'CAUTION') strokeColor = '#ffab00'; // amber
    if (level === 'WARNING') strokeColor = '#ff1744'; // red
    if (level === 'CRITICAL') strokeColor = '#e040fb'; // magenta

    ctx.beginPath();
    for (let i = 0; i < len; i++) {
      const x = (i / (len - 1)) * (w - 2) + 1;
      const normalized = (data[i] - plotMin) / plotRange;
      const y = h - 2 - normalized * (h - 4);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
}
