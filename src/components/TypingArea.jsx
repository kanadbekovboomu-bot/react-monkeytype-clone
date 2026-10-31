import React, { useRef, useEffect, useState, useLayoutEffect } from "react";
import { RotateCcw } from "lucide-react";
import { calculateAccuracy, calculateNetWpm } from "../utils/typingMetrics";

export default function TypingArea({
  words,
  activeWordIndex,
  activeCharIndex,
  mode,
  timeLeft,
  totalWords,
  isRunning,
  hasStarted,
  onKeyDown,
  onRestart,
  liveMetrics
}) {
  const viewportRef = useRef(null);
  const wordsWrapperRef = useRef(null);
  const hiddenInputRef = useRef(null);
  const [caretPos, setCaretPos] = useState({ left: 0, top: 8 });
  const [scrollOffsetY, setScrollOffsetY] = useState(0);

  // Focus hidden input whenever viewport is clicked
  const handleViewportClick = () => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  };

  useEffect(() => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  }, [hasStarted, words]);

  // Recalculate caret position and multi-line smooth scrolling
  useLayoutEffect(() => {
    if (!viewportRef.current || !wordsWrapperRef.current) return;

    const viewportRect = viewportRef.current.getBoundingClientRect();
    const activeWordEl = wordsWrapperRef.current.querySelector(
      `[data-word-idx="${activeWordIndex}"]`
    );

    if (!activeWordEl) return;

    // Check line position for scrolling
    // Line height is approximately 45px
    const wordOffsetTop = activeWordEl.offsetTop;
    const lineHeight = 45;

    // If word is on line 2 or higher (offsetTop >= 45*2), scroll so it stays on line 2
    if (wordOffsetTop >= lineHeight * 2) {
      const shift = wordOffsetTop - lineHeight;
      setScrollOffsetY(shift);
    } else {
      setScrollOffsetY(0);
    }

    // Determine caret coordinate
    const charEl = activeWordEl.querySelector(
      `[data-char-idx="${activeCharIndex}"]`
    );

    if (charEl) {
      const charRect = charEl.getBoundingClientRect();
      setCaretPos({
        left: charRect.left - viewportRect.left,
        top: charRect.top - viewportRect.top
      });
    } else {
      // End of word or word has extra characters
      const allChars = activeWordEl.querySelectorAll(".char");
      if (allChars.length > 0) {
        const lastChar = allChars[allChars.length - 1];
        const lastCharRect = lastChar.getBoundingClientRect();
        setCaretPos({
          left: lastCharRect.right - viewportRect.left,
          top: lastCharRect.top - viewportRect.top
        });
      } else {
        const wordRect = activeWordEl.getBoundingClientRect();
        setCaretPos({
          left: wordRect.left - viewportRect.left,
          top: wordRect.top - viewportRect.top
        });
      }
    }
  }, [activeWordIndex, activeCharIndex, words, scrollOffsetY]);

  return (
    <div className="typing-section" onClick={handleViewportClick}>
      {/* Live metrics / countdown */}
      <div className="live-stats">
        {mode === "time" ? (
          <div className="live-stat-item">
            <span>{timeLeft}</span>
            <span className="live-stat-label">s</span>
          </div>
        ) : (
          <div className="live-stat-item">
            <span>{activeWordIndex}/{totalWords}</span>
            <span className="live-stat-label">words</span>
          </div>
        )}

        {hasStarted && (
          <>
            <div className="live-stat-item" style={{ marginLeft: 32 }}>
              <span style={{ fontSize: "1.4rem" }}>{liveMetrics.wpm}</span>
              <span className="live-stat-label">wpm</span>
            </div>
            <div className="live-stat-item">
              <span style={{ fontSize: "1.4rem" }}>{liveMetrics.accuracy}%</span>
              <span className="live-stat-label">acc</span>
            </div>
          </>
        )}
      </div>

      {/* Typing Viewport: Exactly 3 visible lines */}
      <div
        className="typing-viewport"
        ref={viewportRef}
        tabIndex={0}
      >
        {/* Animated Smooth Caret */}
        <div
          className={`caret ${!isRunning ? "blink" : ""}`}
          style={{
            transform: `translate3d(${caretPos.left}px, ${caretPos.top}px, 0)`
          }}
        />

        {/* Hidden input to catch keyboard events reliably */}
        <input
          ref={hiddenInputRef}
          type="text"
          className="hidden-typing-input"
          onKeyDown={onKeyDown}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
        />

        {/* Words container */}
        <div
          className="words-wrapper"
          ref={wordsWrapperRef}
          style={{
            transform: `translate3d(0, -${scrollOffsetY}px, 0)`
          }}
        >
          {words.map((wordObj, wIdx) => {
            const isActiveWord = wIdx === activeWordIndex;
            return (
              <div
                key={wordObj.id}
                className={`word ${isActiveWord ? "active" : ""}`}
                data-word-idx={wIdx}
              >
                {wordObj.chars.map((c, cIdx) => (
                  <span
                    key={cIdx}
                    className={`char ${c.status}`}
                    data-char-idx={cIdx}
                  >
                    {c.char}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Restart button and keyboard shortcuts */}
      <div className="restart-section">
        <button
          className="restart-btn"
          onClick={onRestart}
          title="Restart Test (Tab + Enter)"
          aria-label="Restart Test"
        >
          <RotateCcw size={22} />
        </button>
        <div className="shortcut-tip">
          <span className="key-badge">tab</span> + <span className="key-badge">enter</span> - restart test
        </div>
      </div>
    </div>
  );
}
