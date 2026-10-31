// Firebase Modular SDK Initialization with Transparent Demo Fallback
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  signInAnonymously as fbSignInAnonymously,
  signInWithEmailAndPassword as fbSignInWithEmail,
  createUserWithEmailAndPassword as fbSignUpWithEmail,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from "firebase/firestore";

// Config can be provided via Vite environment variables or defaults
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key-placeholder",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "monkeytype-clone-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "monkeytype-clone-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "monkeytype-clone-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef"
};

let app = null;
let auth = null;
let db = null;
let isDemoMode = true;

// Determine if configuration is live vs demo placeholder
const isConfigReal =
  firebaseConfig.apiKey &&
  !firebaseConfig.apiKey.includes("placeholder") &&
  !firebaseConfig.apiKey.startsWith("demo-");

if (isConfigReal) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    isDemoMode = false;
    console.info("🔥 Firebase initialized in live cloud mode.");
  } catch (err) {
    console.warn("⚠️ Firebase live init failed, falling back to LocalStorage demo adapter:", err.message);
    isDemoMode = true;
  }
} else {
  isDemoMode = true;
  console.info("💡 Firebase running in offline/demo mode with LocalStorage persistence.");
}

export { app, auth, db, isDemoMode };

// Auth Helper Functions
export async function signInAnonymousUser() {
  if (!isDemoMode && auth) {
    const cred = await fbSignInAnonymously(auth);
    return {
      uid: cred.user.uid,
      isAnonymous: true,
      displayName: "Guest User #" + cred.user.uid.slice(-4),
      email: null
    };
  }

  // Local demo fallback
  let guestId = localStorage.getItem("mt_demo_uid");
  if (!guestId) {
    guestId = "guest_" + Math.random().toString(36).substring(2, 9);
    localStorage.setItem("mt_demo_uid", guestId);
  }
  const user = {
    uid: guestId,
    isAnonymous: true,
    displayName: "Guest (" + guestId.slice(-4) + ")",
    email: null
  };
  localStorage.setItem("mt_active_user", JSON.stringify(user));
  return user;
}

export async function signInWithEmail(email, password) {
  if (!isDemoMode && auth) {
    const cred = await fbSignInWithEmail(auth, email, password);
    return {
      uid: cred.user.uid,
      isAnonymous: false,
      displayName: cred.user.displayName || email.split("@")[0],
      email: cred.user.email
    };
  }

  // Local demo fallback
  const user = {
    uid: "user_" + btoa(email).slice(0, 10),
    isAnonymous: false,
    displayName: email.split("@")[0],
    email: email
  };
  localStorage.setItem("mt_active_user", JSON.stringify(user));
  return user;
}

export async function signUpWithEmail(email, password) {
  if (!isDemoMode && auth) {
    const cred = await fbSignUpWithEmail(auth, email, password);
    return {
      uid: cred.user.uid,
      isAnonymous: false,
      displayName: cred.user.displayName || email.split("@")[0],
      email: cred.user.email
    };
  }

  // Local demo fallback
  const user = {
    uid: "user_" + btoa(email).slice(0, 10),
    isAnonymous: false,
    displayName: email.split("@")[0],
    email: email
  };
  localStorage.setItem("mt_active_user", JSON.stringify(user));
  return user;
}

export async function signOutUser() {
  if (!isDemoMode && auth) {
    await fbSignOut(auth);
  }
  localStorage.removeItem("mt_active_user");
  return true;
}

export function subscribeToAuth(callback) {
  if (!isDemoMode && auth) {
    return fbOnAuthStateChanged(auth, user => {
      if (user) {
        callback({
          uid: user.uid,
          isAnonymous: user.isAnonymous,
          displayName: user.displayName || (user.email ? user.email.split("@")[0] : "Guest User #" + user.uid.slice(-4)),
          email: user.email
        });
      } else {
        callback(null);
      }
    });
  }

  // Local demo mode: check localStorage
  const saved = localStorage.getItem("mt_active_user");
  if (saved) {
    try {
      callback(JSON.parse(saved));
    } catch {
      callback(null);
    }
  } else {
    callback(null);
  }

  return () => {};
}
