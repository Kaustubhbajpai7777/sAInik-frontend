'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface QuizResult {
  score: number;
  totalQuestions: number;
  completedAt: string;
  processedContent: {
    title: string;
  };
}

export default function AnalyticsPage() {
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authIsLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const token = localStorage.getItem('token');
      if (!token || !isAuthenticated) return;

      try {
        setIsLoading(true);
        const res = await fetch('http://localhost:8000/api/analytics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch analytics data.');
        const data = await res.json();
        setResults(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchAnalytics();
    }
  }, [isAuthenticated]);

  const chartData = results.map(r => ({
    name: new Date(r.completedAt).toLocaleDateString(),
    score: (r.score / r.totalQuestions) * 100, // Show score as a percentage
  })).reverse(); // Reverse to show progress over time from left to right


  if (authIsLoading || isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-foreground">Loading Analytics...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-orange mb-6 sm:mb-8 text-center sm:text-left">Your Progress Analytics</h1>

        <div className="bg-card p-4 sm:p-6 rounded-lg mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-2xl font-bold mb-4">Score Over Time (%)</h2>
          {results.length > 0 ? (
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                <XAxis dataKey="name" stroke="#a0aec0" fontSize={12} className="sm:text-sm" />
                <YAxis stroke="#a0aec0" domain={[0, 100]} fontSize={12} className="sm:text-sm" />
                <Tooltip contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568', fontSize: '14px' }} />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#dd6b20" strokeWidth={2} activeDot={{ r: 6 }} className="sm:strokeWidth-3" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center sm:text-left">No quiz results yet. Complete some quizzes to see your progress!</p>
          )}
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-lg">
          <h2 className="text-lg sm:text-2xl font-bold mb-4">Detailed Results</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="border-b border-gray-600">
                <tr>
                  <th className="p-2 sm:p-3 text-sm sm:text-base">Quiz Title</th>
                  <th className="p-2 sm:p-3 text-sm sm:text-base">Score</th>
                  <th className="p-2 sm:p-3 text-sm sm:text-base">Date Completed</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index} className="border-b border hover:bg-[#4a5568]">
                    <td className="p-2 sm:p-3 text-xs sm:text-sm truncate max-w-[200px]" title={result.processedContent.title}>{result.processedContent.title}</td>
                    <td className="p-2 sm:p-3 font-mono text-xs sm:text-sm">{result.score} / {result.totalQuestions}</td>
                    <td className="p-2 sm:p-3 text-xs sm:text-sm">{new Date(result.completedAt).toLocaleDateString()} {new Date(result.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}