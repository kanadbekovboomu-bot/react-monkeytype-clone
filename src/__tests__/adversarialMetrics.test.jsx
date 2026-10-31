import { describe, it, expect } from "vitest";
import {
  calculateGrossWpm,
  calculateNetWpm,
  calculateAccuracy,
  calculateConsistency,
  getCharacterStats,
  generateSparklinePath
} from "../utils/typingMetrics";

describe("Adversarial Stress Tests - Monkeytype Typing Metrics", () => {
  describe("Extreme & Boundary Inputs for Gross & Net WPM", () => {
    it("handles zero elapsed time safely without returning Infinity or NaN", () => {
      expect(calculateGrossWpm(100, 0)).toBe(0);
      expect(calculateNetWpm(100, 0)).toBe(0);
      expect(Number.isFinite(calculateGrossWpm(100, 0))).toBe(true);
      expect(Number.isFinite(calculateNetWpm(100, 0))).toBe(true);
    });

    it("handles negative elapsed time safely without returning negative WPM", () => {
      expect(calculateGrossWpm(100, -1)).toBe(0);
      expect(calculateGrossWpm(100, -60)).toBe(0);
      expect(calculateGrossWpm(100, -Infinity)).toBe(0);
      expect(calculateNetWpm(100, -5)).toBe(0);
      expect(calculateNetWpm(100, -Infinity)).toBe(0);
    });

    it("handles zero keystrokes safely", () => {
      expect(calculateGrossWpm(0, 60)).toBe(0);
      expect(calculateNetWpm(0, 60)).toBe(0);
      expect(calculateGrossWpm(0, 0)).toBe(0);
      expect(calculateNetWpm(0, 0)).toBe(0);
    });

    it("handles negative keystrokes safely", () => {
      expect(calculateGrossWpm(-50, 60)).toBe(0);
      expect(calculateNetWpm(-50, 60)).toBe(0);
    });

    it("handles 100% typing error rate (0 correct keystrokes with high total keystrokes)", () => {
      expect(calculateGrossWpm(500, 60)).toBe(100);
      expect(calculateNetWpm(0, 60)).toBe(0);
      expect(calculateAccuracy(0, 500)).toBe(0);
    });

    it("handles immense typing speeds without throwing or numerical overflow", () => {
      // 10,000 keystrokes in 0.5s = 2000 words in (1/120) min = 240,000 WPM
      const extremeGross = calculateGrossWpm(10000, 0.5);
      expect(extremeGross).toBe(240000);
      expect(Number.isFinite(extremeGross)).toBe(true);

      const massive = calculateGrossWpm(1e9, 60);
      expect(Number.isFinite(massive)).toBe(true);
      expect(massive).toBeGreaterThan(0);
    });

    it("handles sub-second fractional time intervals safely", () => {
      // 5 keystrokes in 0.1 seconds = 1 word in 0.1s = 600 WPM
      expect(calculateGrossWpm(5, 0.1)).toBe(600);
      expect(calculateNetWpm(5, 0.1)).toBe(600);
    });
  });

  describe("Extreme Inputs for Accuracy", () => {
    it("safely handles 0 total keystrokes without divide-by-zero", () => {
      expect(calculateAccuracy(0, 0)).toBe(100);
      expect(calculateAccuracy(5, 0)).toBe(100);
      expect(calculateAccuracy(-5, 0)).toBe(100);
    });

    it("clamps accuracy to 100% when correct exceeds total keystrokes", () => {
      expect(calculateAccuracy(150, 100)).toBe(100);
      expect(calculateAccuracy(9999, 50)).toBe(100);
    });

    it("clamps accuracy to 0% when correct is zero or negative", () => {
      expect(calculateAccuracy(0, 100)).toBe(0);
      expect(calculateAccuracy(-10, 100)).toBe(0);
    });

    it("computes exact single decimal precision for odd fractions", () => {
      // 1 / 3 * 100 = 33.3333... -> 33.3
      expect(calculateAccuracy(1, 3)).toBe(33.3);
      // 2 / 3 * 100 = 66.6666... -> 66.7
      expect(calculateAccuracy(2, 3)).toBe(66.7);
    });
  });

  describe("Extreme Inputs for Consistency", () => {
    it("returns 100% for null, undefined, empty array, or single sample", () => {
      expect(calculateConsistency(null)).toBe(100);
      expect(calculateConsistency(undefined)).toBe(100);
      expect(calculateConsistency([])).toBe(100);
      expect(calculateConsistency([50])).toBe(100);
    });

    it("returns 100% when all samples are 0 (mean <= 0)", () => {
      expect(calculateConsistency([0, 0, 0, 0])).toBe(100);
    });

    it("returns 100% when mean is negative", () => {
      expect(calculateConsistency([-10, -20, -30])).toBe(100);
    });

    it("returns 100% for perfectly uniform samples", () => {
      expect(calculateConsistency([75, 75, 75, 75, 75])).toBe(100);
    });

    it("filters out NaN, Infinity, null, and non-numeric values gracefully", () => {
      expect(calculateConsistency([60, NaN, 60, "invalid", null, 60])).toBe(100);
      expect(calculateConsistency([Infinity, 50])).toBe(100);
      expect(calculateConsistency([Infinity, -Infinity, 80, 80])).toBe(100);
      expect(Number.isFinite(calculateConsistency([Infinity, 50]))).toBe(true);
    });

    it("clamps consistency between 0% and 100% even under massive erratic variance", () => {
      const extremeErratic = [1, 200, 1, 200, 1, 200];
      const consistency = calculateConsistency(extremeErratic);
      expect(consistency).toBeGreaterThanOrEqual(0);
      expect(consistency).toBeLessThanOrEqual(100);
    });

    it("scores completely wildly fluctuating speeds to 0% floor without going negative", () => {
      // Mean 25, variance huge -> cv > 100% -> consistency clamped to 0
      const score = calculateConsistency([0, 100, 0, 0, 0, 0]);
      expect(score).toBe(0);
    });
  });

  describe("Character Statistics Aggregator Edge Cases", () => {
    it("handles empty words array safely", () => {
      const stats = getCharacterStats([], 0);
      expect(stats).toEqual({ correct: 0, incorrect: 0, extra: 0, missed: 0, total: 0 });
    });

    it("handles activeWordIndex beyond words length", () => {
      const words = [
        { chars: [{ char: "a", status: "pending" }] },
        { chars: [{ char: "b", status: "pending" }] }
      ];
      // activeWordIndex is 10, so all pending chars in prior words are marked missed
      const stats = getCharacterStats(words, 10);
      expect(stats.missed).toBe(2);
      expect(stats.correct).toBe(0);
      expect(stats.total).toBe(0);
    });

    it("handles activeWordIndex = 0 correctly", () => {
      const words = [
        { chars: [{ char: "a", status: "pending" }] }
      ];
      const stats = getCharacterStats(words, 0);
      expect(stats.missed).toBe(0); // Word 0 is active, so pending is not missed yet
    });
  });

  describe("Sparkline Generator Edge Cases", () => {
    it("handles empty, null, or undefined points without errors", () => {
      expect(generateSparklinePath(null).points).toEqual([]);
      expect(generateSparklinePath(undefined).points).toEqual([]);
      expect(generateSparklinePath([]).points).toEqual([]);
    });

    it("handles all-zero points without divide-by-zero or NaN in SVG path", () => {
      const res = generateSparklinePath([0, 0, 0]);
      expect(res.path).not.toContain("NaN");
      expect(res.areaPath).not.toContain("NaN");
      expect(res.points).toHaveLength(3);
    });

    it("handles identical non-zero values without division by zero", () => {
      const res = generateSparklinePath([50, 50, 50, 50]);
      expect(res.path).not.toContain("NaN");
      expect(res.areaPath).not.toContain("NaN");
      expect(res.points).toHaveLength(4);
    });
  });
});
