import { useSearchParams } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { getEntryById, getLatestEntry, updateEntry } from '../lib/historyStorage';
import { DEFAULT_STACK_LABEL } from '../lib/skillKeywords';
import { toByCategory, getAllSkillsFromSchema } from '../lib/analysisSchema';
import { buildCompanyIntel, buildRoundMappingOnly } from '../lib/companyIntel';
import { Copy, Download, Check, Target, Building2, MapPin } from 'lucide-react';

function CircularScore({ score }) {
  const r = 64;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - score / 100);
  return (
    <div className="relative w-40 h-40">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={r} fill="none" stroke="rgb(229, 231, 235)" strokeWidth="10" />
        <circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          stroke="hsl(245, 58%, 51%)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.4s ease-in-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-900">{score}</span>
        <span className="text-xs text-gray-500">Readiness</span>
      </div>
    </div>
  );
}

function formatPlanAsText(plan7Days) {
  if (!plan7Days || !plan7Days.length) return '';
  return plan7Days
    .map(({ focus, tasks }) => `${focus}\n${(tasks || []).map((i) => `  • ${i}`).join('\n')}`)
    .join('\n\n');
}

function formatChecklistAsText(checklist) {
  if (!checklist || !checklist.length) return '';
  return checklist
    .map(({ roundTitle, items }) => `${roundTitle}\n${(items || []).map((i) => `  • ${i}`).join('\n')}`)
    .join('\n\n');
}

function formatQuestionsAsText(questions) {
  if (!questions || !questions.length) return '';
  return questions.map((q, i) => `${i + 1}. ${q}`).join('\n\n');
}

export default function Results() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [entry, setEntry] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [copiedSection, setCopiedSection] = useState(null);

  useEffect(() => {
    const resolved = id ? getEntryById(id) : getLatestEntry();
    if (resolved) setEntry(resolved);
    else setNotFound(true);
  }, [id]);

  const byCategory = entry ? toByCategory(entry.extractedSkills) : {};
  const allSkillsByCategory = entry ? Object.entries(byCategory) : [];
  const skillConfidenceMap = entry?.skillConfidenceMap || {};
  const baseScore = entry?.baseScore ?? 0;

  const getLiveScore = useCallback(() => {
    return entry?.finalScore ?? baseScore;
  }, [entry?.finalScore, baseScore]);

  const liveScore = getLiveScore();

  const setSkillConfidence = useCallback(
    (skill, value) => {
      if (!entry?.id) return;
      const next = { ...skillConfidenceMap, [skill]: value };
      const allSkills = getAllSkillsFromSchema(entry.extractedSkills);
      let knowCount = 0;
      let practiceCount = 0;
      allSkills.forEach((s) => {
        const c = next[s] || 'practice';
        if (c === 'know') knowCount += 1;
        else practiceCount += 1;
      });
      const finalScore = Math.min(100, Math.max(0, baseScore + 2 * knowCount - 2 * practiceCount));
      const updatedAt = new Date().toISOString();
      updateEntry(entry.id, { skillConfidenceMap: next, finalScore, updatedAt });
      setEntry((prev) => (prev ? { ...prev, skillConfidenceMap: next, finalScore, updatedAt } : prev));
    },
    [entry?.id, entry?.extractedSkills, baseScore, skillConfidenceMap]
  );

  const copyToClipboard = useCallback(async (text, section) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (_) {}
  }, []);

  const downloadTxt = useCallback(() => {
    if (!entry) return;
    const { company, role, checklist, plan7Days, questions } = entry;
    const lines = [
      'Placement Readiness – Analysis Export',
      company ? `Company: ${company}` : '',
      role ? `Role: ${role}` : '',
      `Readiness Score: ${liveScore}`,
      '',
      '--- Key skills (see results for self-assessment) ---',
      '',
      '--- Round-wise preparation checklist ---',
      formatChecklistAsText(checklist),
      '',
      '--- 7-day plan ---',
      formatPlanAsText(plan7Days),
      '',
      '--- 10 likely interview questions ---',
      formatQuestionsAsText(questions),
    ].filter(Boolean);
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `placement-readiness-${entry.id.slice(0, 12)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [entry, liveScore]);

  if (notFound || (!entry && !id)) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Results</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600">
              No analysis found. Run an analysis from <strong>Analyze</strong> or open a saved entry from <strong>History</strong>.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Results</h2>
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  const { company, role, checklist, plan7Days, questions } = entry;
  const hasAny = allSkillsByCategory.length > 0;
  const categories = allSkillsByCategory;

  const companyIntel = entry.companyIntel ?? (company ? buildCompanyIntel(company, entry.jdText, { byCategory }) : null);
  const roundMapping = entry.roundMapping?.length ? entry.roundMapping : buildRoundMappingOnly({ byCategory });

  const practiceSkills = [];
  allSkillsByCategory.forEach(([, skills]) => {
    (skills || []).forEach((s) => {
      if ((skillConfidenceMap[s] || 'practice') === 'practice') practiceSkills.push(s);
    });
  });
  const top3Weak = practiceSkills.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-2xl font-semibold text-gray-900">Analysis results</h2>
        {company && (
          <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-sm font-medium">
            {company}
          </span>
        )}
        {role && (
          <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-sm">
            {role}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Readiness score</CardTitle>
            <CardDescription>Updates live with your skill self-assessment</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <CircularScore score={liveScore} />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Key skills extracted</CardTitle>
            <CardDescription>
              {hasAny ? 'Toggle per skill: your choice is saved' : DEFAULT_STACK_LABEL}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasAny ? (
              <div className="flex flex-wrap gap-3">
                {categories.map(([cat, skills]) => (
                  <div key={cat} className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide w-full md:w-auto">
                      {cat}:
                    </span>
                    {(skills || []).map((skill) => {
                      const confidence = skillConfidenceMap[skill] || 'practice';
                      return (
                        <div
                          key={skill}
                          className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50/80 overflow-hidden"
                        >
                          <span
                            className={`px-2 py-1 text-sm font-medium ${
                              confidence === 'know'
                                ? 'bg-primary/15 text-primary'
                                : 'bg-amber-50 text-amber-800'
                            }`}
                          >
                            {skill}
                          </span>
                          <div className="flex border-l border-gray-200">
                            <button
                              type="button"
                              onClick={() => setSkillConfidence(skill, 'know')}
                              className={`px-2 py-1 text-xs font-medium transition-colors ${
                                confidence === 'know'
                                  ? 'bg-primary text-white'
                                  : 'bg-white text-gray-500 hover:bg-gray-100'
                              }`}
                              title="I know this"
                            >
                              I know
                            </button>
                            <button
                              type="button"
                              onClick={() => setSkillConfidence(skill, 'practice')}
                              className={`px-2 py-1 text-xs font-medium transition-colors ${
                                confidence === 'practice'
                                  ? 'bg-amber-200 text-amber-900'
                                  : 'bg-white text-gray-500 hover:bg-gray-100'
                              }`}
                              title="Need practice"
                            >
                              Practice
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">{DEFAULT_STACK_LABEL}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Company Intel — only when company provided */}
      {company && companyIntel && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Building2 className="w-5 h-5 text-primary" />
              Company intel
            </CardTitle>
            <CardDescription>{companyIntel.companyName}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block">Industry</span>
                <span className="font-medium text-gray-900">{companyIntel.industry}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Estimated size</span>
                <span className="font-medium text-gray-900">{companyIntel.sizeLabel}</span>
              </div>
            </div>
            <div>
              <span className="text-gray-500 block text-sm mb-1">Typical hiring focus</span>
              <p className="text-sm text-gray-700">{companyIntel.typicalHiringFocus}</p>
            </div>
            <p className="text-xs text-gray-500 italic">Demo Mode: Company intel generated heuristically.</p>
          </CardContent>
        </Card>
      )}

      {/* Round Mapping — vertical timeline */}
      {roundMapping && roundMapping.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <MapPin className="w-5 h-5 text-primary" />
              Round mapping
            </CardTitle>
            <CardDescription>Expected flow based on company size and detected skills</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6 space-y-0">
              {roundMapping.map((r, i) => (
                <div key={i} className="relative pb-6 last:pb-0">
                  {i < roundMapping.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-0 w-px bg-gray-200" />
                  )}
                  <div className="absolute left-0 top-0.5 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold">
                    {i + 1}
                  </div>
                  <div className="ml-8">
                    <h4 className="text-sm font-semibold text-gray-900">{r.roundTitle ?? r.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{r.whyItMatters ?? r.why}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 italic mt-4">Demo Mode: Company intel generated heuristically.</p>
          </CardContent>
        </Card>
      )}

      {/* Export tools */}
      <Card>
        <CardHeader>
          <CardTitle>Export</CardTitle>
          <CardDescription>Copy sections or download everything as one file</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => copyToClipboard(formatPlanAsText(plan7Days), 'plan')}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {copiedSection === 'plan' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            Copy 7-day plan
          </button>
          <button
            type="button"
            onClick={() => copyToClipboard(formatChecklistAsText(checklist), 'checklist')}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {copiedSection === 'checklist' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            Copy round checklist
          </button>
          <button
            type="button"
            onClick={() => copyToClipboard(formatQuestionsAsText(questions), 'questions')}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {copiedSection === 'questions' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            Copy 10 questions
          </button>
          <button
            type="button"
            onClick={downloadTxt}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download as TXT
          </button>
        </CardContent>
      </Card>

      {/* Round-wise checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Round-wise preparation checklist</CardTitle>
          <CardDescription>5–8 items per round based on detected skills</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {(checklist || []).map(({ roundTitle, items }, idx) => (
              <div key={idx}>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">{roundTitle}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {(items || []).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 7-day plan */}
      <Card>
        <CardHeader>
          <CardTitle>7-day plan</CardTitle>
          <CardDescription>Adapted to detected skills</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(plan7Days || []).map(({ day, focus, tasks }) => (
              <div key={day} className="border-l-2 border-primary/30 pl-4">
                <h4 className="text-sm font-semibold text-gray-900">{focus}</h4>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-sm text-gray-600">
                  {(tasks || []).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 10 likely questions */}
      <Card>
        <CardHeader>
          <CardTitle>10 likely interview questions</CardTitle>
          <CardDescription>Based on detected skills</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            {(questions || []).map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Action Next */}
      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Target className="w-5 h-5 text-primary" />
            Action next
          </CardTitle>
          <CardDescription>Focus on weak areas first</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {top3Weak.length > 0 ? (
            <>
              <p className="text-sm font-medium text-gray-700">Top skills to practice:</p>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {top3Weak.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-gray-600">All extracted skills are marked as known. Keep revising and run mocks.</p>
          )}
          <p className="text-sm font-medium text-primary pt-1">
            Start Day 1 plan now.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
