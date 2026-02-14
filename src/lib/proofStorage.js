const STORAGE_KEY = 'prp_final_submission';
const STEP_COUNT = 8;

const DEFAULT_SUBMISSION = () => ({
  lovableUrl: '',
  githubUrl: '',
  deployedUrl: '',
  stepsCompleted: Array(STEP_COUNT).fill(false),
});

/**
 * Valid URL: non-empty, starts with http:// or https://
 */
export function isValidUrl(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
}

/**
 * @returns {{ lovableUrl: string, githubUrl: string, deployedUrl: string, stepsCompleted: boolean[] }}
 */
export function getSubmission() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SUBMISSION();
    const parsed = JSON.parse(raw);
    const steps = Array.isArray(parsed.stepsCompleted)
      ? parsed.stepsCompleted.slice(0, STEP_COUNT).map(Boolean)
      : Array(STEP_COUNT).fill(false);
    while (steps.length < STEP_COUNT) steps.push(false);
    return {
      lovableUrl: typeof parsed.lovableUrl === 'string' ? parsed.lovableUrl : '',
      githubUrl: typeof parsed.githubUrl === 'string' ? parsed.githubUrl : '',
      deployedUrl: typeof parsed.deployedUrl === 'string' ? parsed.deployedUrl : '',
      stepsCompleted: steps,
    };
  } catch {
    return DEFAULT_SUBMISSION();
  }
}

/**
 * @param {Partial<{ lovableUrl: string, githubUrl: string, deployedUrl: string, stepsCompleted: boolean[] }>} updates
 */
export function setSubmission(updates) {
  const current = getSubmission();
  const next = { ...current };
  if (updates.lovableUrl !== undefined) next.lovableUrl = String(updates.lovableUrl ?? '').trim();
  if (updates.githubUrl !== undefined) next.githubUrl = String(updates.githubUrl ?? '').trim();
  if (updates.deployedUrl !== undefined) next.deployedUrl = String(updates.deployedUrl ?? '').trim();
  if (Array.isArray(updates.stepsCompleted)) {
    next.stepsCompleted = updates.stepsCompleted.slice(0, STEP_COUNT).map(Boolean);
    while (next.stepsCompleted.length < STEP_COUNT) next.stepsCompleted.push(false);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function setStepCompleted(index, completed) {
  const current = getSubmission();
  const steps = [...current.stepsCompleted];
  if (index >= 0 && index < STEP_COUNT) steps[index] = Boolean(completed);
  setSubmission({ stepsCompleted: steps });
}

/**
 * All 8 steps checked, all 3 links valid. Does NOT check test checklist (caller combines).
 */
export function isProofComplete() {
  const s = getSubmission();
  const allSteps = s.stepsCompleted.length >= STEP_COUNT && s.stepsCompleted.every(Boolean);
  const allLinks = isValidUrl(s.lovableUrl) && isValidUrl(s.githubUrl) && isValidUrl(s.deployedUrl);
  return allSteps && allLinks;
}

/**
 * Formatted text for "Copy Final Submission".
 */
export function getFinalSubmissionText() {
  const s = getSubmission();
  const lovable = s.lovableUrl.trim() || '(not set)';
  const github = s.githubUrl.trim() || '(not set)';
  const deployed = s.deployedUrl.trim() || '(not set)';
  return `------------------------------------------
Placement Readiness Platform — Final Submission

Lovable Project: ${lovable}
GitHub Repository: ${github}
Live Deployment: ${deployed}

Core Capabilities:
- JD skill extraction (deterministic)
- Round mapping engine
- 7-day prep plan
- Interactive readiness scoring
- History persistence
------------------------------------------`;
}

export { STEP_COUNT };
