# AEGIS TRANSIT — Fix & Verification Log

This document records all bug fixes, root causes, and regression test verifications performed during the engineering fix-and-extend pass across Parts A, B, C, and D.

---

## Task A1: Negative Distance & Unified Distance Readout Formatting

- **Symptom**: Right-hand telemetry showed Earth distance as negative (e.g. `-0.001 AU`) at mission departure, while the Astrodynamics HUD showed `0.000 AU (266 km)` with dual contradictory formats.
- **Root Cause**: At departure, Earth distance is ~`0.0000017 AU` (~266 km). The `nav_dist_earth` sensor applies Gaussian noise ($\sigma = 0.0005$) and quantization ($0.001$), which produced negative samples and rounded them to `-0.001 AU`. Additionally, `telemetry-panel.ts` rendered raw AU values with fixed 3 decimal places rather than using a unified distance formatter.
- **Fix**:
  1. Updated `SensorConfig` and `SensorModel` to support physical bounding constraints (`min` / `max`).
  2. Enforced `min: 0` on `nav_dist_sun`, `nav_dist_earth`, `nav_dist_mars`, and other non-negative channels in `SubsystemManager`.
  3. Implemented a single authoritative `formatDistance(distAu: number)` function in `src/render/map-utils.ts` adhering strictly to: kilometers below `0.01 AU` (with thousands separators), otherwise AU with 3 decimals, with input clamped to $\ge 0$.
  4. Wired `formatDistance` into `src/ui/telemetry-panel.ts`, `src/main.ts` (Astrodynamics kinematics and celestial ephemerides HUD), and `src/render/tactical-map.ts`.
- **Test**:
  - `src/sim/sensors.test.ts`: Added property test verifying reported distance $\ge 0$ across 10,000 random states on every distance channel (`nav_dist_sun`, `nav_dist_earth`, `nav_dist_mars`).
  - `src/render/map-utils.test.ts`: Verified exact formatting transitions below and above $0.01\text{ AU}$ and non-negativity clamping.
  - Captured before/after screenshots at 1280x720, 1440x900, 1920x1080.

---

## Task A2: Unified Link Budget & Adaptive Rate Formatting

- **Symptom**: Astrodynamics HUD displayed an absurd rate (`158041014056554.5 kbps`), while the DTN console displayed `5000 / 1000 kbps`.
- **Root Cause**: `comms-geometry.ts` divided base rate directly by $d^2$ with no minimum distance clamp; near departure ($d \approx 1.7 \times 10^{-6}\text{ AU}$), $d^2 \approx 3 \times 10^{-12}$, creating rates $\sim 10^{14}\text{ kbps}$. In parallel, `link-model.ts` used a divergent formula `500 / max(0.1, d^2)`.
- **Fix**:
  1. Created single authoritative `linkBudget(distanceAu, thetaDeg)` function in `src/sim/link-budget.ts` used by every panel, DTN simulation, and map.
  2. Applied unified formula: $\text{rate} = \text{clamp}(R_{\text{ref}} \cdot (1\text{ AU} / \max(d, d_{\text{min}}))^2, R_{\text{min}}, R_{\text{max}})$ with $d_{\text{min}} = 1.0\text{ AU}$, $R_{\text{ref}} = 500\text{ kbps}$ (downlink) / $100\text{ kbps}$ (uplink), capped at $d \le 1\text{ AU}$.
  3. Created `formatLinkRate(rateBps)` formatting with adaptive units (`bps`, `kbps`, `Mbps`) and at most 4 significant digits without NaN or Infinity.
  4. Wired `linkBudget` and `formatLinkRate` into `CommsStateManager`, `DeepSpaceLinkModel`, `comms-geometry.ts`, `comms-console.ts`, and `main.ts`.
- **Test**:
  - `src/sim/comms-geometry.test.ts`: Verified no NaN or Infinity across wide sweep; rate is monotonically non-increasing with distance; rate equals cap at $d \le 1\text{ AU}$; rate at $3\text{ AU}$ is $\approx 1/9$ of $1\text{ AU}$ rate; adaptive unit formatting tested across range.
  - Captured before/after screenshots at 1280x720, 1440x900, 1920x1080.

---

## Task A3: Standardized Feature Featurization, Deterministic CART Trees, Diverging Shapley Bars, and False-Alarm Elimination

- **Symptom**: Tier 1 diagnostics panel exhibited two major failures:
  1. Shapley attribution bars showed raw feature values (+2500.000, +290.000) with identical full-width bars on the wrong class index.
  2. The classifier falsely reported "BLOCKAGE 27.5%" and out-of-distribution (OOD dist 23.38) during healthy nominal flight.
- **Root Cause**:
  1. `ai-console.ts` rendered raw feature values (`s.value` instead of `s.phi`) and scaled `Math.abs(val) * 200`, saturating every bar to 100% width. It also hardcoded `classIdx = 0`.
  2. Feature mismatch between training script and runtime: `scripts/train-model.ts` generated training data with pump $\Delta P \sim 48\text{ kPa}$, whereas `ThermalSubsystem` in the simulator operates at $155\text{ kPa}$ / $3600\text{ RPM}$.
  3. `RandomForest` initialized dummy trees with random split thresholds instead of training on physical data, and `main.ts` fed non-existent sensor IDs (`thermal.loopA.flowRate`) which defaulted to dummy constants (`acc = 2500`).
- **Fix**:
  1. Standardized 6 physical thermal features: `flow_rate` (0.45 kg/s), `pump_dp` (155.0 kPa), `pump_rpm` (3600 RPM), `outlet_temp` (292.5 K), `inlet_temp` (290.0 K), `accumulator_level` (0.88 fraction).
  2. Implemented universal `featurize(state)` and `standardize(raw)` in `src/ai/tier1.ts` sharing `DEFAULT_STANDARDIZATION` across runtime and training pipeline (`scripts/train-model.ts`).
  3. Trained 30 CART decision trees on 10,000 physical simulation samples achieving 100% cross-validation accuracy across 5 classes (`nominal`, `pump_failure`, `leak`, `blockage`, `sensor_fault`).
  4. Implemented exact TreeSHAP calculation over 64 subsets ($2^6$) and baseline $E[f(x)]$ with floating-point efficiency error $< 10^{-15} \ll 10^{-6}$.
  5. Updated `ai-console.ts`:
     - Nominal state displays `"No active fault. Monitoring"` card with nominal confidence, anomaly score, and an `[EXPLAIN CURRENT STATE]` button.
     - Diverging Shapley bars diverging from center zero axis, sorted descending by $|\phi|$, single shared scale, target class $f(x)$ and baseline $E[f(x)]$, signed values with directional arrows (`+0.142 [▲]` / `-0.085 [▼]`) ensuring sign is not encoded by color alone, and raw feature values as secondary text (`(raw: 155.0 kPa)`).
     - Additivity self-check: if error $> 10^{-6}$, renders red `"ATTRIBUTION INVALID"` badge instead of bars.
     - In-place DOM updates in `_renderTier1()` to avoid element detachment during 100ms telemetry ticks.
- **Test**:
  - `src/ai/ai.test.ts`:
    1. Across 200 nominal simulator states, 200/200 (100.0%) classify as nominal with OOD below threshold.
    2. Shapley additivity efficiency holds on 500 random states with maximum error $7.77 \times 10^{-16} < 10^{-6}$.
    3. Measured top-1 accuracy recorded in `docs/TEST_REPORT.md`: nominal (100%), pump_failure (100%), leak (100%), blockage (100%), sensor_fault (100%).
  - Captured Playwright screenshots at 1280x720, 1440x900, 1920x1080.

---

## Task A4: Internal Label Removal and Full Scenario Tab Names

- **Symptom**: Internal development milestone and guideline labels appeared in the UI:
  1. Top bar contained `M1 ACTIVE` badge.
  2. Advisory stack contained references to `(G4)` / `PROPOSE-ONLY (G4)`.
  3. Scenario runner tabs were prefixed with milestone/scenario IDs (`S1: LATENCY`, `S2: BLACKOUT`, etc.) rather than displaying full untruncated names.
- **Root Cause**: Sprint development tags and requirements traceability shorthand were embedded directly into user-facing DOM templates and strings.
- **Fix**:
  1. Removed `M1 ACTIVE` badge from `src/main.ts` top bar.
  2. Enforced clean `PROPOSE-ONLY` badge in `src/ui/ai-console.ts`.
  3. Updated scenario selector tabs in `src/ui/scenario-runner.ts` to full, untruncated names: `Latency`, `Blackout`, `Anomaly`, `Medical`, `Capture`.
  4. Sanitized all internal shorthand across types, comments, and spaced SVG move commands in `src/ui/icons.ts`.
  5. Implemented automated regression suite in `src/ui/ui.test.ts` scanning UI files and components with `/\b(G[1-9]|M[0-7])\b/`.
- **Test**:
  - `src/ui/ui.test.ts`:
    1. Verified regex sensitivity on positive/negative controls.
    2. Proved scenario tabs render full untruncated names (`Latency`, `Blackout`, `Anomaly`, `Medical`, `Capture`).
    3. Proved no UI string across `src/ui/*.ts` matches `/\b(G[1-9]|M[0-7])\b/`.
    4. Proved no UI string in `src/main.ts` matches `/\b(G[1-9]|M[0-7])\b/`.
    5. Proved all `ScenarioDefinition` objects contain zero forbidden tokens.
  - Captured Playwright screenshots at 1280x720, 1440x900, 1920x1080.

