import React, { useState } from "react";
import { RotateCcw, Copy, Check, History, CloudCheck, Sparkles } from "lucide-react";
import { generateSparklinePath } from "../utils/typingMetrics";

export default function StatsModal({
  stats,
  wpmHistory,
  errorPoints = [],
  onRestart,
  onOpenHistory,
  modeInfo
}) {
  const [copied, setCopied] = useState(false);

  const { path, areaPath, points } = generateSparklinePath(wpmHistory, 640, 160);

  const handleCopy = () => {
    const text = `Monkeytype Clone Result:\n` +
      `⚡ WPM: ${stats.netWpm} (Gross: ${stats.grossWpm})\n` +
      `🎯 Accuracy: ${stats.accuracy}%\n` +
      `📊 Consistency: ${stats.consistency}%\n` +
      `⌨️ Characters: ${stats.charStats.correct}/${stats.charStats.incorrect}/${stats.charStats.extra}/${stats.charStats.missed}\n` +
      `⏱️ Mode: ${modeInfo}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="result-container">
      {/* Top Section: WPM, Accuracy, and Sparkline Chart */}
      <div className="result-summary-grid">
        <div className="primary-stat-column">
          <div className="stat-block">
            <span className="stat-label">wpm</span>
            <span className="stat-value-huge">{stats.netWpm}</span>
          </div>
          <div className="stat-block">
            <span className="stat-label">acc</span>
            <span className="stat-value-huge" style={{ fontSize: "3.2rem" }}>
              {stats.accuracy}%
            </span>
          </div>
        </div>

        {/* SVG Sparkline Progression */}
        <div className="sparkline-card">
          <div className="chart-header">
            <span>typing speed progression</span>
            <span>{wpmHistory.length}s elapsed</span>
          </div>

          <svg className="sparkline-svg" viewBox="0 0 640 160">
            <defs>
              <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e2b714" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#e2b714" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Shaded Area */}
            {areaPath && (
              <path d={areaPath} fill="url(#wpmGradient)" />
            )}

            {/* Smooth Curve */}
            {path && (
              <path
                d={path}
                fill="none"
                stroke="#e2b714"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data points */}
            {points.map((pt, idx) => (
              <circle
                key={idx}
                cx={pt.x}
                cy={pt.y}
                r="3"
                fill="#e2b714"
              />
            ))}

            {/* Error indicators on chart */}
            {errorPoints.map((err, idx) => {
              // Map error timestamp to x coordinate
              const pct = (err.timeSecond / Math.max(1, wpmHistory.length)) * 600 + 20;
              return (
                <g key={`err-${idx}`}>
                  <line
                    x1={pct}
                    y1={20}
                    x2={pct}
                    y2={140}
                    stroke="#ca4754"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    opacity="0.8"
                  />
                  <circle
                    cx={pct}
                    cy={30}
                    r="4"
                    fill="#ca4754"
                  />
                </g>
              );
            })}
          </svg>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--sub-color)" }}>
            <span>0s</span>
            <span>{Math.round(wpmHistory.length / 2)}s</span>
            <span>{wpmHistory.length}s</span>
          </div>
        </div>
      </div>

      {/* Detailed Stat Badges */}
      <div className="stats-detail-grid">
        <div className="detail-card">
          <div className="detail-title">test type</div>
          <div className="detail-value" style={{ fontSize: "1.2rem" }}>{modeInfo}</div>
          <div className="detail-sub">standard dictionary</div>
        </div>

        <div className="detail-card">
          <div className="detail-title">raw wpm</div>
          <div className="detail-value">{stats.grossWpm}</div>
          <div className="detail-sub">gross typing speed</div>
        </div>

        <div className="detail-card">
          <div className="detail-title">characters</div>
          <div className="detail-value">
            <span style={{ color: "var(--text-color)" }}>{stats.charStats.correct}</span>
            <span style={{ color: "var(--sub-color)" }}>/</span>
            <span style={{ color: "var(--error-color)" }}>{stats.charStats.incorrect}</span>
            <span style={{ color: "var(--sub-color)" }}>/</span>
            <span style={{ color: "var(--error-extra-color)" }}>{stats.charStats.extra}</span>
            <span style={{ color: "var(--sub-color)" }}>/</span>
            <span style={{ color: "var(--sub-color)" }}>{stats.charStats.missed}</span>
          </div>
          <div className="detail-sub">correct/incorrect/extra/missed</div>
        </div>

        <div className="detail-card">
          <div className="detail-title">consistency</div>
          <div className="detail-value">{stats.consistency}%</div>
          <div className="detail-sub">smoothness of pace</div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="result-actions">
        <button className="action-btn primary" onClick={onRestart}>
          <RotateCcw size={18} />
          <span>Next Test (Tab + Enter)</span>
        </button>

        <button className="action-btn" onClick={handleCopy}>
          {copied ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
          <span>{copied ? "Copied!" : "Copy Result"}</span>
        </button>

        <button className="action-btn" onClick={onOpenHistory}>
          <History size={18} />
          <span>View History</span>
        </button>
      </div>
    </div>
  );
}
