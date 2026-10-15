/**
 * AEGIS TRANSIT — UI Module
 * 
 * Plain DOM / CSS mission console panels:
 * - Top bar: Mission time (MET/UTC), warp controls, master alarm status
 * - Left panel: Subsystems telemetry tree, sensor health, sparklines
 * - Center view: 3D orbit / 2D tactical maps / procedure execution
 * - Right panel: Subsystems telemetry panel with 60-second sparklines
 * - Bottom panel: Fault injection matrix and event logs
 * - Comms console: Deep-space RF link, scenario override, priority spool
 * - AI console: Tier 1 diagnostics, Shapley bars, Tier 2 search, Medical CDSS, Safety Gate
 * - Memory view: R0-R3 memory map, SEU scrubber, bit-flip injection
 * - Scenario runner: Guided scenarios S1 - S5
 * - Evaluation suite: Automated verification benchmarks & metrics report
 */

export * from './telemetry-panel.js';
export * from './fault-panel.js';
export * from './comms-console.js';
export * from './ai-console.js';
export * from './memory-view.js';
export * from './scenario-runner.js';
export * from './eval-suite.js';
