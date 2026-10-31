// Resilient Storage Adapter Pattern for Monkeytype Results
import { db, isDemoMode } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from "firebase/firestore";

const COLLECTION_NAME = "monkeytype_results";
const LOCAL_STORAGE_KEY = "monkeytype_results_data";

/**
 * Saves a completed typing test result to Cloud Firestore or LocalStorage
 * @param {Object} result
 * @returns {Promise<string>} docId
 */
export async function saveMonkeytypeResult(result) {
  const resultDoc = {
    userId: result.userId || "anonymous",
    userDisplayName: result.userDisplayName || "Guest User",
    isAnonymous: Boolean(result.isAnonymous),
    netWpm: Number(result.netWpm) || 0,
    grossWpm: Number(result.grossWpm) || 0,
    accuracy: Number(result.accuracy) || 0,
    mode: result.mode || "time",
    durationSeconds: Number(result.durationSeconds) || 0,
    wordCount: Number(result.wordCount) || 0,
    errorCount: Number(result.errorCount) || 0,
    consistency: Number(result.consistency) || 0,
    createdAt: result.createdAt || Date.now()
  };

  if (!isDemoMode && db) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), resultDoc);
      return docRef.id;
    } catch (err) {
      console.warn("⚠️ Firestore write failed, saving to local fallback:", err.message);
    }
  }

  // Local fallback
  const existing = getLocalResults();
  const id = "res_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
  const docWithId = { id, ...resultDoc };
  existing.unshift(docWithId);
  // Keep last 100 results locally
  const trimmed = existing.slice(0, 100);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trimmed));
  return id;
}

/**
 * Retrieves results from Firestore or LocalStorage
 * @param {string} [userId] - Optional filter by user ID
 * @param {number} [limitCount=20] - Max records
 * @returns {Promise<Array<Object>>}
 */
export async function getMonkeytypeResults(userId, limitCount = 20) {
  if (!isDemoMode && db) {
    try {
      const colRef = collection(db, COLLECTION_NAME);
      let q;
      if (userId) {
        q = query(colRef, where("userId", "==", userId), orderBy("createdAt", "desc"), limit(limitCount));
      } else {
        q = query(colRef, orderBy("createdAt", "desc"), limit(limitCount));
      }
      const snapshot = await getDocs(q);
      const results = [];
      snapshot.forEach(doc => {
        results.push({ id: doc.id, ...doc.data() });
      });
      return results;
    } catch (err) {
      console.warn("⚠️ Firestore read failed, reading from local storage:", err.message);
    }
  }

  // Local fallback
  const all = getLocalResults();
  let filtered = all;
  if (userId) {
    filtered = all.filter(r => r.userId === userId);
  }
  return filtered.slice(0, limitCount);
}

/**
 * Helper to read raw results from localStorage
 */
function getLocalResults() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
