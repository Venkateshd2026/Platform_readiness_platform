const STORAGE_KEY = 'placement-prep-test-checklist';
const COUNT = 10;

/**
 * @returns {boolean[]} Array of 10 booleans (checked state per test).
 */
export function getChecklistState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return Array(COUNT).fill(false);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== COUNT) return Array(COUNT).fill(false);
    return parsed.map((v) => Boolean(v));
  } catch {
    return Array(COUNT).fill(false);
  }
}

/**
 * @param {boolean[]} state - Array of 10 booleans.
 */
export function setChecklistState(state) {
  const list = Array(COUNT)
    .fill(false)
    .map((_, i) => Boolean(state[i]));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/**
 * @returns {boolean} True if all 10 tests are checked.
 */
export function isChecklistComplete() {
  const state = getChecklistState();
  return state.length === COUNT && state.every(Boolean);
}

/**
 * Set a single test by index (0–9). Persists.
 */
export function setChecklistItem(index, checked) {
  const state = getChecklistState();
  if (index < 0 || index >= COUNT) return;
  state[index] = Boolean(checked);
  setChecklistState(state);
}

/**
 * Reset all items to unchecked.
 */
export function resetChecklist() {
  setChecklistState(Array(COUNT).fill(false));
}
