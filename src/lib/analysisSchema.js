/**
 * Standard analysis entry schema, validation, and migration.
 * All history entries are normalized to this shape.
 */

export const DEFAULT_OTHER_SKILLS = [
  'Communication',
  'Problem solving',
  'Basic coding',
  'Projects',
];

const CATEGORY_TO_KEY = {
  'Core CS': 'coreCS',
  'Languages': 'languages',
  'Web': 'web',
  'Data': 'data',
  'Cloud/DevOps': 'cloud',
  'Testing': 'testing',
};

const KEY_TO_CATEGORY = {
  coreCS: 'Core CS',
  languages: 'Languages',
  web: 'Web',
  data: 'Data',
  cloud: 'Cloud/DevOps',
  testing: 'Testing',
  other: 'Other',
};

const EMPTY_SKILLS = {
  coreCS: [],
  languages: [],
  web: [],
  data: [],
  cloud: [],
  testing: [],
  other: [],
};

/**
 * @typedef {Object} SchemaExtractedSkills
 * @property {string[]} coreCS
 * @property {string[]} languages
 * @property {string[]} web
 * @property {string[]} data
 * @property {string[]} cloud
 * @property {string[]} testing
 * @property {string[]} other
 */

/**
 * Convert byCategory (legacy or from extractSkills) to schema extractedSkills.
 * If no skills detected, set other = DEFAULT_OTHER_SKILLS.
 */
export function toSchemaExtractedSkills(byCategory = {}) {
  const schema = { ...EMPTY_SKILLS };
  let hasAny = false;
  for (const [cat, key] of Object.entries(CATEGORY_TO_KEY)) {
    const arr = Array.isArray(byCategory[cat]) ? byCategory[cat] : [];
    if (arr.length) hasAny = true;
    schema[key] = arr;
  }
  if (!hasAny) schema.other = [...DEFAULT_OTHER_SKILLS];
  return schema;
}

/**
 * Convert schema extractedSkills back to byCategory for UI (Key skills extracted).
 */
export function toByCategory(extractedSkills = {}) {
  const byCategory = {};
  for (const [key, category] of Object.entries(KEY_TO_CATEGORY)) {
    const arr = Array.isArray(extractedSkills[key]) ? extractedSkills[key] : [];
    if (arr.length) byCategory[category] = arr;
  }
  return byCategory;
}

/**
 * Get flat list of all skill strings from schema extractedSkills.
 */
export function getAllSkillsFromSchema(extractedSkills = {}) {
  const keys = ['coreCS', 'languages', 'web', 'data', 'cloud', 'testing', 'other'];
  const list = [];
  keys.forEach((k) => {
    const arr = extractedSkills[k];
    if (Array.isArray(arr)) list.push(...arr);
  });
  return list;
}

/**
 * Convert roundMapping (legacy: { round, title, why }) to schema ({ roundTitle, focusAreas, whyItMatters }).
 */
export function toSchemaRoundMapping(roundMapping = []) {
  if (!Array.isArray(roundMapping)) return [];
  return roundMapping.map((r) => ({
    roundTitle: r.roundTitle ?? r.title ?? `Round ${r.round ?? 0}`,
    focusAreas: Array.isArray(r.focusAreas) ? r.focusAreas : [],
    whyItMatters: r.whyItMatters ?? r.why ?? '',
  }));
}

/**
 * Convert checklist (legacy: { round, items }) to schema ({ roundTitle, items }).
 */
export function toSchemaChecklist(checklist = []) {
  if (!Array.isArray(checklist)) return [];
  return checklist.map((c) => ({
    roundTitle: c.roundTitle ?? c.round ?? '',
    items: Array.isArray(c.items) ? c.items : [],
  }));
}

/**
 * Convert plan (legacy: { day, title, items }) to schema ({ day, focus, tasks }).
 */
export function toSchemaPlan7Days(plan = []) {
  if (!Array.isArray(plan)) return [];
  return plan.map((p) => ({
    day: p.day,
    focus: p.focus ?? p.title ?? '',
    tasks: Array.isArray(p.tasks) ? p.tasks : (Array.isArray(p.items) ? p.items : []),
  }));
}

/**
 * Build standard entry from analysis result. Use when saving new analysis.
 */
export function buildStandardEntry({
  id,
  createdAt,
  company,
  role,
  jdText,
  result,
  companyIntel,
  roundMappingRaw,
}) {
  const byCategory = result.extractedSkills?.byCategory ?? {};
  const extractedSkills = toSchemaExtractedSkills(byCategory);
  const baseScore = result.readinessScore ?? 0;
  const now = createdAt || new Date().toISOString();

  const roundMapping = Array.isArray(roundMappingRaw)
    ? roundMappingRaw.map((r) => ({
        roundTitle: r.title ?? r.roundTitle ?? `Round ${r.round ?? 0}`,
        focusAreas: r.focusAreas ?? [],
        whyItMatters: r.why ?? r.whyItMatters ?? '',
      }))
    : [];

  const checklist = toSchemaChecklist(result.checklist);
  const plan7Days = toSchemaPlan7Days(result.plan);
  const questions = Array.isArray(result.questions) ? result.questions : [];

  return {
    id,
    createdAt: now,
    company: company != null ? String(company).trim() : '',
    role: role != null ? String(role).trim() : '',
    jdText: String(jdText ?? '').trim(),
    extractedSkills,
    roundMapping,
    checklist,
    plan7Days,
    questions,
    baseScore,
    skillConfidenceMap: {},
    finalScore: baseScore,
    updatedAt: now,
    companyIntel: companyIntel ?? undefined,
  };
}

/**
 * Validate that entry has required fields and types.
 */
export function validateEntry(entry) {
  if (!entry || typeof entry !== 'object') return false;
  if (!entry.id || typeof entry.id !== 'string') return false;
  if (typeof entry.jdText !== 'string') return false;
  if (!entry.extractedSkills || typeof entry.extractedSkills !== 'object') return false;
  const es = entry.extractedSkills;
  const keys = ['coreCS', 'languages', 'web', 'data', 'cloud', 'testing', 'other'];
  for (const k of keys) {
    if (!Array.isArray(es[k])) return false;
  }
  if (!Array.isArray(entry.roundMapping)) return false;
  if (!Array.isArray(entry.checklist)) return false;
  if (!Array.isArray(entry.plan7Days)) return false;
  if (!Array.isArray(entry.questions)) return false;
  if (typeof entry.baseScore !== 'number') return false;
  if (typeof entry.finalScore !== 'number') return false;
  if (entry.skillConfidenceMap != null && typeof entry.skillConfidenceMap !== 'object') return false;
  return true;
}

/**
 * Migrate legacy entry to standard schema. Returns null if corrupted.
 */
export function migrateEntry(entry) {
  if (!entry || typeof entry !== 'object') return null;
  try {
    if (validateEntry(entry)) return entry;

    const byCategory = entry.extractedSkills?.byCategory ?? entry.extractedSkills ?? {};
    const extractedSkills = toSchemaExtractedSkills(byCategory);
    const baseScore = entry.baseScore ?? entry.readinessScore ?? 0;
    const finalScore = entry.finalScore ?? entry.readinessScore ?? baseScore;
    const now = entry.updatedAt ?? entry.createdAt ?? new Date().toISOString();

    return {
      id: entry.id,
      createdAt: entry.createdAt ?? now,
      company: entry.company != null ? String(entry.company).trim() : '',
      role: entry.role != null ? String(entry.role).trim() : '',
      jdText: String(entry.jdText ?? '').trim(),
      extractedSkills,
      roundMapping: toSchemaRoundMapping(entry.roundMapping),
      checklist: toSchemaChecklist(entry.checklist),
      plan7Days: toSchemaPlan7Days(entry.plan ?? entry.plan7Days),
      questions: Array.isArray(entry.questions) ? entry.questions : [],
      baseScore,
      skillConfidenceMap: entry.skillConfidenceMap && typeof entry.skillConfidenceMap === 'object' ? entry.skillConfidenceMap : {},
      finalScore,
      updatedAt: now,
      companyIntel: entry.companyIntel,
    };
  } catch {
    return null;
  }
}
