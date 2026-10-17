import { describe, it, expect } from 'vitest';
import { runEvalBenchmarks, OUT_OF_KNOWLEDGE_QUESTIONS } from './eval-runner.js';
import { saveEvalResults, getLatestEvalResults, type CachedEvalRecord } from './eval-storage.js';

describe('Evaluation Suite Benchmarks & Persistence (A5)', () => {
  it('contains exactly 20 diverse out-of-knowledge questions', () => {
    expect(OUT_OF_KNOWLEDGE_QUESTIONS.length).toBe(20);
    // Ensure all questions are distinct
    const unique = new Set(OUT_OF_KNOWLEDGE_QUESTIONS);
    expect(unique.size).toBe(20);
  });

  it('runs all real benchmarks non-blockingly and satisfies all performance invariants', async () => {
    const record = await runEvalBenchmarks(12345);

    expect(record).toBeDefined();
    expect(record.rngSeed).toBe(12345);
    expect(record.gitCommitHash).toBeTruthy();
    expect(record.timestamp).toBeTruthy();
    expect(record.results.length).toBe(8);

    if (!record.summary.allPassed) {
      console.error('FAILED BENCHMARKS:', record.results.filter(r => !r.passed));
    }
    // Verify all 8 benchmarks passed
    expect(record.summary.totalTests).toBe(8);
    expect(record.summary.totalPassed).toBe(8);
    expect(record.summary.allPassed).toBe(true);
    expect(record.summary.durationMs).toBeGreaterThan(0);

    // Verify individual required metric checks:
    // 1. Time to first diagnosis
    const diagMetric = record.results.find(r => r.testName === 'Time to First Diagnosis');
    expect(diagMetric).toBeDefined();
    expect(diagMetric!.passed).toBe(true);
    expect(diagMetric!.durationMs).toBeLessThan(50.0);

    // 2. Refusal rate on 20 out-of-knowledge questions
    const refusalMetric = record.results.find(r => r.testName === 'Refusal Rate on 20 Out-of-Knowledge Questions');
    expect(refusalMetric).toBeDefined();
    expect(refusalMetric!.passed).toBe(true);
    expect(refusalMetric!.measuredValue).toContain('100.0% (20/20)');

    // 3. Maximum Shapley additivity error
    const shapMetric = record.results.find(r => r.testName === 'Maximum Shapley Additivity Error');
    expect(shapMetric).toBeDefined();
    expect(shapMetric!.passed).toBe(true);

    // 4. Explanation rank-stability
    const rankMetric = record.results.find(r => r.testName === 'Explanation Rank-Stability Under Noise');
    expect(rankMetric).toBeDefined();
    expect(rankMetric!.passed).toBe(true);

    // 5. Spool delivery stats
    const spoolMetric = record.results.find(r => r.testName === 'Spool Delivery & Preemption Stats');
    expect(spoolMetric).toBeDefined();
    expect(spoolMetric!.passed).toBe(true);
    expect(spoolMetric!.measuredValue).toContain('P0: 4/4 (100%)');

    // 6. Swap verification
    const swapMetric = record.results.find(r => r.testName === 'A/B Working Set Swap Verification');
    expect(swapMetric).toBeDefined();
    expect(swapMetric!.passed).toBe(true);
    expect(swapMetric!.measuredValue).toContain('VERIFIED');
  });

  it('persists and retrieves evaluation records in cache with metadata', async () => {
    const dummyRecord: CachedEvalRecord = {
      timestamp: new Date().toISOString(),
      timestampMs: Date.now(),
      rngSeed: 9999,
      gitCommitHash: 'test-commit',
      results: [
        {
          suiteName: 'Test Suite',
          testName: 'Test Diagnostic',
          passed: true,
          metricName: 'Latency',
          measuredValue: '1.200 ms',
          targetThreshold: '< 50.000 ms',
          durationMs: 1.2,
        },
      ],
      summary: {
        totalTests: 1,
        totalPassed: 1,
        allPassed: true,
        durationMs: 1.2,
      },
    };

    await saveEvalResults(dummyRecord);
    const retrieved = await getLatestEvalResults();

    expect(retrieved).toBeDefined();
    expect(retrieved!.rngSeed).toBe(9999);
    expect(retrieved!.gitCommitHash).toBe('test-commit');
    expect(retrieved!.results.length).toBe(1);
    expect(retrieved!.summary.totalPassed).toBe(1);
  });
});
