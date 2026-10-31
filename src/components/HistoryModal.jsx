import React, { useEffect, useState } from "react";
import { X, Trophy, Clock, CheckCircle } from "lucide-react";
import { getMonkeytypeResults } from "../services/storageAdapter";

export default function HistoryModal({ isOpen, onClose, user }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterUserOnly, setFilterUserOnly] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);

    const uid = filterUserOnly && user ? user.uid : undefined;
    getMonkeytypeResults(uid, 50)
      .then(data => {
        if (isMounted) {
          setResults(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, filterUserOnly, user]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Trophy size={20} color="#e2b714" />
            <span>Test History & Leaderboard</span>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close Modal">
            <X size={20} />
          </button>
        </div>

        {user && (
          <div className="modal-tabs">
            <button
              className={`modal-tab ${!filterUserOnly ? "active" : ""}`}
              onClick={() => setFilterUserOnly(false)}
            >
              All Recent Tests
            </button>
            <button
              className={`modal-tab ${filterUserOnly ? "active" : ""}`}
              onClick={() => setFilterUserOnly(true)}
            >
              My Tests ({user.displayName})
            </button>
          </div>
        )}

        <div className="history-table-container">
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--sub-color)" }}>
              Loading test records...
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--sub-color)" }}>
              No test history recorded yet. Complete a typing test to see your scores here!
            </div>
          ) : (
            <table className="history-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>WPM</th>
                  <th>Accuracy</th>
                  <th>Mode</th>
                  <th>Errors</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, idx) => (
                  <tr key={r.id || idx}>
                    <td style={{ color: "var(--text-color)" }}>
                      {r.userDisplayName || "Guest"}
                    </td>
                    <td className="history-wpm">{r.netWpm}</td>
                    <td>{r.accuracy}%</td>
                    <td style={{ textTransform: "capitalize", color: "var(--sub-color)" }}>
                      {r.mode} {r.durationSeconds ? `${r.durationSeconds}s` : `${r.wordCount}w`}
                    </td>
                    <td style={{ color: r.errorCount > 0 ? "var(--error-color)" : "var(--sub-color)" }}>
                      {r.errorCount}
                    </td>
                    <td style={{ color: "var(--sub-color)", fontSize: "0.8rem" }}>
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recent"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
