import React from "react";
import { Keyboard, History, User, Palette, LogOut, Cloud, CloudOff } from "lucide-react";
import { isDemoMode } from "../services/firebase";

export default function Header({
  user,
  onOpenAuth,
  onSignOut,
  onOpenHistory,
  theme,
  onToggleTheme
}) {
  return (
    <header className="header">
      <div className="logo-group">
        <Keyboard className="logo-icon" size={32} />
        <h1 className="logo-text">
          monkey<span>type</span>
        </h1>
      </div>

      <div className="header-actions">
        {/* Sync Mode indicator */}
        <div
          className="user-pill"
          title={isDemoMode ? "Running in local storage fallback mode" : "Connected to Cloud Firestore"}
        >
          {isDemoMode ? <CloudOff size={16} /> : <Cloud size={16} color="#e2b714" />}
          <span style={{ fontSize: "0.8rem", color: "var(--sub-color)" }}>
            {isDemoMode ? "Local Demo" : "Firebase Cloud"}
          </span>
        </div>

        {/* Theme toggle */}
        <button
          className="btn-icon"
          onClick={onToggleTheme}
          title={`Theme: ${theme}`}
          aria-label="Toggle Theme"
        >
          <Palette size={20} />
        </button>

        {/* History leaderboard */}
        <button
          className="btn-icon"
          onClick={onOpenHistory}
          title="Typing History & Leaderboard"
          aria-label="Test History"
        >
          <History size={20} />
        </button>

        {/* User Pill / Login */}
        {user ? (
          <div className="user-pill" onClick={onOpenAuth}>
            <div className={`status-dot ${isDemoMode ? "offline" : ""}`} />
            <span>{user.displayName || "User"}</span>
            <button
              className="btn-icon"
              style={{ padding: 2, marginLeft: 4 }}
              onClick={(e) => {
                e.stopPropagation();
                onSignOut();
              }}
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button className="user-pill" onClick={onOpenAuth}>
            <User size={16} />
            <span>Sign In / Guest</span>
          </button>
        )}
      </div>
    </header>
  );
}
