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
