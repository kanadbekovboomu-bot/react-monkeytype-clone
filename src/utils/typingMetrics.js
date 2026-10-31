/**
 * International Typing Speed Metric Engine
 * Standard: 1 word = 5 keystrokes
 */

/**
 * Calculates Gross (Raw) Words Per Minute
 * @param {number} totalKeystrokes - Total keystrokes entered
 * @param {number} timeSeconds - Elapsed time in seconds
 * @returns {number} Gross WPM rounded to 1 decimal place
 */
export function calculateGrossWpm(totalKeystrokes, timeSeconds) {
  if (timeSeconds <= 0 || totalKeystrokes <= 0) return 0;
  const timeMinutes = timeSeconds / 60;
  const wpm = (totalKeystrokes / 5) / timeMinutes;
  return Math.max(0, Math.round(wpm * 10) / 10);
}

/**
 * Calculates Net (Accurate) Words Per Minute
 * Formula: max(0, (correctKeystrokes / 5) / timeMinutes)
 * @param {number} correctKeystrokes - Count of correct keystrokes
 * @param {number} timeSeconds - Elapsed time in seconds
 * @returns {number} Net WPM rounded to 1 decimal place
 */
export function calculateNetWpm(correctKeystrokes, timeSeconds) {
  if (timeSeconds <= 0 || correctKeystrokes <= 0) return 0;
  const timeMinutes = timeSeconds / 60;
  const wpm = (correctKeystrokes / 5) / timeMinutes;
  return Math.max(0, Math.round(wpm * 10) / 10);
}

/**
 * Calculates Accuracy percentage
 * Formula: (correctKeystrokes / totalKeystrokes) * 100
 * @param {number} correctKeystrokes
 * @param {number} totalKeystrokes
 * @returns {number} Accuracy percentage rounded to 1 decimal place
 */
export function calculateAccuracy(correctKeystrokes, totalKeystrokes) {
  if (totalKeystrokes <= 0) return 100;
  if (correctKeystrokes <= 0) return 0;
  const acc = (correctKeystrokes / totalKeystrokes) * 100;
  return Math.min(100, Math.max(0, Math.round(acc * 10) / 10));
}

/**
 * Calculates typing consistency percentage from rolling WPM samples
 * Formula: max(0, 100 - (stdev / mean * 100))
 * @param {number[]} wpmSamples - Array of WPM samples recorded each second
 * @returns {number} Consistency percentage rounded to 1 decimal place
 */
export function calculateConsistency(wpmSamples) {
  if (!wpmSamples || wpmSamples.length < 2) return 100;

  const validSamples = wpmSamples.filter(s => Number.isFinite(s));
  if (validSamples.length < 2) return 100;

  const n = validSamples.length;
  const mean = validSamples.reduce((sum, val) => sum + val, 0) / n;
  if (mean <= 0) return 100;

  const variance = validSamples.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  const cv = (stdDev / mean) * 100;
  const consistency = Math.max(0, Math.min(100, 100 - cv));
  return Math.round(consistency * 10) / 10;
}

/**
 * Aggregates character statistics and error breakdown across words
 * @param {Array<{ chars: Array<{ char: string, status: string }> }>} words
 * @param {number} activeWordIndex
 * @returns {{ correct: number, incorrect: number, extra: number, missed: number, total: number }}
 */
export function getCharacterStats(words, activeWordIndex) {
  let correct = 0;
  let incorrect = 0;
  let extra = 0;
  let missed = 0;

  words.forEach((w, wIdx) => {
    w.chars.forEach(c => {
      if (c.status === "correct") correct++;
      else if (c.status === "incorrect") incorrect++;
      else if (c.status === "extra") extra++;
      else if (c.status === "missed") missed++;
      else if (c.status === "pending" && wIdx < activeWordIndex) missed++;
    });
  });

  const total = correct + incorrect + extra;
  return { correct, incorrect, extra, missed, total };
}

/**
 * Generates an SVG path string for a sparkline chart
 * @param {number[]} points - Array of numbers to plot
 * @param {number} width - SVG viewBox width
 * @param {number} height - SVG viewBox height
 * @returns {{ path: string, areaPath: string, points: Array<{ x: number, y: number, value: number }> }}
 */
export function generateSparklinePath(points, width = 600, height = 180) {
  if (!points || points.length === 0) {
    return { path: "", areaPath: "", points: [] };
  }

  const padding = 20;
  const effectiveWidth = width - padding * 2;
  const effectiveHeight = height - padding * 2;

  const maxVal = Math.max(...points, 10);
  const minVal = Math.min(...points, 0);
  const range = maxVal - minVal || 1;

  const stepX = points.length > 1 ? effectiveWidth / (points.length - 1) : effectiveWidth;

  const coords = points.map((val, idx) => {
    const x = padding + idx * stepX;
    const y = height - padding - ((val - minVal) / range) * effectiveHeight;
    return { x, y, value: val };
  });

  if (coords.length === 1) {
    const single = coords[0];
    const path = `M ${padding} ${single.y} L ${width - padding} ${single.y}`;
    const areaPath = `M ${padding} ${single.y} L ${width - padding} ${single.y} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`;
    return { path, areaPath, points: coords };
  }

  // Generate smooth cubic bezier SVG curve
  let path = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i];
    const p1 = coords[i + 1];
    const cpX1 = p0.x + (p1.x - p0.x) / 2;
    const cpY1 = p0.y;
    const cpX2 = p0.x + (p1.x - p0.x) / 2;
    const cpY2 = p1.y;
    path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
  }

  const last = coords[coords.length - 1];
  const first = coords[0];
  const areaPath = `${path} L ${last.x} ${height - padding} L ${first.x} ${height - padding} Z`;

  return { path, areaPath, points: coords };
}
