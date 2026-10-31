import React, { useState, useEffect, useRef, useCallback } from "react";
import Header from "./components/Header";
import ModeSelector from "./components/ModeSelector";
import TypingArea from "./components/TypingArea";
import StatsModal from "./components/StatsModal";
import AuthModal from "./components/AuthModal";
import HistoryModal from "./components/HistoryModal";
import { generateWords } from "./utils/wordGenerator";
import {
  calculateNetWpm,
  calculateGrossWpm,
  calculateAccuracy,
  calculateConsistency,
  getCharacterStats
} from "./utils/typingMetrics";
import { subscribeToAuth, signOutUser } from "./services/firebase";
import { saveMonkeytypeResult } from "./services/storageAdapter";

const THEMES = ["default", "serika-light", "carbon"];

export default function App() {
  // Theme state
  const [themeIdx, setThemeIdx] = useState(0);

  // User auth state
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Test mode configuration
  const [mode, setMode] = useState("time"); // 'time' | 'words'
  const [timeDuration, setTimeDuration] = useState(30);
  const [wordCount, setWordCount] = useState(25);
  const [includePunctuation, setIncludePunctuation] = useState(false);
  const [includeNumbers, setIncludeNumbers] = useState(false);

  // Typing engine state
  const [words, setWords] = useState([]);
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [activeCharIndex, setActiveCharIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Metrics tracking
  const [keystrokes, setKeystrokes] = useState({ correct: 0, total: 0 });
  const [wpmHistory, setWpmHistory] = useState([]);
  const [errorPoints, setErrorPoints] = useState([]);
  const [finalStats, setFinalStats] = useState(null);

  // Ref tracking
  const startTimeRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const sampleIntervalRef = useRef(null);
  const tabPressedRef = useRef(false);

  // Toggle visual theme
  const toggleTheme = () => {
    const nextIdx = (themeIdx + 1) % THEMES.length;
    setThemeIdx(nextIdx);
    const themeName = THEMES[nextIdx];
    if (themeName === "default") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", themeName);
    }
  };

  // Auth listener
  useEffect(() => {
    const unsubscribe = subscribeToAuth((activeUser) => {
      setUser(activeUser);
    });
    return () => unsubscribe();
  }, []);

  // Initialize word set
  const initTest = useCallback(() => {
    // Clear any running timers
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (sampleIntervalRef.current) clearInterval(sampleIntervalRef.current);

    const count = mode === "words" ? wordCount : Math.max(100, timeDuration * 4);
    const newWords = generateWords({
      count,
      includePunctuation,
      includeNumbers
    });

    setWords(newWords);
    setActiveWordIndex(0);
    setActiveCharIndex(0);
    setHasStarted(false);
    setIsCompleted(false);
    setTimeLeft(timeDuration);
    setElapsedSeconds(0);
    setKeystrokes({ correct: 0, total: 0 });
    setWpmHistory([]);
    setErrorPoints([]);
    setFinalStats(null);
    startTimeRef.current = null;
  }, [mode, timeDuration, wordCount, includePunctuation, includeNumbers]);

  // Reinitialize words when settings change
  useEffect(() => {
    initTest();
  }, [initTest]);

  // Complete session and compute final metrics
  const completeTest = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (sampleIntervalRef.current) clearInterval(sampleIntervalRef.current);

    const elapsed = Math.max(1, startTimeRef.current ? (Date.now() - startTimeRef.current) / 1000 : 1);
    const charStats = getCharacterStats(words, activeWordIndex);

    const netWpm = calculateNetWpm(keystrokes.correct, elapsed);
    const grossWpm = calculateGrossWpm(keystrokes.total, elapsed);
    const accuracy = calculateAccuracy(keystrokes.correct, keystrokes.total);
    const consistency = calculateConsistency(wpmHistory.length > 0 ? wpmHistory : [netWpm]);

    const stats = {
      netWpm,
      grossWpm,
      accuracy,
      consistency,
      charStats,
      duration: Math.round(elapsed)
    };

    setFinalStats(stats);
    setIsCompleted(true);
    setHasStarted(false);

    // Save result to Firebase / LocalStorage adapter
    const modeLabel = mode === "time" ? `${timeDuration}s` : `${wordCount}w`;
    saveMonkeytypeResult({
      userId: user ? user.uid : "anonymous",
      userDisplayName: user ? user.displayName : "Guest Typist",
      isAnonymous: !user || user.isAnonymous,
      netWpm,
      grossWpm,
      accuracy,
      mode,
      durationSeconds: Math.round(elapsed),
      wordCount: activeWordIndex,
      errorCount: charStats.incorrect + charStats.extra + charStats.missed,
      consistency
    });
  }, [words, activeWordIndex, keystrokes, wpmHistory, mode, timeDuration, wordCount, user]);

  // Active timer ticks and 1-second WPM sampling
  useEffect(() => {
    if (!hasStarted || isCompleted) return;

    // 1-second interval for countdown & metric sampling
    const interval = setInterval(() => {
      setElapsedSeconds(prev => {
        const nextElapsed = prev + 1;
        const currentWpm = calculateNetWpm(keystrokes.correct, nextElapsed);
        setWpmHistory(hist => [...hist, currentWpm]);
        return nextElapsed;
      });

      if (mode === "time") {
        setTimeLeft(prev => {
          if (prev <= 1) {
            completeTest();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    timerIntervalRef.current = interval;

    return () => clearInterval(interval);
  }, [hasStarted, isCompleted, mode, keystrokes.correct, completeTest]);

  // Keystroke state machine
  const handleKeyDown = (e) => {
    // Quick restarts: Tab + Enter or Escape
    if (e.key === "Tab") {
      tabPressedRef.current = true;
      e.preventDefault();
      return;
    }

    if (e.key === "Enter" && tabPressedRef.current) {
      tabPressedRef.current = false;
      e.preventDefault();
      initTest();
      return;
    }
    tabPressedRef.current = false;

    if (e.key === "Escape") {
      e.preventDefault();
      initTest();
      return;
    }

    // Ignore non-printable keys and modifier keys
    if (
      e.key === "Shift" ||
      e.key === "Control" ||
      e.key === "Alt" ||
      e.key === "Meta" ||
      e.key === "CapsLock" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "ArrowUp" ||
      e.key === "ArrowDown" ||
      e.key.startsWith("F")
    ) {
      return;
    }

    if (isCompleted) {
      if (e.key === "Enter") {
        initTest();
      }
      return;
    }

    // Start timer on first valid keypress
    if (!hasStarted) {
      setHasStarted(true);
      startTimeRef.current = Date.now();
    }

    const currentWord = words[activeWordIndex];
    if (!currentWord) return;

    // Handle Backspace
    if (e.key === "Backspace") {
      e.preventDefault();

      if (e.ctrlKey || e.altKey) {
        // Clear entire current active word
        setWords(prevWords => {
          const updated = [...prevWords];
          const w = { ...updated[activeWordIndex] };
          // Remove extra chars
          const originalChars = w.chars.filter(c => c.status !== "extra");
          w.chars = originalChars.map(c => ({ ...c, status: "pending" }));
          updated[activeWordIndex] = w;
          return updated;
        });
        setActiveCharIndex(0);
        return;
      }

      if (activeCharIndex > 0) {
        setWords(prevWords => {
          const updated = [...prevWords];
          const w = { ...updated[activeWordIndex] };
          const chars = [...w.chars];
          const targetChar = chars[activeCharIndex - 1];

          if (targetChar && targetChar.status === "extra") {
            // Remove extra char
            chars.splice(activeCharIndex - 1, 1);
          } else if (targetChar) {
            chars[activeCharIndex - 1] = { ...targetChar, status: "pending" };
          }

          w.chars = chars;
          updated[activeWordIndex] = w;
          return updated;
        });
        setActiveCharIndex(prev => prev - 1);
      }
      return;
    }

    // Handle Spacebar (advance to next word)
    if (e.key === " ") {
      e.preventDefault();

      // Edge case 2: Consecutive spaces on unstarted or empty word are ignored
      if (activeCharIndex === 0) {
        return;
      }

      // Mark untyped letters in this word as missed
      setWords(prevWords => {
        const updated = [...prevWords];
        const w = { ...updated[activeWordIndex] };
        w.chars = w.chars.map((c, idx) => {
          if (idx >= activeCharIndex && c.status === "pending") {
            return { ...c, status: "missed" };
          }
          return c;
        });
        updated[activeWordIndex] = w;
        return updated;
      });

      // Advance word
      const nextWordIdx = activeWordIndex + 1;
      if (mode === "words" && nextWordIdx >= words.length) {
        completeTest();
        return;
      }

      setActiveWordIndex(nextWordIdx);
      setActiveCharIndex(0);
      return;
    }

    // Character key typing
    if (e.key.length === 1) {
      e.preventDefault();

      setKeystrokes(prev => ({ ...prev, total: prev.total + 1 }));

      const expectedChar = currentWord.chars[activeCharIndex];

      if (expectedChar) {
        const isMatch = e.key === expectedChar.char;
        if (isMatch) {
          setKeystrokes(prev => ({ ...prev, correct: prev.correct + 1 }));
        } else {
          setErrorPoints(pts => [
            ...pts,
            { timeSecond: elapsedSeconds, char: e.key }
          ]);
        }

        setWords(prevWords => {
          const updated = [...prevWords];
          const w = { ...updated[activeWordIndex] };
          const chars = [...w.chars];
          chars[activeCharIndex] = {
            ...chars[activeCharIndex],
            status: isMatch ? "correct" : "incorrect"
          };
          w.chars = chars;
          updated[activeWordIndex] = w;
          return updated;
        });

        setActiveCharIndex(prev => prev + 1);

        // In words mode, check if final character of final word was just typed
        if (
          mode === "words" &&
          activeWordIndex === words.length - 1 &&
          activeCharIndex + 1 === currentWord.chars.length
        ) {
          completeTest();
        }
      } else {
        // User typed beyond word length: add extra character (capped at +10 characters maximum)
        const extraCount = currentWord.chars.filter(c => c.status === "extra").length;
        if (extraCount < 10) {
          setErrorPoints(pts => [
            ...pts,
            { timeSecond: elapsedSeconds, char: e.key }
          ]);

          setWords(prevWords => {
            const updated = [...prevWords];
            const w = { ...updated[activeWordIndex] };
            w.chars = [
              ...w.chars,
              { char: e.key, status: "extra" }
            ];
            updated[activeWordIndex] = w;
            return updated;
          });

          setActiveCharIndex(prev => prev + 1);
        }
      }
    }
  };

  // Live real-time metric estimates during session
  const liveWpm = elapsedSeconds > 0 ? calculateNetWpm(keystrokes.correct, elapsedSeconds) : 0;
  const liveAccuracy = calculateAccuracy(keystrokes.correct, keystrokes.total);

  const modeInfo = mode === "time" ? `${timeDuration}s time` : `${wordCount} words`;

  return (
    <div className="app-container">
      {/* Header */}
      <Header
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={() => {
          signOutUser();
          setUser(null);
        }}
        onOpenHistory={() => setIsHistoryOpen(true)}
        theme={THEMES[themeIdx]}
        onToggleTheme={toggleTheme}
      />

      <main>
        {/* Mode Selector */}
        {!isCompleted && (
          <ModeSelector
            mode={mode}
            setMode={setMode}
            timeDuration={timeDuration}
            setTimeDuration={setTimeDuration}
            wordCount={wordCount}
            setWordCount={setWordCount}
            includePunctuation={includePunctuation}
            setIncludePunctuation={setIncludePunctuation}
            includeNumbers={includeNumbers}
            setIncludeNumbers={setIncludeNumbers}
            disabled={hasStarted}
          />
        )}

        {/* Typing Viewport or Stats Conclusion */}
        {isCompleted && finalStats ? (
          <StatsModal
            stats={finalStats}
            wpmHistory={wpmHistory}
            errorPoints={errorPoints}
            onRestart={initTest}
            onOpenHistory={() => setIsHistoryOpen(true)}
            modeInfo={modeInfo}
          />
        ) : (
          <TypingArea
            words={words}
            activeWordIndex={activeWordIndex}
            activeCharIndex={activeCharIndex}
            mode={mode}
            timeLeft={timeLeft}
            totalWords={words.length}
            isRunning={hasStarted && !isCompleted}
            hasStarted={hasStarted}
            onKeyDown={handleKeyDown}
            onRestart={initTest}
            liveMetrics={{ wpm: liveWpm, accuracy: liveAccuracy }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-links">
          <span>Monkeytype Analogue (React + Firebase)</span>
          <span>•</span>
          <span>Minimalist Portfolio</span>
        </div>
        <div>
          <span>tab + enter to restart</span>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(authenticatedUser) => setUser(authenticatedUser)}
      />

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        user={user}
      />
    </div>
  );
}
