/**
 * Company Intel & Round Mapping — heuristic only, no external data.
 * Demo mode: all inferences are template-based.
 */

const KNOWN_ENTERPRISE = [
  'amazon', 'microsoft', 'google', 'meta', 'apple', 'infosys', 'tcs', 'tata consultancy',
  'wipro', 'hcl', 'accenture', 'capgemini', 'ibm', 'oracle', 'sap', 'cognizant',
  'tech mahindra', 'ltimindtree', 'lti', 'mindtree', 'tcs', 'dell', 'hp', 'intel',
  'cisco', 'salesforce', 'adobe', 'vmware', 'netflix', 'uber', 'paypal', 'goldman sachs',
  'jpmorgan', 'morgan stanley', 'barclays', 'deloitte', 'ey', 'kpmg', 'pwc',
];

const INDUSTRY_KEYWORDS = [
  { keywords: ['bank', 'finance', 'investment', 'trading'], industry: 'Banking & Financial Services' },
  { keywords: ['health', 'medical', 'pharma', 'hospital'], industry: 'Healthcare' },
  { keywords: ['retail', 'ecommerce', 'e-commerce', 'marketplace'], industry: 'Retail & E-commerce' },
  { keywords: ['insurance'], industry: 'Insurance' },
  { keywords: ['education', 'edtech', 'learning'], industry: 'Education & EdTech' },
  { keywords: ['travel', 'hospitality'], industry: 'Travel & Hospitality' },
  { keywords: ['automobile', 'auto', 'vehicle'], industry: 'Automotive' },
  { keywords: ['telecom', 'telecommunication'], industry: 'Telecommunications' },
];

const DEFAULT_INDUSTRY = 'Technology Services';

/**
 * @param {string} companyName
 * @returns {'startup' | 'mid-size' | 'enterprise'}
 */
export function getSizeCategory(companyName) {
  if (!companyName || typeof companyName !== 'string') return 'startup';
  const normalized = companyName.trim().toLowerCase();
  const isEnterprise = KNOWN_ENTERPRISE.some((name) => normalized.includes(name) || name.includes(normalized));
  if (isEnterprise) return 'enterprise';
  return 'startup';
}

/**
 * Infer industry from company name and optional JD text.
 * @param {string} [companyName]
 * @param {string} [jdText]
 * @returns {string}
 */
export function inferIndustry(companyName, jdText) {
  const combined = [companyName, jdText].filter(Boolean).join(' ').toLowerCase();
  if (!combined) return DEFAULT_INDUSTRY;
  for (const { keywords, industry } of INDUSTRY_KEYWORDS) {
    if (keywords.some((kw) => combined.includes(kw))) return industry;
  }
  return DEFAULT_INDUSTRY;
}

/**
 * @param {'startup' | 'mid-size' | 'enterprise'} size
 * @returns {string}
 */
export function getTypicalHiringFocus(size) {
  if (size === 'enterprise') {
    return 'Structured DSA and core CS fundamentals; standardized online tests and technical rounds. Focus on consistency and scalability mindset.';
  }
  if (size === 'mid-size') {
    return 'Balance of problem-solving and stack depth; often fewer rounds with broader scope.';
  }
  return 'Practical problem-solving and stack depth; flexibility and ownership. Expect hands-on coding and system discussion.';
}

/**
 * @param {'startup' | 'mid-size' | 'enterprise'} size
 * @param {{ byCategory?: Record<string, string[]>, hasAny?: boolean }} extractedSkills
 * @returns {{ round: number, title: string, why: string }[]}
 */
export function getRoundMapping(size, extractedSkills) {
  const byCategory = extractedSkills?.byCategory || {};
  const has = (cat) => Array.isArray(byCategory[cat]) && byCategory[cat].length > 0;
  const hasDSA = has('Core CS') && (byCategory['Core CS'] || []).some((s) => /DSA/i.test(s));
  const hasWeb = has('Web');
  const hasReactNode = hasWeb && (byCategory['Web'] || []).some((s) => /React|Node/i.test(s));
  const hasData = has('Data');
  const hasCloud = has('Cloud/DevOps');

  if (size === 'enterprise') {
    const rounds = [
      {
        round: 1,
        title: hasDSA ? 'Online Test (DSA + Aptitude)' : 'Online Test (Aptitude + Technical MCQs)',
        why: 'Filters for baseline problem-solving and fundamentals before live rounds.',
      },
      {
        round: 2,
        title: hasDSA ? 'Technical (DSA + Core CS)' : 'Technical (Core CS + Coding)',
        why: 'Assesses depth in data structures, algorithms, and CS fundamentals.',
      },
      {
        round: 3,
        title: 'Tech + Projects',
        why: 'Validates real project experience and how you apply your stack.',
      },
      {
        round: 4,
        title: 'HR',
        why: 'Fit, motivation, and communication; often final gate.',
      },
    ];
    return rounds;
  }

  if (size === 'mid-size') {
    return [
      { round: 1, title: 'Screening (Aptitude / Coding)', why: 'Quick filter on basics and coding ability.' },
      { round: 2, title: 'Technical (Stack + DSA)', why: 'Deeper dive into role-relevant skills.' },
      { round: 3, title: 'Projects + Culture', why: 'How you work and what you’ve built.' },
    ];
  }

  // startup
  if (hasReactNode || hasWeb) {
    return [
      { round: 1, title: 'Practical coding', why: 'Hands-on task to see how you build and reason.' },
      { round: 2, title: 'System discussion', why: 'Design and trade-offs; how you think at a higher level.' },
      { round: 3, title: 'Culture fit', why: 'Values, ownership, and how you’d work with the team.' },
    ];
  }
  if (hasDSA) {
    return [
      { round: 1, title: 'Coding (DSA + basics)', why: 'Core problem-solving and code quality.' },
      { round: 2, title: 'Technical + Projects', why: 'Apply skills and discuss your work.' },
      { round: 3, title: 'Culture fit', why: 'Alignment with team and role.' },
    ];
  }
  return [
    { round: 1, title: 'Screening (Technical / Coding)', why: 'Assess fundamentals and approach.' },
    { round: 2, title: 'Technical deep-dive', why: 'Role-specific depth and projects.' },
    { round: 3, title: 'Culture fit', why: 'Fit and motivation.' },
  ];
}

/**
 * Build full company intel for storage. Call when company name is provided.
 * @param {string} companyName
 * @param {string} [jdText]
 * @param {{ byCategory?: Record<string, string[]>, hasAny?: boolean }} [extractedSkills]
 * @returns {{ companyName: string, industry: string, sizeCategory: string, typicalHiringFocus: string, roundMapping: { round: number, title: string, why: string }[] }}
 */
export function buildCompanyIntel(companyName, jdText, extractedSkills = {}) {
  const name = (companyName || '').trim() || 'Unknown';
  const size = getSizeCategory(name);
  const industry = inferIndustry(name, jdText);
  const typicalHiringFocus = getTypicalHiringFocus(size);
  const roundMapping = getRoundMapping(size, extractedSkills);
  return {
    companyName: name,
    industry,
    sizeCategory: size,
    sizeLabel: size === 'enterprise' ? 'Enterprise (2000+)' : size === 'mid-size' ? 'Mid-size (200–2000)' : 'Startup (<200)',
    typicalHiringFocus,
    roundMapping,
  };
}

/**
 * Build round mapping only (when company not provided). Uses startup + extractedSkills.
 * @param {{ byCategory?: Record<string, string[]>, hasAny?: boolean }} [extractedSkills]
 * @returns {{ round: number, title: string, why: string }[]}
 */
export function buildRoundMappingOnly(extractedSkills = {}) {
  return getRoundMapping('startup', extractedSkills);
}
