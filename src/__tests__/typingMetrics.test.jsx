import { describe, it, expect } from "vitest";
import {
  calculateGrossWpm,
  calculateNetWpm,
  calculateAccuracy,
  calculateConsistency,
  getCharacterStats,
  generateSparklinePath
} from "../utils/typingMetrics";
import { generateWords, WORD_POOL } from "../utils/wordGenerator";

describe("Typing Metrics Engine", () => {
  describe("calculateGrossWpm", () => {
    it("should calculate correct Gross WPM for standard 60-second test", () => {
      // 300 keystrokes in 60 seconds = (300 / 5) / 1 min = 60 WPM
      expect(calculateGrossWpm(300, 60)).toBe(60);
    });

    it("should calculate correct Gross WPM for non-standard durations", () => {
      // 150 keystrokes in 30 seconds = (150 / 5) / 0.5 min = 60 WPM
      expect(calculateGrossWpm(150, 30)).toBe(60);
      // 75 keystrokes in 15 seconds = (75 / 5) / 0.25 min = 60 WPM
      expect(calculateGrossWpm(75, 15)).toBe(60);
    });

    it("should safely handle zero or negative inputs without NaN", () => {
      expect(calculateGrossWpm(0, 60)).toBe(0);
      expect(calculateGrossWpm(300, 0)).toBe(0);
      expect(calculateGrossWpm(-50, 60)).toBe(0);
      expect(calculateGrossWpm(300, -10)).toBe(0);
    });
  });

  describe("calculateNetWpm", () => {
    it("should calculate accurate Net WPM based on correct keystrokes", () => {
      // 250 correct keystrokes in 60 seconds = (250 / 5) / 1 min = 50 Net WPM
      expect(calculateNetWpm(250, 60)).toBe(50);
    });

    it("should clamp to 0 when correct keystrokes is 0 or negative", () => {
      expect(calculateNetWpm(0, 60)).toBe(0);
      expect(calculateNetWpm(-10, 60)).toBe(0);
    });

    it("should return 0 when time is zero or negative", () => {
      expect(calculateNetWpm(250, 0)).toBe(0);
      expect(calculateNetWpm(250, -5)).toBe(0);
    });
  });

  describe("calculateAccuracy", () => {
    it("should calculate exact accuracy percentages", () => {
      expect(calculateAccuracy(100, 100)).toBe(100);
      expect(calculateAccuracy(95, 100)).toBe(95);
      expect(calculateAccuracy(45, 50)).toBe(90);
    });

    it("should return 0% when no correct keystrokes were typed", () => {
      expect(calculateAccuracy(0, 50)).toBe(0);
    });

    it("should safely return 100% when no keystrokes have occurred yet", () => {
      expect(calculateAccuracy(0, 0)).toBe(100);
    });

    it("should clamp accuracy between 0 and 100%", () => {
      expect(calculateAccuracy(120, 100)).toBe(100);
      expect(calculateAccuracy(-5, 50)).toBe(0);
    });
  });

  describe("calculateConsistency", () => {
    it("should return 100% for perfectly steady typing speed", () => {
      expect(calculateConsistency([60, 60, 60, 60])).toBe(100);
    });

    it("should return 100% for empty or single sample inputs", () => {
      expect(calculateConsistency([])).toBe(100);
      expect(calculateConsistency([60])).toBe(100);
      expect(calculateConsistency(null)).toBe(100);
      expect(calculateConsistency([Infinity, 50])).toBe(100);
      expect(calculateConsistency([Infinity, -Infinity])).toBe(100);
    });

    it("should compute lower consistency when variance is high", () => {
      const stableScore = calculateConsistency([58, 60, 62, 59, 61]);
      const erraticScore = calculateConsistency([20, 90, 10, 110, 40]);
      expect(stableScore).toBeGreaterThan(erraticScore);
      expect(erraticScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getCharacterStats", () => {
    it("should aggregate correct, incorrect, extra, and missed character counts", () => {
      const mockWords = [
        {
          chars: [
            { char: "t", status: "correct" },
            { char: "e", status: "correct" },
            { char: "s", status: "incorrect" },
            { char: "t", status: "correct" },
            { char: "s", status: "extra" }
          ]
        },
        {
          chars: [
            { char: "w", status: "correct" },
            { char: "o", status: "pending" },
            { char: "r", status: "pending" },
            { char: "d", status: "missed" }
          ]
        }
      ];

      // Word 1 is active (index 1), so pending in word 0 would be missed if any
      const stats = getCharacterStats(mockWords, 1);
      expect(stats.correct).toBe(4);
      expect(stats.incorrect).toBe(1);
      expect(stats.extra).toBe(1);
      expect(stats.missed).toBe(1);
      expect(stats.total).toBe(6); // correct + incorrect + extra
    });

    it("should mark pending chars in skipped words as missed", () => {
      const mockWords = [
        {
          chars: [
            { char: "a", status: "pending" },
            { char: "b", status: "pending" }
          ]
        },
        {
          chars: [
            { char: "c", status: "pending" }
          ]
        }
      ];

      // Active word is word index 1 (word 0 was skipped with pending characters)
      const stats = getCharacterStats(mockWords, 1);
      expect(stats.missed).toBe(2);
    });
  });

  describe("generateSparklinePath", () => {
    it("should return empty paths when points array is empty", () => {
      const res = generateSparklinePath([]);
      expect(res.path).toBe("");
      expect(res.areaPath).toBe("");
      expect(res.points).toEqual([]);
    });

    it("should return horizontal line when single point is provided", () => {
      const res = generateSparklinePath([50], 600, 180);
      expect(res.path).toContain("M 20");
      expect(res.points).toHaveLength(1);
    });

    it("should generate bezier curve commands for multiple points", () => {
      const res = generateSparklinePath([30, 45, 60, 55, 70], 600, 180);
      expect(res.path).toContain("C");
      expect(res.areaPath).toContain("Z");
      expect(res.points).toHaveLength(5);
    });
  });
});

describe("Word Generator", () => {
  it("should have a curated word pool containing 500+ words", () => {
    expect(WORD_POOL.length).toBeGreaterThanOrEqual(500);
  });

  it("should generate the requested word count", () => {
    const words10 = generateWords({ count: 10 });
    expect(words10).toHaveLength(10);

    const words50 = generateWords({ count: 50 });
    expect(words50).toHaveLength(50);
  });

  it("should initialize all characters in pending status", () => {
    const words = generateWords({ count: 5 });
    words.forEach(w => {
      expect(w.text.length).toBeGreaterThan(0);
      expect(w.chars.length).toBe(w.text.length);
      w.chars.forEach(c => {
        expect(c.status).toBe("pending");
      });
    });
  });

  it("should parse custom text into word objects", () => {
    const custom = "The quick brown fox\njumps   over\tthe lazy dog";
    const words = generateWords({ customText: custom });
    expect(words).toHaveLength(9);
    expect(words[0].text).toBe("The");
    expect(words[8].text).toBe("dog");
  });

  it("should inject punctuation and capitalization when enabled", () => {
    const words = generateWords({ count: 30, includePunctuation: true });
    // First word should be capitalized
    expect(words[0].text.charAt(0)).toBe(words[0].text.charAt(0).toUpperCase());
    // At least one word should have punctuation
    const hasPunctuation = words.some(w => /[.,!?;:]/.test(w.text));
    expect(hasPunctuation).toBe(true);
  });

  it("should inject numbers when enabled", () => {
    const words = generateWords({ count: 50, includeNumbers: true });
    const hasNumber = words.some(w => /\d/.test(w.text));
    expect(hasNumber).toBe(true);
  });
});
