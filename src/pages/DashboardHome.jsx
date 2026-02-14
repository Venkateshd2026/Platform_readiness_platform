import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

const READINESS_SCORE = 72;
const READINESS_MAX = 100;
const CIRCLE_R = 80;
const CIRCLE_C = 2 * Math.PI * CIRCLE_R;
const DASH_OFFSET = CIRCLE_C * (1 - READINESS_SCORE / READINESS_MAX);

const SKILL_DATA = [
  { subject: 'DSA', value: 75, fullMark: 100 },
  { subject: 'System Design', value: 60, fullMark: 100 },
  { subject: 'Communication', value: 80, fullMark: 100 },
  { subject: 'Resume', value: 85, fullMark: 100 },
  { subject: 'Aptitude', value: 70, fullMark: 100 },
];

const WEEKLY_DAYS = [
  { label: 'Mon', active: true },
  { label: 'Tue', active: true },
  { label: 'Wed', active: false },
  { label: 'Thu', active: true },
  { label: 'Fri', active: true },
  { label: 'Sat', active: true },
  { label: 'Sun', active: false },
];

const ASSESSMENTS = [
  { title: 'DSA Mock Test', when: 'Tomorrow, 10:00 AM' },
  { title: 'System Design Review', when: 'Wed, 2:00 PM' },
  { title: 'HR Interview Prep', when: 'Friday, 11:00 AM' },
];

function OverallReadiness() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overall Readiness</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center pb-6">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r={CIRCLE_R}
              fill="none"
              stroke="rgb(229, 231, 235)"
              strokeWidth="12"
            />
            <circle
              cx="100"
              cy="100"
              r={CIRCLE_R}
              fill="none"
              stroke="hsl(245, 58%, 51%)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={CIRCLE_C}
              strokeDashoffset={DASH_OFFSET}
              style={{ transition: 'stroke-dashoffset 0.6s ease-in-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-gray-900">{READINESS_SCORE}</span>
            <span className="text-sm text-gray-500">Readiness Score</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SkillBreakdown() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Skill Breakdown</CardTitle>
        <CardDescription>Scores across key areas (0–100)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <RechartsRadarChart data={SKILL_DATA} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <PolarGrid stroke="rgb(229, 231, 235)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: 'rgb(75, 85, 99)', fontSize: 12 }}
              tickLine={false}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: 'rgb(156, 163, 175)', fontSize: 10 }}
            />
            <Radar
              name="Score"
              dataKey="value"
              stroke="hsl(245, 58%, 51%)"
              fill="hsl(245, 58%, 51%)"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function ContinuePractice() {
  const completed = 3;
  const total = 10;
  const pct = (completed / total) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Continue Practice</CardTitle>
        <CardDescription>Last topic</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="font-medium text-gray-900 mb-3">Dynamic Programming</p>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${pct}%`, transition: 'width 0.3s ease-in-out' }}
          />
        </div>
        <p className="text-sm text-gray-500">
          {completed}/{total} completed
        </p>
      </CardContent>
      <CardFooter>
        <button
          type="button"
          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-colors"
        >
          Continue
        </button>
      </CardFooter>
    </Card>
  );
}

function WeeklyGoals() {
  const solved = 12;
  const goal = 20;
  const pct = (solved / goal) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Goals</CardTitle>
        <CardDescription>This week</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium text-gray-700 mb-1">
          Problems Solved: {solved}/{goal} this week
        </p>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-6">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${pct}%`, transition: 'width 0.3s ease-in-out' }}
          />
        </div>
        <div className="flex justify-between items-center">
          {WEEKLY_DAYS.map(({ label, active }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium ${
                  active
                    ? 'bg-primary border-primary text-white'
                    : 'bg-white border-gray-200 text-gray-400'
                }`}
              >
                {label.slice(0, 1)}
              </div>
              <span className="text-xs text-gray-500">{label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function UpcomingAssessments() {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Upcoming Assessments</CardTitle>
        <CardDescription>Scheduled sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-gray-100">
          {ASSESSMENTS.map(({ title, when }) => (
            <li key={title} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">{title}</p>
                <p className="text-sm text-gray-500">{when}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Overview of your placement readiness</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <OverallReadiness />
        <SkillBreakdown />
        <ContinuePractice />
        <WeeklyGoals />
        <UpcomingAssessments />
      </div>
    </div>
  );
}
