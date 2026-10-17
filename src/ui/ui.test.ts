import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { SCENARIOS } from './scenario-runner.js';

describe('UI Labels & Hygiene Verification (A4)', () => {
  const forbiddenPattern = /\b(G[1-9]|M[0-7])\b/;

  it('fails if any forbidden internal milestone/guideline token matches regex', () => {
    // Sanity check to verify regex sensitivity
    expect(forbiddenPattern.test('M1 ACTIVE')).toBe(true);
    expect(forbiddenPattern.test('(G4)')).toBe(true);
    expect(forbiddenPattern.test('PROPOSE-ONLY (G4)')).toBe(true);
    expect(forbiddenPattern.test('M0')).toBe(true);
    expect(forbiddenPattern.test('M7')).toBe(true);
    expect(forbiddenPattern.test('G1')).toBe(true);
    expect(forbiddenPattern.test('G9')).toBe(true);

    // Legitimate words should NOT match
    expect(forbiddenPattern.test('Mars')).toBe(false);
    expect(forbiddenPattern.test('MOI')).toBe(false);
    expect(forbiddenPattern.test('GNC')).toBe(false);
    expect(forbiddenPattern.test('MET')).toBe(false);
  });

  it('verifies scenario tabs display full untruncated names', () => {
    const scenarioRunnerFile = path.resolve(__dirname, 'scenario-runner.ts');
    const content = fs.readFileSync(scenarioRunnerFile, 'utf-8');

    // Extract the buttons within scen-selector
    const selectorMatch = content.match(/<div class="scen-selector">([\s\S]*?)<\/div>/);
    expect(selectorMatch).toBeTruthy();
    const selectorHtml = selectorMatch![1];

    const expectedTabNames = ['Latency', 'Blackout', 'Anomaly', 'Medical', 'Capture'];
    for (const tabName of expectedTabNames) {
      expect(selectorHtml).toContain(tabName);
    }

    // Ensure no truncated or internal milestone numbers in tab buttons
    for (const tabName of expectedTabNames) {
      expect(forbiddenPattern.test(tabName)).toBe(false);
    }
    expect(selectorHtml).not.toContain('S1:');
    expect(selectorHtml).not.toContain('S2:');
  });

  it('verifies no UI string in src/ui matches /\\b(G[1-9]|M[0-7])\\b/', () => {
    const uiDir = path.resolve(__dirname);
    const files = fs.readdirSync(uiDir).filter((f: string) => f.endsWith('.ts') && !f.endsWith('.test.ts'));

    const violations: { file: string; line: number; match: string; text: string }[] = [];

    for (const file of files) {
      const fullPath = path.join(uiDir, file);
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line: string, lineIdx: number) => {
        // Test visible UI strings (excluding pure SVG coordinates or comments if any)
        // Here we test every string in UI code:
        const match = line.match(forbiddenPattern);
        if (match) {
          violations.push({
            file,
            line: lineIdx + 1,
            match: match[0],
            text: line.trim(),
          });
        }
      });
    }

    expect(violations).toEqual([]);
  });

  it('verifies no UI string in main.ts matches /\\b(G[1-9]|M[0-7])\\b/', () => {
    const mainFile = path.resolve(__dirname, '../main.ts');
    const content = fs.readFileSync(mainFile, 'utf-8');
    const lines = content.split('\n');

    const violations: { line: number; match: string; text: string }[] = [];

    lines.forEach((line: string, lineIdx: number) => {
      const match = line.match(forbiddenPattern);
      if (match) {
        violations.push({
          line: lineIdx + 1,
          match: match[0],
          text: line.trim(),
        });
      }
    });

    expect(violations).toEqual([]);
  });

  it('verifies all ScenarioDefinition titles and steps do not contain forbidden internal labels', () => {
    for (const scen of SCENARIOS) {
      expect(forbiddenPattern.test(scen.id)).toBe(false);
      expect(forbiddenPattern.test(scen.title)).toBe(false);
      expect(forbiddenPattern.test(scen.summary)).toBe(false);
      for (const step of scen.steps) {
        expect(forbiddenPattern.test(step)).toBe(false);
      }
    }
  });
});
