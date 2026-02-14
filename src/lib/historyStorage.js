import { migrateEntry } from './analysisSchema';

const STORAGE_KEY = 'placement-prep-history';

/**
 * Standard entry shape: see analysisSchema.js buildStandardEntry / validateEntry.
 * @typedef {import('./analysisSchema').buildStandardEntry} HistoryEntry
 */

/**
 * Raw list from localStorage (may contain legacy or corrupted entries).
 * @returns {unknown[]}
 */
function getRawHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Returns validated and migrated entries plus count of skipped (corrupted) entries.
 * @returns {{ entries: import('./analysisSchema').migrateEntry[], skippedCount: number }}
 */
export function getValidHistory() {
  const raw = getRawHistory();
  const entries = [];
  let skippedCount = 0;
  for (const item of raw) {
    const migrated = migrateEntry(item);
    if (migrated) entries.push(migrated);
    else skippedCount += 1;
  }
  return { entries, skippedCount };
}

/**
 * @param {import('./analysisSchema').buildStandardEntry} entry
 */
export function saveToHistory(entry) {
  const list = getRawHistory();
  list.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/**
 * @param {string} id
 * @returns {ReturnType<typeof migrateEntry>}
 */
export function getEntryById(id) {
  const list = getRawHistory();
  const raw = list.find((e) => e && e.id === id);
  return raw ? migrateEntry(raw) : null;
}

/**
 * Latest entry (most recent by createdAt), migrated.
 */
export function getLatestEntry() {
  const list = getRawHistory();
  const raw = list[0];
  return raw ? migrateEntry(raw) : null;
}

/**
 * Update an existing history entry by id. Merges updates and persists.
 * @param {string} id
 * @param {Partial<import('./analysisSchema').buildStandardEntry>} updates
 */
export function updateEntry(id, updates) {
  const list = getRawHistory();
  const index = list.findIndex((e) => e && e.id === id);
  if (index === -1) return;
  list[index] = { ...list[index], ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/**
 * Generate a simple unique id.
 */
export function createId() {
  return `pp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
