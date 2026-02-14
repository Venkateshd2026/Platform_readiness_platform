import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  getChecklistState,
  setChecklistItem,
  resetChecklist,
  isChecklistComplete,
} from '../lib/testChecklistStorage';
import { ClipboardCheck, AlertTriangle, RotateCcw } from 'lucide-react';

const TESTS = [
  {
    label: 'JD required validation works',
    hint: 'Leave JD empty and try to submit; button should stay disabled. Paste text to enable.',
  },
  {
    label: 'Short JD warning shows for <200 chars',
    hint: 'Paste fewer than 200 characters in the JD field; the amber warning message should appear.',
  },
  {
    label: 'Skills extraction groups correctly',
    hint: 'Analyze a JD with DSA, React, SQL; Results should show skills grouped by category (Core CS, Web, Data).',
  },
  {
    label: 'Round mapping changes based on company + skills',
    hint: 'Run analysis with company "TCS" + DSA in JD → 4 rounds. With company "MyStartup" + React in JD → 3 rounds (Practical coding, etc.).',
  },
  {
    label: 'Score calculation is deterministic',
    hint: 'Same JD + company + role should produce the same baseScore every time you analyze.',
  },
  {
    label: 'Skill toggles update score live',
    hint: 'On Results, toggle "I know" / "Practice" on skills; the readiness score circle should update immediately.',
  },
  {
    label: 'Changes persist after refresh',
    hint: 'Toggle some skills on Results, refresh the page, reopen the same result; toggles and score should be unchanged.',
  },
  {
    label: 'History saves and loads correctly',
    hint: 'Run an analysis, go to History; entry appears. Click it to open Results. Refresh History; list still there.',
  },
  {
    label: 'Export buttons copy the correct content',
    hint: 'On Results, use Copy 7-day plan, Copy checklist, Copy questions; paste elsewhere and confirm content matches.',
  },
  {
    label: 'No console errors on core pages',
    hint: 'Open Landing, Dashboard, Analyze, Results, History; keep DevTools console open and confirm no errors.',
  },
];

export default function TestChecklist() {
  const [state, setState] = useState(() => getChecklistState());

  useEffect(() => {
    setState(getChecklistState());
  }, []);

  const handleToggle = (index, checked) => {
    setChecklistItem(index, checked);
    setState(getChecklistState());
  };

  const handleReset = () => {
    resetChecklist();
    setState(getChecklistState());
  };

  const passed = state.filter(Boolean).length;
  const allComplete = isChecklistComplete();

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <ClipboardCheck className="w-7 h-7 text-primary" />
            Test checklist
          </h1>
          <p className="text-gray-600 mt-1">Verify placement readiness flows before shipping.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tests passed: {passed} / 10</CardTitle>
            <CardDescription>
              {allComplete
                ? 'All tests passed. You can proceed to Ship.'
                : 'Check each item after manually verifying the behavior.'}
            </CardDescription>
            {!allComplete && (
              <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">Fix issues before shipping.</span>
              </div>
            )}
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Checks</CardTitle>
            <CardDescription>Mark each item when you have verified it.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {TESTS.map((test, index) => (
              <label
                key={index}
                className="flex gap-3 items-start cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={state[index] ?? false}
                  onChange={(e) => handleToggle(index, e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                    {test.label}
                  </span>
                  {test.hint && (
                    <p className="text-sm text-gray-500 mt-0.5">How to test: {test.hint}</p>
                  )}
                </div>
              </label>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset checklist
          </button>
        </div>
      </div>
    </div>
  );
}
