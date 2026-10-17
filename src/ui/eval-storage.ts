/**
 * AEGIS TRANSIT — Evaluation Results Storage (IndexedDB)
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Caches benchmark evaluation results in IndexedDB with timestamp, RNG seed,
 * and git commit hash. Falls back to in-memory storage if IndexedDB is unavailable.
 */

export interface EvalMetricResult {
  suiteName: string;
  testName: string;
  passed: boolean;
  metricName: string;
  measuredValue: string;
  targetThreshold: string;
  durationMs: number;
}

export interface CachedEvalRecord {
  id?: number;
  timestamp: string;      // ISO string
  timestampMs: number;
  rngSeed: number;
  gitCommitHash: string;
  results: EvalMetricResult[];
  summary: {
    totalTests: number;
    totalPassed: number;
    allPassed: boolean;
    durationMs: number;
  };
}

const DB_NAME = 'aegis_eval_db';
const DB_VERSION = 1;
const STORE_NAME = 'eval_cache';

let memoryCache: CachedEvalRecord | null = null;

function openDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
      };
      request.onsuccess = (e) => {
        resolve((e.target as IDBOpenDBRequest).result);
      };
      request.onerror = () => {
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

/** Save evaluation results into IndexedDB and memory cache */
export async function saveEvalResults(record: CachedEvalRecord): Promise<void> {
  memoryCache = record;
  const db = await openDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const putReq = store.put(record);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => resolve();
      tx.oncomplete = () => db.close();
    } catch {
      resolve();
    }
  });
}

/** Retrieve the most recent evaluation results */
export async function getLatestEvalResults(): Promise<CachedEvalRecord | null> {
  const db = await openDB();
  if (!db) {
    return memoryCache;
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.openCursor(null, 'prev'); // cursor in descending key order
      req.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor && cursor.value) {
          resolve(cursor.value);
        } else {
          resolve(memoryCache);
        }
      };
      req.onerror = () => {
        resolve(memoryCache);
      };
      tx.oncomplete = () => db.close();
    } catch {
      resolve(memoryCache);
    }
  });
}
