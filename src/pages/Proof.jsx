import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  getSubmission,
  setSubmission,
  setStepCompleted,
  isValidUrl,
  getFinalSubmissionText,
  STEP_COUNT,
} from '../lib/proofStorage';
import { FileCheck, Copy, CheckCircle, Circle } from 'lucide-react';

const STEP_LABELS = [
  'Landing page & Get Started',
  'JD analysis & skill extraction',
  'Results & readiness score',
  'Skill toggles & persistence',
  'Company intel & round mapping',
  'History & export',
  'Test checklist (10/10)',
  'Proof & submission',
];

export default function Proof() {
  const [submission, setSubmissionState] = useState(() => getSubmission());
  const [copied, setCopied] = useState(false);
  const [touched, setTouched] = useState({ lovable: false, github: false, deployed: false });

  useEffect(() => {
    setSubmissionState(getSubmission());
  }, []);

  const handleStepToggle = (index, checked) => {
    setStepCompleted(index, checked);
    setSubmissionState(getSubmission());
  };

  const handleLinkChange = (field, value) => {
    setSubmission({ [field]: value });
    setSubmissionState(getSubmission());
  };

  const handleBlur = (field) => {
    setTouched((t) => ({ ...t, [field]: true }));
  };

  const handleCopyFinal = async () => {
    try {
      await navigator.clipboard.writeText(getFinalSubmissionText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (_) {}
  };

  const lovableValid = isValidUrl(submission.lovableUrl);
  const githubValid = isValidUrl(submission.githubUrl);
  const deployedValid = isValidUrl(submission.deployedUrl);
  const showLovableError = touched.lovable && submission.lovableUrl && !lovableValid;
  const showGithubError = touched.github && submission.githubUrl && !githubValid;
  const showDeployedError = touched.deployed && submission.deployedUrl && !deployedValid;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <FileCheck className="w-7 h-7 text-primary" />
            Proof & submission
          </h1>
          <p className="text-gray-600 mt-1">Complete steps and add artifact links for ship status.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Step completion overview</CardTitle>
            <CardDescription>Mark each step when completed (8 steps required for Shipped).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {STEP_LABELS.map((label, index) => (
              <label key={index} className="flex gap-3 items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={submission.stepsCompleted[index] ?? false}
                  onChange={(e) => handleStepToggle(index, e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">
                  {label}
                </span>
                <span className="text-xs text-gray-500 ml-auto">
                  {submission.stepsCompleted[index] ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Completed
                    </span>
                  ) : (
                    <span className="text-gray-400 flex items-center gap-1">
                      <Circle className="w-4 h-4" /> Pending
                    </span>
                  )}
                </span>
              </label>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Artifact inputs (required for Ship status)</CardTitle>
            <CardDescription>Valid URLs (http:// or https://) required for all three.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="lovable" className="block text-sm font-medium text-gray-700 mb-1">
                Lovable Project Link
              </label>
              <input
                id="lovable"
                type="url"
                value={submission.lovableUrl}
                onChange={(e) => handleLinkChange('lovableUrl', e.target.value)}
                onBlur={() => handleBlur('lovable')}
                placeholder="https://..."
                className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary ${
                  showLovableError ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {showLovableError && (
                <p className="text-xs text-red-600 mt-1">Enter a valid URL (http:// or https://).</p>
              )}
            </div>
            <div>
              <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-1">
                GitHub Repository Link
              </label>
              <input
                id="github"
                type="url"
                value={submission.githubUrl}
                onChange={(e) => handleLinkChange('githubUrl', e.target.value)}
                onBlur={() => handleBlur('github')}
                placeholder="https://github.com/..."
                className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary ${
                  showGithubError ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {showGithubError && (
                <p className="text-xs text-red-600 mt-1">Enter a valid URL (http:// or https://).</p>
              )}
            </div>
            <div>
              <label htmlFor="deployed" className="block text-sm font-medium text-gray-700 mb-1">
                Deployed URL
              </label>
              <input
                id="deployed"
                type="url"
                value={submission.deployedUrl}
                onChange={(e) => handleLinkChange('deployedUrl', e.target.value)}
                onBlur={() => handleBlur('deployed')}
                placeholder="https://..."
                className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary ${
                  showDeployedError ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {showDeployedError && (
                <p className="text-xs text-red-600 mt-1">Enter a valid URL (http:// or https://).</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Final submission export</CardTitle>
            <CardDescription>Copy the formatted block to submit or share.</CardDescription>
          </CardHeader>
          <CardContent>
            <button
              type="button"
              onClick={handleCopyFinal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Final Submission
                </>
              )}
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
