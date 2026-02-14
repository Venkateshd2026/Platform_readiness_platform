import { SKILL_CATEGORIES, DEFAULT_STACK_LABEL } from './skillKeywords';

/**
 * Extract skill keywords from JD text (case-insensitive).
 * Returns { byCategory: { 'Core CS': ['DSA', 'OOP'], ... }, all: [...], hasAny: boolean }.
 */
export function extractSkills(jdText) {
  if (!jdText || typeof jdText !== 'string') {
    return { byCategory: {}, all: [], hasAny: false };
  }
  const lower = jdText.trim().toLowerCase();
  const byCategory = {};
  const all = [];

  for (const [category, keywords] of Object.entries(SKILL_CATEGORIES)) {
    const found = keywords.filter((kw) => {
      const pattern = kw.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`\\b${pattern}\\b`, 'i').test(lower);
    });
    if (found.length) {
      byCategory[category] = found;
      all.push(...found);
    }
  }

  return {
    byCategory,
    all: [...new Set(all)],
    hasAny: all.length > 0,
  };
}

/**
 * Round-wise preparation checklist (5–8 items per round) based on detected skills.
 */
export function buildChecklist(extractedSkills) {
  const { byCategory, hasAny } = extractedSkills;
  const has = (cat) => Array.isArray(byCategory[cat]) && byCategory[cat].length > 0;
  const hasDSA = has('Core CS') && (byCategory['Core CS'] || []).some((s) => /DSA/i.test(s));
  const hasWeb = has('Web');
  const hasData = has('Data');
  const hasLang = has('Languages');
  const hasCloud = has('Cloud/DevOps');
  const hasTesting = has('Testing');

  const round1 = [
    'Revise quantitative aptitude (percentages, ratios, time-speed-distance).',
    'Practice logical reasoning and pattern recognition.',
    'Review basic grammar and verbal ability.',
    'Time yourself on 20–30 aptitude questions.',
    'Go through company-specific aptitude patterns if available.',
  ];
  if (hasLang) round1.push('Brush up language basics (syntax, common constructs).');
  if (hasData) round1.push('Revise SQL basics (SELECT, JOINs, aggregation).');
  if (round1.length < 8) round1.push('Prepare short self-introduction and key strengths.');

  const round2 = [
    'Revise arrays, strings, and two-pointer techniques.',
    'Practice 5–10 medium DSA problems (arrays, hash maps).',
    'Review time/space complexity for common patterns.',
    'Practice one problem on trees/graphs if required.',
  ];
  if (hasDSA) {
    round2.push('Revise sorting, searching, and binary search.');
    round2.push('Practice recursion and dynamic programming basics.');
  }
  if (has('Core CS')) {
    round2.push('Revise OOP concepts (if in JD): encapsulation, inheritance, polymorphism.');
    round2.push('Review OS/Networks/DBMS fundamentals from JD.');
  }
  while (round2.length < 8) {
    round2.push('Practice writing clean code and edge-case handling.');
    if (round2.length >= 8) break;
  }

  const round3 = [
    'Prepare 2–3 project deep-dives (tech stack, your role, challenges).',
    'Align resume bullet points with JD keywords.',
  ];
  if (hasWeb) {
    round3.push('Revise React/Node/Express (or stack from JD) concepts.');
    round3.push('Prepare to explain REST/APIs and state management.');
  }
  if (hasData) round3.push('Prepare to explain DB design, indexing, and queries.');
  if (hasCloud) round3.push('Prepare to discuss deployment, Docker/CI-CD if in JD.');
  if (hasTesting) round3.push('Prepare to explain testing approach and tools from JD.');
  round3.push('Review system design basics (scalability, caching) if relevant.');
  while (round3.length < 8) {
    round3.push('Prepare STAR examples for behavioral questions.');
    if (round3.length >= 8) break;
  }

  const round4 = [
    'Prepare "Tell me about yourself" (2 min).',
    'Prepare "Why this company/role?" with research.',
    'List 3–5 questions to ask the interviewer.',
    'Prepare examples for teamwork, conflict, and deadlines.',
    'Review salary and role expectations (if applicable).',
    'Practice confidence and clarity in communication.',
  ];
  if (round4.length < 8) round4.push('Prepare for "strengths and weaknesses" with honest examples.');

  return [
    { round: 'Round 1: Aptitude / Basics', items: round1.slice(0, 8) },
    { round: 'Round 2: DSA + Core CS', items: round2.slice(0, 8) },
    { round: 'Round 3: Tech interview (projects + stack)', items: round3.slice(0, 8) },
    { round: 'Round 4: Managerial / HR', items: round4.slice(0, 8) },
  ];
}

/**
 * 7-day plan adapted to detected skills.
 */
export function build7DayPlan(extractedSkills) {
  const { byCategory, hasAny } = extractedSkills;
  const has = (cat) => Array.isArray(byCategory[cat]) && byCategory[cat].length > 0;
  const hasWeb = has('Web');
  const hasData = has('Data');
  const hasCloud = has('Cloud/DevOps');

  const day1_2 = [
    'Revise core CS fundamentals from JD (OS, DBMS, OOP, Networks as applicable).',
    'Brush up basics of languages mentioned in JD.',
  ];
  if (hasData) day1_2.push('Revise SQL and DB concepts.');
  day1_2.push('Note down weak topics for Day 7 revision.');

  const day3_4 = [
    'Solve 5–8 DSA problems (arrays, strings, hash map).',
    'Practice 2–3 problems on trees/graphs if DSA is in JD.',
    'Revise complexity analysis and common patterns.',
  ];

  const day5 = [
    'Map your projects to JD requirements.',
    'Update resume bullets to match JD keywords.',
  ];
  if (hasWeb) day5.push('Revise frontend/backend stack from JD (e.g. React, Node).');
  day5.push('Prepare 2–3 project stories with STAR.');

  const day6 = [
    'Practice mock answers for "Introduce yourself" and "Why this role?".',
    'Prepare 5–8 technical questions from JD stack.',
  ];
  if (hasData) day6.push('Practice explaining DB design and indexing.');
  if (hasCloud) day6.push('Practice explaining deployment or CI/CD.');

  const day7 = [
    'Revision: weak areas and high-weight topics from JD.',
    'Light practice: 2–3 easy problems to stay in flow.',
    'Rest and avoid cramming new topics.',
  ];

  return [
    { day: 1, title: 'Day 1–2: Basics + core CS', items: day1_2 },
    { day: 3, title: 'Day 3–4: DSA + coding practice', items: day3_4 },
    { day: 5, title: 'Day 5: Project + resume alignment', items: day5 },
    { day: 6, title: 'Day 6: Mock interview questions', items: day6 },
    { day: 7, title: 'Day 7: Revision + weak areas', items: day7 },
  ];
}

/**
 * Generate up to 10 likely interview questions based on detected skills.
 */
export function generateQuestions(extractedSkills) {
  const { byCategory } = extractedSkills;
  const has = (cat) => Array.isArray(byCategory[cat]) && byCategory[cat].length > 0;
  const questions = [];

  if (has('Core CS')) {
    if ((byCategory['Core CS'] || []).some((s) => /DSA/i.test(s))) {
      questions.push('How would you optimize search in sorted data? When would you use binary search?');
      questions.push('Explain time complexity of common sorting algorithms and when to use which.');
    }
    if ((byCategory['Core CS'] || []).some((s) => /OOP/i.test(s))) {
      questions.push('Explain encapsulation, inheritance, and polymorphism with examples.');
    }
    if ((byCategory['Core CS'] || []).some((s) => /DBMS|OS|Networks/i.test(s))) {
      questions.push('Explain ACID properties and when they matter in system design.');
    }
  }
  if (has('Data')) {
    questions.push('Explain indexing in databases and when it helps (and when it does not).');
    questions.push('How would you design a schema for [X]? (Prepare with a sample domain from your project).');
  }
  if (has('Web')) {
    const web = byCategory['Web'] || [];
    if (web.some((s) => /React/i.test(s))) {
      questions.push('Explain state management options in React (local state, context, external store).');
      questions.push('What is the virtual DOM and how does React use it for updates?');
    }
    if (web.some((s) => /REST|GraphQL/i.test(s))) {
      questions.push('Compare REST and GraphQL. When would you choose one over the other?');
                }
    if (web.some((s) => /Node|Express/i.test(s))) {
      questions.push('How would you handle async operations and errors in Node/Express?');
    }
  }
  if (has('Cloud/DevOps')) {
    questions.push('Explain how you would containerize an app and run it in production.');
    questions.push('What is CI/CD and how have you used it (or would use it)?');
  }
  if (has('Testing')) {
    questions.push('How do you decide what to unit test vs integration test? Give an example.');
  }
  if (has('Languages')) {
    questions.push('Describe a challenging bug you fixed and how you approached debugging.');
  }

  // Fill to 10 with sensible defaults if needed
  const fallbacks = [
    'Tell me about a project where you had to learn something new quickly.',
    'How do you handle disagreements in a team?',
    'Where do you see yourself in 2–3 years?',
    'What is your greatest strength and how does it apply to this role?',
    'Explain a technical concept to a non-technical person.',
  ];
  while (questions.length < 10) {
    const i = questions.length % fallbacks.length;
    if (!questions.includes(fallbacks[i])) questions.push(fallbacks[i]);
    else questions.push(fallbacks[(i + 1) % fallbacks.length]);
  }
  return questions.slice(0, 10);
}

/**
 * Readiness score 0–100.
 * Base 35, +5 per category (max 30), +10 company, +10 role, +10 if JD length > 800. Cap 100.
 */
export function computeReadinessScore(extractedSkills, { company, role, jdText }) {
  let score = 35;
  const categoryCount = Object.keys(extractedSkills.byCategory || {}).length;
  score += Math.min(categoryCount * 5, 30);
  if (company && String(company).trim().length > 0) score += 10;
  if (role && String(role).trim().length > 0) score += 10;
  if (jdText && String(jdText).trim().length > 800) score += 10;
  return Math.min(100, Math.max(0, score));
}

/**
 * Full analysis: extract skills, build checklist, plan, questions, score.
 */
export function runAnalysis({ company, role, jdText }) {
  const extractedSkills = extractSkills(jdText);
  const plan = build7DayPlan(extractedSkills);
  const checklist = buildChecklist(extractedSkills);
  const questions = generateQuestions(extractedSkills);
  const readinessScore = computeReadinessScore(extractedSkills, { company, role, jdText });
  return {
    extractedSkills,
    plan,
    checklist,
    questions,
    readinessScore,
  };
}
