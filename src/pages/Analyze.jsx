import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { runAnalysis } from '../lib/analyzeJD';
import { saveToHistory, createId } from '../lib/historyStorage';
import { buildCompanyIntel, buildRoundMappingOnly } from '../lib/companyIntel';
import { buildStandardEntry } from '../lib/analysisSchema';
import { FileText } from 'lucide-react';

export default function Analyze() {
  const navigate = useNavigate();
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [jdText, setJdText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!jdText.trim()) return;
    setIsSubmitting(true);
    try {
      const result = runAnalysis({ company: company.trim(), role: role.trim(), jdText: jdText.trim() });
      const id = createId();
      const createdAt = new Date().toISOString();
      const companyTrimmed = company.trim();
      const companyIntel = companyTrimmed
        ? buildCompanyIntel(companyTrimmed, jdText.trim(), result.extractedSkills)
        : undefined;
      const roundMappingRaw = companyIntel
        ? companyIntel.roundMapping
        : buildRoundMappingOnly(result.extractedSkills);
      const entry = buildStandardEntry({
        id,
        createdAt,
        company: companyTrimmed,
        role: role.trim(),
        jdText: jdText.trim(),
        result,
        companyIntel,
        roundMappingRaw,
      });
      saveToHistory(entry);
      navigate(`/dashboard/results?id=${id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Analyze Job Description</h2>
        <p className="text-gray-600">Paste a JD to extract skills, get a checklist, 7-day plan, and readiness score.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Job details
            </CardTitle>
            <CardDescription>Company and role improve your readiness score and plan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                  Company (optional)
                </label>
                <input
                  id="company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Google, Microsoft"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role (optional)
                </label>
                <input
                  id="role"
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. SDE Intern, Full Stack Developer"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label htmlFor="jd" className="block text-sm font-medium text-gray-700 mb-1">
                Job description text <span className="text-gray-400">(required)</span>
              </label>
              <textarea
                id="jd"
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the full job description here..."
                rows={12}
                required
                minLength={1}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y font-mono text-sm"
              />
              {jdText.trim().length > 0 && jdText.trim().length < 200 && (
                <p className="text-sm text-amber-700 mt-1.5 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5">
                  This JD is too short to analyze deeply. Paste full JD for better output.
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Longer JDs (800+ chars) add +10 to your readiness score.
              </p>
            </div>
            <button
              type="submit"
              disabled={!jdText.trim() || isSubmitting}
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? 'Analyzing…' : 'Analyze'}
            </button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
