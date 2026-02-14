import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { isChecklistComplete } from '../lib/testChecklistStorage';
import { isProofComplete } from '../lib/proofStorage';
import { Lock, Ship as ShipIcon, CheckCircle, Loader2 } from 'lucide-react';

export default function Ship() {
  const [checklistOk, setChecklistOk] = useState(false);
  const [proofOk, setProofOk] = useState(false);

  useEffect(() => {
    setChecklistOk(isChecklistComplete());
    setProofOk(isProofComplete());
  }, []);

  const shipped = checklistOk && proofOk;

  if (!checklistOk) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4 flex items-center justify-center">
        <Card className="max-w-md w-full border-amber-200 bg-amber-50/50">
          <CardHeader>
            <div className="flex items-center gap-2 text-amber-800">
              <Lock className="w-6 h-6 shrink-0" />
              <CardTitle>Ship locked</CardTitle>
            </div>
            <CardDescription>
              Complete all 10 tests on the Test Checklist to unlock shipping.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/prp/07-test"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              Go to Test Checklist
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Ship</h1>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
              shipped
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {shipped ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Shipped
              </>
            ) : (
              <>
                <Loader2 className="w-4 h-4" />
                In Progress
              </>
            )}
          </span>
        </div>

        {shipped ? (
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <div className="flex items-center gap-2 text-gray-900">
                <ShipIcon className="w-6 h-6 text-primary" />
                <CardTitle>Ready to ship</CardTitle>
              </div>
              <CardDescription>
                All tests passed. All steps and proof links complete.
              </CardDescription>
              <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mt-2">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">10 / 10 tests passed. Proof complete.</span>
              </div>
              <div className="mt-4 pt-4 border-t border-green-200 text-gray-700 space-y-2">
                <p className="font-medium">You built a real product.</p>
                <p>Not a tutorial. Not a clone.</p>
                <p>A structured tool that solves a real problem.</p>
                <p className="font-medium text-primary pt-1">This is your proof of work.</p>
              </div>
            </CardHeader>
            <CardContent>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
              >
                Back to home
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>In Progress</CardTitle>
              <CardDescription>
                Complete all 8 steps and provide all 3 proof links on the Proof page to reach Shipped status.
              </CardDescription>
              <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mt-2">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">10 / 10 tests passed.</span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Link
                to="/prp/proof"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
              >
                Go to Proof & submission
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Back to home
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
