import React, { useState } from "react";
import { X, User, LogIn, UserPlus } from "lucide-react";
import { signInAnonymousUser, signInWithEmail, signUpWithEmail, isDemoMode } from "../services/firebase";

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [tab, setTab] = useState("signin"); // 'signin' | 'signup' | 'guest'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGuest = async () => {
    setLoading(true);
    setError("");
    try {
      const user = await signInAnonymousUser();
      onAuthSuccess(user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      let user;
      if (tab === "signin") {
        user = await signInWithEmail(email, password);
      } else {
        user = await signUpWithEmail(email, password);
      }
      onAuthSuccess(user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Account & Cloud Sync</div>
          <button className="btn-icon" onClick={onClose} aria-label="Close Modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-tabs">
          <button
            className={`modal-tab ${tab === "signin" ? "active" : ""}`}
            onClick={() => { setTab("signin"); setError(""); }}
          >
            Sign In
          </button>
          <button
            className={`modal-tab ${tab === "signup" ? "active" : ""}`}
            onClick={() => { setTab("signup"); setError(""); }}
          >
            Sign Up
          </button>
          <button
            className={`modal-tab ${tab === "guest" ? "active" : ""}`}
            onClick={() => { setTab("guest"); setError(""); }}
          >
            Guest Mode
          </button>
        </div>

        {error && <div className="form-error">{error}</div>}

        {tab === "guest" ? (
          <div>
            <p style={{ color: "var(--sub-color)", fontSize: "0.9rem", marginBottom: 20 }}>
              Continue as a guest to instantly save your typing test results locally or sync to Firebase anonymous session without creating an account.
            </p>
            <button
              className="action-btn primary btn-full"
              onClick={handleGuest}
              disabled={loading}
            >
              <User size={18} />
              <span>{loading ? "Logging in..." : "Continue as Guest"}</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="typist@monkeytype.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="action-btn primary btn-full"
              disabled={loading}
              style={{ marginTop: 12 }}
            >
              {tab === "signin" ? <LogIn size={18} /> : <UserPlus size={18} />}
              <span>{loading ? "Processing..." : (tab === "signin" ? "Sign In" : "Create Account")}</span>
            </button>
          </form>
        )}

        <div style={{ marginTop: 20, fontSize: "0.75rem", color: "var(--sub-color)", textAlign: "center" }}>
          Mode: {isDemoMode ? "Resilient LocalStorage demo mode active" : "Connected to Cloud Firestore"}
        </div>
      </div>
    </div>
  );
}
