/**
 * AEGIS TRANSIT — Subsystems Telemetry Panel UI
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * High-density mission telemetry monitoring console.
 * Displays physical state channels grouped by subsystem, 60-second sparkline trends,
 * stochastic sensor status (OK/DROPOUT/STUCK), and real-time limit threshold color-coding.
 * 
 * Refactored to Strict 4-Column Layout (Label, Status Pill, Tabular Num Value, 64x18 Sparkline).
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
          <span class="badge fidelity-high">60s TRENDS</span>
          <span class="badge synthetic-banner">SYNTHETIC</span>
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

        // Col 1: Label
        const nameSpan = document.createElement('span');
        nameSpan.className = 'telem-name';
        nameSpan.textContent = ch.name;
        nameSpan.title = `${ch.name} (${ch.unit})`;
        row.appendChild(nameSpan);

        // Col 2: Status pill
        const statusBadge = document.createElement('span');
        statusBadge.className = 'telem-status-badge status-nom';
        statusBadge.textContent = 'NOM';
        row.appendChild(statusBadge);

        // Col 3: Numeric value
        const valSpan = document.createElement('span');
        valSpan.className = 'telem-value level-nominal tabular-nums';
        valSpan.textContent = '-- ' + ch.unit;
        row.appendChild(valSpan);

        // Col 4: Canvas Sparkline (64x18)
        const canvas = document.createElement('canvas');
        canvas.className = 'telem-sparkline';
        canvas.width = 64;
        canvas.height = 18;
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
        padding: 6px 12px;
        background: var(--bg-panel);
        border-bottom: 1px solid var(--border-primary);
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: sticky;
        top: 0;
        z-index: 5;
        min-height: 30px;
        flex-shrink: 0;
      }
      .telem-panel-title {
        font-family: var(--font-sans);
        font-size: 11px;
        font-weight: 700;
        color: var(--text-secondary);
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .telem-badge-row {
        display: flex;
        gap: 6px;
        align-items: center;
      }
      .telem-sections-container {
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow-y: auto;
      }
      .telem-section {
        border-bottom: 1px solid var(--border-primary);
      }
      .telem-sec-header {
        background: var(--bg-card);
        padding: 3px 8px;
        font-family: var(--font-sans);
        font-size: 9px;
        font-weight: 700;
        color: var(--text-muted);
        letter-spacing: 0.08em;
        text-transform: uppercase;
        border-bottom: 1px solid var(--border-subtle);
      }
      .telem-sec-content {
        display: flex;
        flex-direction: column;
      }
      .telem-row {
        display: grid;
        grid-template-columns: 1fr 34px 75px 64px;
        align-items: center;
        gap: 6px;
        padding: 2px 8px;
        height: 26px;
        min-height: 26px;
        border-bottom: 1px solid var(--border-subtle);
        transition: background 0.12s ease;
      }
      .telem-row:hover {
        background: var(--bg-hover);
      }
      .telem-name {
        font-family: var(--font-mono);
        font-size: 10px;
        font-weight: 500;
        color: var(--text-secondary);
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
      .telem-status-badge {
        font-family: var(--font-mono);
        font-size: 8px;
        font-weight: 700;
        padding: 1px 3px;
        border-radius: 2px;
        text-align: center;
        letter-spacing: 0.04em;
        line-height: 1.2;
      }
      .status-nom {
        color: var(--nominal-text);
        background: var(--nominal-bg);
        border: 1px solid var(--nominal-border);
      }
      .status-caut {
        color: var(--caution-text);
        background: var(--caution-bg);
        border: 1px solid var(--caution-border);
      }
      .status-crit {
        color: var(--critical-text);
        background: var(--critical-bg);
        border: 1px solid var(--critical-border);
      }
      .telem-value {
        font-family: var(--font-mono);
        font-size: 11px;
        font-weight: 500;
        font-variant-numeric: tabular-nums;
        text-align: right;
        white-space: nowrap;
      }
      .level-nominal { color: var(--text-primary); }
      .level-caution { color: var(--caution-text); font-weight: 600; }
      .level-warning { color: var(--critical-text); font-weight: 600; }
      .level-critical { color: var(--critical-text); font-weight: 700; }
      .telem-sparkline {
        background: var(--bg-canvas);
        border: 1px solid var(--border-primary);
        border-radius: 2px;
        display: block;
      }
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
      row.valueEl.className = `telem-value level-${level.toLowerCase()} tabular-nums`;

      // 3. Sensor status badge (OK / DROPOUT / STUCK / ALERT)
      if (reading.status === 'STUCK') {
        row.statusBadgeEl.textContent = 'STUCK';
        row.statusBadgeEl.className = 'telem-status-badge status-crit';
      } else if (reading.status === 'DROPOUT') {
        row.statusBadgeEl.textContent = 'DROP';
        row.statusBadgeEl.className = 'telem-status-badge status-caut';
      } else if (level === 'CRITICAL' || level === 'WARNING') {
        row.statusBadgeEl.textContent = level === 'CRITICAL' ? 'CRIT' : 'WARN';
        row.statusBadgeEl.className = 'telem-status-badge status-crit';
      } else if (level === 'CAUTION') {
        row.statusBadgeEl.textContent = 'CAUT';
        row.statusBadgeEl.className = 'telem-status-badge status-caut';
      } else {
        row.statusBadgeEl.textContent = 'NOM';
        row.statusBadgeEl.className = 'telem-status-badge status-nom';
      }

      // 4. Render 60-second Canvas Sparkline (64x18)
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

    // Pick stroke & fill colors based on alert state
    let strokeColor = '#38BDF8';
    let fillColor = 'rgba(56, 189, 248, 0.1)';
    if (level === 'NOMINAL') {
      strokeColor = '#34D399';
      fillColor = 'rgba(52, 211, 153, 0.1)';
    } else if (level === 'CAUTION') {
      strokeColor = '#FBBF24';
      fillColor = 'rgba(251, 191, 36, 0.12)';
    } else if (level === 'WARNING' || level === 'CRITICAL') {
      strokeColor = '#F87171';
      fillColor = 'rgba(248, 113, 113, 0.15)';
    }

    // Draw subtle area fill underneath
    ctx.beginPath();
    ctx.moveTo(1, h);
    for (let i = 0; i < len; i++) {
      const x = (i / (len - 1)) * (w - 2) + 1;
      const normalized = (data[i] - plotMin) / plotRange;
      const y = h - 2 - normalized * (h - 4);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w - 1, h);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();

    // Draw stroke line
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
    ctx.lineWidth = 1.25;
    ctx.stroke();
  }
}
