'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; 
import Link from 'next/link'; 
import { Flame, FileText, Video, ClipboardCheck } from 'lucide-react';

// Define types for our dashboard data
interface RecentContent {
  id: number;
  title: string;
  type: string;
}
interface RecentQuiz {
  score: number;
  totalQuestions: number;
  processedContent: { title: string };
}
interface DashboardData {
  recentContent: RecentContent[];
  recentQuizzes: RecentQuiz[];
}

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, isLoading, userName } = useAuth();
  const [stats, setStats] = useState<{ streak: number } | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null); // Using 'any' for simplicity, you can use your defined types

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Fetch recent content
      const contentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/content`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fetch recent quiz results
      const analyticsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (contentResponse.ok && analyticsResponse.ok) {
        const contentData = await contentResponse.json();
        const analyticsData = await analyticsResponse.json();

        // Calculate streak (consecutive days with activity)
        const streak = calculateStreak(analyticsData);
        setStats({ streak });

        // Set dashboard data
        setDashboardData({
          recentContent: contentData.slice(0, 5), // Show last 5 content items
          recentQuizzes: analyticsData.slice(0, 5), // Show last 5 quiz results
          totalContent: contentData.length,
          totalQuizzes: analyticsData.length,
          averageScore: calculateAverageScore(analyticsData)
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Set empty data to prevent infinite loading
      setDashboardData({
        recentContent: [],
        recentQuizzes: [],
        totalContent: 0,
        totalQuizzes: 0,
        averageScore: 0
      });
    }
  };

  const calculateStreak = (quizResults: RecentQuiz[]) => {
    if (!quizResults || quizResults.length === 0) return 0;
    
    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);
    
    // Convert quiz dates and sort by date
    const quizDates = quizResults.map(quiz => {
      const date = new Date((quiz as any).completedAt);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }).sort((a, b) => b.getTime() - a.getTime());
    
    // Remove duplicates
    const uniqueDates = [...new Set(quizDates.map(d => d.getTime()))].map(time => new Date(time));
    
    // Calculate consecutive days
    for (let i = 0; i < uniqueDates.length; i++) {
      currentDate.setHours(0, 0, 0, 0);
      if (uniqueDates[i].getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  const calculateAverageScore = (quizResults: RecentQuiz[]) => {
    if (!quizResults || quizResults.length === 0) return 0;
    
    const totalPercentage = quizResults.reduce((sum, quiz) => {
      return sum + (quiz.score / quiz.totalQuestions) * 100;
    }, 0);
    
    return Math.round(totalPercentage / quizResults.length);
  };

  const getMotivationalMessage = (streak: number) => {
    if (streak === 0) return "Ready to start your NDA preparation journey? Let's get started!";
    if (streak === 1) return "Great start! You're building momentum for NDA success.";
    if (streak < 5) return "You're on a roll! Keep up the consistent study habits.";
    if (streak < 10) return "Excellent progress! Your dedication is showing.";
    if (streak < 20) return "Outstanding commitment! You're building strong study habits.";
    return "Incredible dedication! You're well on your way to NDA success!";
  };

  const getStreakEmoji = (streak: number) => {
    if (streak === 0) return "🎯";
    if (streak < 3) return "🌱";
    if (streak < 7) return "🔥";
    if (streak < 14) return "🚀";
    if (streak < 30) return "⭐";
    return "🏆";
  };

  const getTodayStats = (data: any[]) => {
    if (!data) return { content: 0, quizzes: 0, averageScore: 0 };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayItems = data.filter(item => {
      const itemDate = new Date(item.createdAt || item.completedAt);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate.getTime() === today.getTime();
    });

    if (data[0] && 'score' in data[0]) {
      // This is quiz data
      const averageScore = todayItems.length > 0 
        ? Math.round(todayItems.reduce((sum, quiz) => sum + (quiz.score / quiz.totalQuestions) * 100, 0) / todayItems.length)
        : 0;
      return { content: 0, quizzes: todayItems.length, averageScore };
    } else {
      // This is content data
      return { content: todayItems.length, quizzes: 0, averageScore: 0 };
    }
  };

  if (isLoading || !dashboardData) {
    return (
      // Using theme-aware colors
      <div className="flex h-full w-full items-center justify-center bg-background">
        <p className="text-foreground">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    // Using theme-aware colors
    <div className="min-h-full bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">
              Welcome back, <span className="text-brand-orange">{userName || 'Aspirant'}</span>!
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              {getMotivationalMessage(stats?.streak || 0)}
            </p>
          </div>
          <div className="text-6xl">
            {getStreakEmoji(stats?.streak || 0)}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          {stats && (
            <div className="bg-card p-6 rounded-lg flex items-center gap-4 border border-brand-orange">
              <Flame size={40} className="text-brand-orange" />
              <div>
                <p className="text-2xl font-bold">{stats.streak}</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
            </div>
          )}
          
          <div className="bg-card p-6 rounded-lg flex items-center gap-4 border">
            <FileText size={40} className="text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{dashboardData?.totalContent || 0}</p>
              <p className="text-sm text-muted-foreground">Content Processed</p>
            </div>
          </div>
          
          <div className="bg-card p-6 rounded-lg flex items-center gap-4 border">
            <ClipboardCheck size={40} className="text-green-500" />
            <div>
              <p className="text-2xl font-bold">{dashboardData?.totalQuizzes || 0}</p>
              <p className="text-sm text-muted-foreground">Quizzes Taken</p>
            </div>
          </div>
          
          <div className="bg-card p-6 rounded-lg flex items-center gap-4 border">
            <div className="text-3xl">📊</div>
            <div>
              <p className="text-2xl font-bold">{dashboardData?.averageScore || 0}%</p>
              <p className="text-sm text-muted-foreground">Average Score</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-card p-6 rounded-lg border">
          <h2 className="text-2xl font-bold mb-4 text-brand-orange">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/summarizer" className="flex items-center gap-3 p-4 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors text-white">
              <FileText size={24} />
              <span className="font-semibold">Process New Content</span>
            </Link>
            <Link href="/history" className="flex items-center gap-3 p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white">
              <ClipboardCheck size={24} />
              <span className="font-semibold">View Content History</span>
            </Link>
            <Link href="/chat/general" className="flex items-center gap-3 p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-white">
              <div className="text-xl">💬</div>
              <span className="font-semibold">Join Study Room</span>
            </Link>
          </div>
        </div>

        {/* Today's Progress & Study Goals */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-xl font-bold mb-4 text-brand-orange">Today's Progress</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Content Processed</span>
                <span className="font-semibold">{getTodayStats(dashboardData?.recentContent).content} items</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Quizzes Completed</span>
                <span className="font-semibold">{getTodayStats(dashboardData?.recentQuizzes).quizzes} quizzes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Average Score Today</span>
                <span className="font-semibold">{getTodayStats(dashboardData?.recentQuizzes).averageScore}%</span>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-xl font-bold mb-4 text-brand-orange">NDA Study Tips</h3>
            <div className="space-y-2 text-sm">
              <p>• Focus on Mathematics and General Ability Test (GAT)</p>
              <p>• Practice current affairs and general knowledge daily</p>
              <p>• Solve previous year question papers regularly</p>
              <p>• Maintain a balanced study schedule</p>
              <p>• Take mock tests to assess your progress</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="bg-card p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-brand-orange">Recent Content</h2>
              <Link href="/history" className="text-orange-500 hover:text-orange-600 text-sm">View All</Link>
            </div>
            <div className="space-y-3">
              {dashboardData?.recentContent?.length > 0 ? (
                dashboardData.recentContent.map((item: any) => (
                  <Link href={`/content/${item.id}`} key={item.id} className="flex items-center gap-4 p-3 rounded-md hover:bg-secondary transition-colors border border-gray-600">
                    {item.type === 'pdf' ? <FileText className="text-blue-400" /> : <Video className="text-red-400" />}
                    <div className="flex-1">
                      <span className="font-semibold block">{item.title}</span>
                      <span className="text-xs text-muted-foreground capitalize">{item.type} • {new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto text-muted-foreground mb-2" size={48} />
                  <p className="text-muted-foreground">No content processed yet.</p>
                  <Link href="/summarizer" className="text-orange-500 hover:text-orange-600 text-sm mt-2 block">Process your first content →</Link>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-brand-orange">Recent Quiz Scores</h2>
              <Link href="/analytics" className="text-orange-500 hover:text-orange-600 text-sm">View Analytics</Link>
            </div>
            <div className="space-y-3">
              {dashboardData?.recentQuizzes?.length > 0 ? (
                dashboardData.recentQuizzes.map((quiz: any, index: number) => {
                  const percentage = Math.round((quiz.score / quiz.totalQuestions) * 100);
                  const scoreColor = percentage >= 80 ? 'text-green-400' : percentage >= 60 ? 'text-yellow-400' : 'text-red-400';
                  
                  return (
                    <div key={index} className="p-3 bg-background rounded-md border border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <ClipboardCheck className="text-muted-foreground" size={20} />
                          <span className="font-semibold text-sm">{quiz.processedContent.title}</span>
                        </div>
                        <span className={`font-bold ${scoreColor}`}>{quiz.score}/{quiz.totalQuestions}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${percentage >= 80 ? 'bg-green-400' : percentage >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs font-semibold ${scoreColor}`}>{percentage}%</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <ClipboardCheck className="mx-auto text-muted-foreground mb-2" size={48} />
                  <p className="text-muted-foreground">No quizzes completed yet.</p>
                  <p className="text-sm text-muted-foreground mt-1">Take a quiz to see your progress here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}