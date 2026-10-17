/**
 * AEGIS TRANSIT — Automated Benchmark Evaluation Web Worker
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Runs comprehensive verification benchmarks off the main thread so
 * 60 FPS UI rendering, WebGL starfield, and Canvas map never drop a frame.
 */

import { runEvalBenchmarks } from './eval-runner.js';

self.onmessage = async (event: MessageEvent) => {
  const { type, seed = 42 } = event.data || {};
  if (type === 'RUN_EVAL') {
    try {
      const record = await runEvalBenchmarks(seed);
      self.postMessage({ type: 'EVAL_COMPLETE', data: record });
    } catch (err) {
      self.postMessage({ type: 'EVAL_ERROR', error: (err as Error).message });
    }
  }
};
