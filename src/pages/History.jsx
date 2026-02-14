import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { getValidHistory } from '../lib/historyStorage';
import { useState, useEffect } from 'react';
import { Clock, Building2, Briefcase, Award } from 'lucide-react';

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso || '—';
  }
}

export default function History() {
  const [entries, setEntries] = useState([]);
  const [skippedCount, setSkippedCount] = useState(0);

  useEffect(() => {
    const { entries: valid, skippedCount: skipped } = getValidHistory();
    setEntries(valid);
    setSkippedCount(skipped);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Analysis history</h2>
        <p className="text-gray-600">Saved analyses are stored locally. Click one to view full results.</p>
      </div>

      {skippedCount > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <p className="text-sm text-amber-800">
              {skippedCount === 1
                ? "One saved entry couldn't be loaded. Create a new analysis."
                : `${skippedCount} saved entries couldn't be loaded. Create a new analysis.`}
            </p>
          </CardContent>
        </Card>
      )}

      {entries.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600">
              No analyses yet. Go to <strong>Analyze</strong>, paste a job description, and run an analysis. It will appear here and persist after refresh.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-4">
          {entries.map((entry) => (
            <li key={entry.id}>
              <Link
                to={`/dashboard/results?id=${entry.id}`}
                className="block"
              >
                <Card className="hover:border-primary/40 hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {formatDate(entry.createdAt)}
                      </span>
                      {entry.company && (
                        <span className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                          <Building2 className="w-4 h-4 text-primary" />
                          {entry.company}
                        </span>
                      )}
                      {entry.role && (
                        <span className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Briefcase className="w-4 h-4" />
                          {entry.role}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-primary ml-auto">
                        <Award className="w-4 h-4" />
                        Score: {entry.finalScore ?? entry.readinessScore}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
