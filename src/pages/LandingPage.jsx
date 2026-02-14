import { Link } from 'react-router-dom';
import { Code2, Video, BarChart3 } from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: Code2,
      title: 'Practice Problems',
      description: 'Solve curated problems across DSA, aptitude, and technical topics.',
    },
    {
      icon: Video,
      title: 'Mock Interviews',
      description: 'Simulate real interviews with timed rounds and feedback.',
    },
    {
      icon: BarChart3,
      title: 'Track Progress',
      description: 'Monitor your readiness with dashboards and analytics.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <section className="px-6 py-24 md:py-32 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Ace Your Placement
          </h1>
          <p className="text-xl text-gray-600 max-w-xl mx-auto mb-10">
            Practice, assess, and prepare for your dream job
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center px-8 py-3 rounded-lg font-medium text-white bg-primary hover:bg-primary-hover transition-colors"
          >
            Get Started
          </Link>
        </section>

        <section className="px-6 py-16 bg-white border-t border-gray-200">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="p-6 rounded-xl border border-gray-200 bg-gray-50/50 hover:border-primary/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
                  <p className="text-gray-600 text-sm">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="px-6 py-6 border-t border-gray-200 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Placement Readiness Platform. All rights reserved.
      </footer>
    </div>
  );
}
