import React from "react";
import { AtSign, Hash, Clock, FileText } from "lucide-react";

export default function ModeSelector({
  mode,
  setMode,
  timeDuration,
  setTimeDuration,
  wordCount,
  setWordCount,
  includePunctuation,
  setIncludePunctuation,
  includeNumbers,
  setIncludeNumbers,
  disabled
}) {
  const timeOptions = [15, 30, 60];
  const wordOptions = [10, 25, 50, 100];

  return (
    <div className="mode-bar-container">
      <div className="mode-bar" style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? "none" : "auto" }}>
        {/* Modifiers */}
        <div className="mode-group">
          <button
            className={`mode-btn ${includePunctuation ? "active" : ""}`}
            onClick={() => setIncludePunctuation(!includePunctuation)}
            title="Toggle Punctuation"
          >
            <AtSign size={14} />
            <span>punctuation</span>
          </button>
          <button
            className={`mode-btn ${includeNumbers ? "active" : ""}`}
            onClick={() => setIncludeNumbers(!includeNumbers)}
            title="Toggle Numbers"
          >
            <Hash size={14} />
            <span>numbers</span>
          </button>
        </div>

        <div className="mode-divider" />

        {/* Mode switcher */}
        <div className="mode-group">
          <button
            className={`mode-btn ${mode === "time" ? "active" : ""}`}
            onClick={() => setMode("time")}
          >
            <Clock size={14} />
            <span>time</span>
          </button>
          <button
            className={`mode-btn ${mode === "words" ? "active" : ""}`}
            onClick={() => setMode("words")}
          >
            <FileText size={14} />
            <span>words</span>
          </button>
        </div>

        <div className="mode-divider" />

        {/* Mode options */}
        <div className="mode-group">
          {mode === "time" ? (
            timeOptions.map((t) => (
              <button
                key={t}
                className={`mode-btn ${timeDuration === t ? "active" : ""}`}
                onClick={() => setTimeDuration(t)}
              >
                {t}
              </button>
            ))
          ) : (
            wordOptions.map((w) => (
              <button
                key={w}
                className={`mode-btn ${wordCount === w ? "active" : ""}`}
                onClick={() => setWordCount(w)}
              >
                {w}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
