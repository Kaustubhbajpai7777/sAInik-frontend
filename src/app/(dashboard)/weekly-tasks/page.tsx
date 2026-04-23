'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer } from 'recharts';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface Microtask {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeEstimate: number;
  status: 'pending' | 'in-progress' | 'completed';
  score?: number;
  timeSpent?: number;
  completedAt?: string;
  createdAt: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  examType: string;
  timeframe: 'daily' | 'weekly';
  microtasks: Microtask[];
  progress: {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    averageScore: number;
  };
}

interface WeeklyReport {
  id: string;
  weekStartDate: string;
  weekEndDate: string;
  tasksCompleted: number;
  totalTasks: number;
  averageScore: number;
  totalTimeSpent: number;
  strongAreas: string[];
  weakAreas: string[];
  reportText: string;
  recommendations: string[];
  emailSent: boolean;
  createdAt: string;
}

export default function WeeklyTasksPage() {
  const { user, token } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'reports'>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current week dates
  const getCurrentWeekDates = () => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    return { startOfWeek, endOfWeek };
  };

  // Fetch weekly goals
  const fetchWeeklyGoals = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/microtasks/goals?timeframe=weekly', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGoals(data.goals);
        
        if (data.goals.length > 0 && !selectedGoal) {
          setSelectedGoal(data.goals[0]);
        }
      } else {
        throw new Error('Failed to fetch goals');
      }
    } catch (error) {
      console.error('Goals fetch error:', error);
      setError('Failed to load weekly goals');
    } finally {
      setLoading(false);
    }
  };

  // Generate weekly report
  const generateWeeklyReport = async (goalId: string) => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/microtasks/reports/weekly/${goalId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWeeklyReports(prev => [data.report, ...prev]);
        alert('Weekly report generated and sent to your email!');
      } else {
        throw new Error('Failed to generate report');
      }
    } catch (error) {
      console.error('Report generation error:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  // Calculate weekly progress data
  const getWeeklyProgressData = () => {
    if (!selectedGoal) return [];

    const { startOfWeek } = getCurrentWeekDates();
    const weekData = [];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      
      const dayTasks = selectedGoal.microtasks.filter(task => {
        if (!task.completedAt) return false;
        const taskDate = new Date(task.completedAt);
        return taskDate.toDateString() === day.toDateString();
      });

      weekData.push({
        day: day.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: dayTasks.length,
        averageScore: dayTasks.length > 0 
          ? dayTasks.reduce((sum, task) => sum + (task.score || 0), 0) / dayTasks.length 
          : 0,
        timeSpent: dayTasks.reduce((sum, task) => sum + (task.timeSpent || 0), 0)
      });
    }
    
    return weekData;
  };

  // Calculate category performance
  const getCategoryPerformance = () => {
    if (!selectedGoal) return [];

    const categoryData: Record<string, { completed: number; total: number; averageScore: number; totalTime: number }> = {};
    
    selectedGoal.microtasks.forEach(task => {
      if (!categoryData[task.category]) {
        categoryData[task.category] = { completed: 0, total: 0, averageScore: 0, totalTime: 0 };
      }
      
      categoryData[task.category].total++;
      if (task.status === 'completed') {
        categoryData[task.category].completed++;
        categoryData[task.category].averageScore += task.score || 0;
        categoryData[task.category].totalTime += task.timeSpent || 0;
      }
    });

    return Object.entries(categoryData).map(([category, data]) => ({
      category,
      completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0,
      averageScore: data.completed > 0 ? data.averageScore / data.completed : 0,
      totalTime: data.totalTime,
      completed: data.completed,
      total: data.total
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  useEffect(() => {
    if (token) {
      fetchWeeklyGoals();
    }
  }, [token]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Please log in to access weekly tasks.</p>
      </div>
    );
  }

  const weeklyProgressData = getWeeklyProgressData();
  const categoryPerformance = getCategoryPerformance();
  const { startOfWeek, endOfWeek } = getCurrentWeekDates();

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Weekly Microtasks
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Week of {startOfWeek.toLocaleDateString()} - {endOfWeek.toLocaleDateString()}
          </p>
        </div>
        
        {selectedGoal && (
          <div className="flex items-center gap-4">
            <select
              value={selectedGoal.id}
              onChange={(e) => {
                const goal = goals.find(g => g.id === e.target.value);
                if (goal) setSelectedGoal(goal);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {goals.map(goal => (
                <option key={goal.id} value={goal.id}>
                  {goal.title}
                </option>
              ))}
            </select>
            <button
              onClick={() => generateWeeklyReport(selectedGoal.id)}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
            >
              Generate Report
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Week Overview' },
            { id: 'goals', label: 'Weekly Goals' },
            { id: 'reports', label: 'Reports' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && selectedGoal && (
        <div className="space-y-6">
          {/* Weekly Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
              <div className="w-20 h-20 mx-auto mb-4">
                <CircularProgressbar
                  value={selectedGoal.progress.completionRate}
                  text={`${Math.round(selectedGoal.progress.completionRate)}%`}
                  styles={buildStyles({
                    pathColor: '#0088FE',
                    textColor: '#666',
                    textSize: '24px',
                  })}
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Week Progress</h3>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
              <p className="text-3xl font-bold text-green-600">{selectedGoal.progress.completedTasks}</p>
              <p className="text-gray-600 dark:text-gray-400">Tasks Completed</p>
              <p className="text-sm text-gray-500">of {selectedGoal.progress.totalTasks} total</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
              <p className="text-3xl font-bold text-orange-600">
                {Math.round(selectedGoal.progress.averageScore)}%
              </p>
              <p className="text-gray-600 dark:text-gray-400">Average Score</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
              <p className="text-3xl font-bold text-purple-600">
                {Math.round(selectedGoal.microtasks.reduce((sum, task) => sum + (task.timeSpent || 0), 0) / 60)}h
              </p>
              <p className="text-gray-600 dark:text-gray-400">Time Invested</p>
            </div>
          </div>

          {/* Daily Progress Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Progress This Week</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="completed" stroke="#0088FE" name="Tasks Completed" />
                <Line type="monotone" dataKey="averageScore" stroke="#00C49F" name="Average Score %" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Performance */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completionRate" fill="#0088FE" name="Completion Rate %" />
                <Bar dataKey="averageScore" fill="#00C49F" name="Average Score %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          {goals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">No weekly goals found. Create a goal with weekly timeframe to get started!</p>
            </div>
          ) : (
            goals.map(goal => (
              <div key={goal.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{goal.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{goal.description}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-600">
                        {goal.examType}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-600">
                        Weekly Goal
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-16 h-16">
                      <CircularProgressbar
                        value={goal.progress.completionRate}
                        text={`${Math.round(goal.progress.completionRate)}%`}
                        styles={buildStyles({
                          textSize: '24px',
                          pathColor: '#0088FE',
                          textColor: '#666',
                        })}
                      />
                    </div>
                  </div>
                </div>

                {/* Goal Progress Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{goal.progress.totalTasks}</p>
                    <p className="text-sm text-gray-600">Total Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{goal.progress.completedTasks}</p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{Math.round(goal.progress.averageScore)}%</p>
                    <p className="text-sm text-gray-600">Avg Score</p>
                  </div>
                </div>

                {/* Recent Tasks */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Recent Tasks</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {goal.microtasks.slice(0, 6).map(task => (
                      <div key={task.id} className="border border-gray-200 dark:border-gray-700 rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {task.title}
                          </h5>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}>
                            {task.status === 'pending' ? 'To Do' : task.status === 'in-progress' ? 'In Progress' : 'Done'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>{task.category}</span>
                          {task.status === 'completed' && task.score && (
                            <span className="text-green-600 font-medium">{task.score}%</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {goal.microtasks.length > 6 && (
                    <button 
                      onClick={() => setSelectedGoal(goal)}
                      className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                    >
                      View all {goal.microtasks.length} tasks →
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {weeklyReports.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">No weekly reports generated yet. Generate your first report above!</p>
            </div>
          ) : (
            weeklyReports.map(report => (
              <div key={report.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Weekly Report
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {new Date(report.weekStartDate).toLocaleDateString()} - {new Date(report.weekEndDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {report.emailSent ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        ✓ Email Sent
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        Email Pending
                      </span>
                    )}
                  </div>
                </div>

                {/* Report Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-xl font-bold text-blue-600">{report.tasksCompleted}</p>
                    <p className="text-xs text-gray-600">Tasks Done</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-green-600">{Math.round(report.averageScore)}%</p>
                    <p className="text-xs text-gray-600">Avg Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-purple-600">{Math.round(report.totalTimeSpent / 60)}h</p>
                    <p className="text-xs text-gray-600">Time Spent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-orange-600">
                      {Math.round((report.tasksCompleted / report.totalTasks) * 100)}%
                    </p>
                    <p className="text-xs text-gray-600">Completion</p>
                  </div>
                </div>

                {/* Report Content */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">AI Analysis</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{report.reportText}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h5 className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">Strong Areas</h5>
                      <ul className="text-sm text-gray-600 dark:text-gray-400">
                        {report.strongAreas.map((area, index) => (
                          <li key={index} className="flex items-center gap-1">
                            <span className="text-green-500">✓</span>
                            {area}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">Areas to Improve</h5>
                      <ul className="text-sm text-gray-600 dark:text-gray-400">
                        {report.weakAreas.map((area, index) => (
                          <li key={index} className="flex items-center gap-1">
                            <span className="text-red-500">→</span>
                            {area}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">Recommendations</h5>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {report.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}