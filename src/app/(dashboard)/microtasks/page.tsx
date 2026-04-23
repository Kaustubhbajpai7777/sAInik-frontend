'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
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
  questions: string[];
  resources: string[];
  milestone: string;
  completedAt?: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  examType: string;
  timeframe: 'daily' | 'weekly';
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'active' | 'completed' | 'paused';
  microtasks: Microtask[];
  progress: {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    averageScore: number;
  };
}

interface Analytics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  averageScore: number;
  totalTimeSpent: number;
  categoryBreakdown: Record<string, {
    total: number;
    completed: number;
    averageScore: number;
    totalTime: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function MicrotasksPage() {
  const { user, token } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'create' | 'analytics'>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create Goal Form State
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    timeframe: 'weekly' as 'daily' | 'weekly',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard'
  });

  // Fetch goals
  const fetchGoals = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/microtasks/goals', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGoals(data.goals);
      } else {
        throw new Error('Failed to fetch goals');
      }
    } catch (error) {
      console.error('Goals fetch error:', error);
      setError('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('http://localhost:8000/api/microtasks/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Analytics fetch error:', error);
    }
  };

  // Create new goal
  const createGoal = async () => {
    if (!token || !newGoal.title) return;

    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/microtasks/goals', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newGoal)
      });

      if (response.ok) {
        const data = await response.json();
        setGoals(prev => [data.goal, ...prev]);
        setNewGoal({
          title: '',
          description: '',
          timeframe: 'weekly',
          difficulty: 'medium'
        });
        setActiveTab('goals');
        alert('Goal created successfully with AI-generated microtasks!');
      } else {
        throw new Error('Failed to create goal');
      }
    } catch (error) {
      console.error('Goal creation error:', error);
      setError('Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  // Start microtask
  const startMicrotask = async (taskId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8000/api/microtasks/microtasks/${taskId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchGoals();
        alert('Microtask started!');
      }
    } catch (error) {
      console.error('Start task error:', error);
    }
  };

  // Complete microtask with AI-generated score and time
  const completeMicrotask = async (taskId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8000/api/microtasks/microtasks/${taskId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes: 'Auto-completed by AI' })
      });

      if (response.ok) {
        const data = await response.json();
        fetchGoals();
        fetchAnalytics();
        alert(`Task completed! AI generated: ${data.autoGenerated?.score}% score in ${data.autoGenerated?.timeSpent} minutes`);
      }
    } catch (error) {
      console.error('Complete task error:', error);
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
        alert('Weekly report generated and sent to your email!');
      }
    } catch (error) {
      console.error('Report generation error:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchGoals();
      fetchAnalytics();
    }
  }, [token]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Please log in to access microtasks.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Prepare chart data for analytics
  const categoryData = analytics ? Object.entries(analytics.categoryBreakdown).map(([category, data]) => ({
    category,
    completed: data.completed,
    total: data.total,
    averageScore: data.averageScore
  })) : [];

  const completionData = analytics ? [
    { name: 'Completed', value: analytics.completedTasks, color: '#00C49F' },
    { name: 'In Progress', value: analytics.inProgressTasks, color: '#FFBB28' },
    { name: 'Pending', value: analytics.pendingTasks, color: '#FF8042' }
  ] : [];

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI Microtask System
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Break down your goals into manageable microtasks with AI assistance
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'goals', label: 'My Goals' },
            { id: 'create', label: 'Create Goal' },
            { id: 'analytics', label: 'Analytics' }
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
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Goals</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{goals.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Tasks</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{analytics?.totalTasks || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Completed Tasks</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">{analytics?.completedTasks || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Average Score</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {analytics?.averageScore ? `${analytics.averageScore.toFixed(1)}%` : '0%'}
            </p>
          </div>
          
          {/* Recent Goals */}
          <div className="md:col-span-2 lg:col-span-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Goals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.slice(0, 4).map(goal => (
                <div key={goal.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">{goal.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">NDA</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(goal.difficulty)}`}>
                      {goal.difficulty}
                    </span>
                    <div className="w-16 h-16">
                      <CircularProgressbar
                        value={goal.progress?.completionRate || 0}
                        text={`${Math.round(goal.progress?.completionRate || 0)}%`}
                        styles={buildStyles({
                          textSize: '24px',
                          pathColor: '#0088FE',
                          textColor: '#666',
                        })}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          {goals.map(goal => (
            <div key={goal.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{goal.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{goal.description}</p>
                  <div className="flex gap-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(goal.difficulty)}`}>
                      {goal.difficulty}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-600">
                      NDA
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-600">
                      {goal.timeframe}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => generateWeeklyReport(goal.id)}
                    disabled={loading}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    Generate Report
                  </button>
                  <button
                    onClick={() => setSelectedGoal(selectedGoal?.id === goal.id ? null : goal)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    {selectedGoal?.id === goal.id ? 'Hide' : 'View'} Tasks
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{goal.progress?.totalTasks || 0}</p>
                  <p className="text-sm text-gray-600">Total Tasks</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{goal.progress?.completedTasks || 0}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{Math.round(goal.progress?.completionRate || 0)}%</p>
                  <p className="text-sm text-gray-600">Progress</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{(goal.progress?.averageScore || 0).toFixed(1)}%</p>
                  <p className="text-sm text-gray-600">Avg Score</p>
                </div>
              </div>

              {selectedGoal?.id === goal.id && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Microtasks</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(goal.microtasks || []).map(task => (
                      <div key={task.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium text-gray-900 dark:text-white">{task.title}</h5>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{task.description}</p>
                        <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                          <span>{task.category}</span>
                          <span>{task.timeEstimate}min</span>
                        </div>
                        
                        {task.status === 'pending' && (
                          <button
                            onClick={() => startMicrotask(task.id)}
                            className="w-full px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Start Task
                          </button>
                        )}
                        
                        {task.status === 'in-progress' && (
                          <div className="space-y-2">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-2">
                              <p className="text-sm text-blue-700 dark:text-blue-300">
                                🤖 <strong>AI Auto-Evaluation</strong><br/>
                                The system will automatically generate a realistic score and time based on task difficulty and your performance patterns.
                              </p>
                            </div>
                            <button
                              onClick={() => completeMicrotask(task.id)}
                              className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors font-medium"
                            >
                              ✅ Complete Task (AI will evaluate)
                            </button>
                          </div>
                        )}
                        
                        {task.status === 'completed' && (
                          <div className="text-center text-sm">
                            <p className="text-green-600 font-medium">Score: {task.score}%</p>
                            <p className="text-gray-500">Time: {task.timeSpent}min</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Goal Tab */}
      {activeTab === 'create' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Create New Goal with AI Assistance
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Goal Title *
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Master NDA Mathematics"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your learning goal..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  📚 This system is specifically designed for <strong>NDA (National Defence Academy)</strong> preparation. 
                  All microtasks will be tailored to NDA syllabus and requirements.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Timeframe
                  </label>
                  <select
                    value={newGoal.timeframe}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, timeframe: e.target.value as 'daily' | 'weekly' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={newGoal.difficulty}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              
              <button
                onClick={createGoal}
                disabled={loading || !newGoal.title}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Creating Goal with AI...' : 'Create Goal with AI Microtasks'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Task Completion Pie Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Task Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={completionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {completionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Performance Bar Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#00C49F" name="Completed" />
                  <Bar dataKey="total" fill="#0088FE" name="Total" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-2">
                  <CircularProgressbar
                    value={(analytics.completedTasks / analytics.totalTasks) * 100}
                    text={`${Math.round((analytics.completedTasks / analytics.totalTasks) * 100)}%`}
                    styles={buildStyles({
                      pathColor: '#00C49F',
                      textColor: '#666',
                    })}
                  />
                </div>
                <p className="text-sm text-gray-600">Overall Progress</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-2">
                  <CircularProgressbar
                    value={analytics.averageScore}
                    text={`${Math.round(analytics.averageScore)}%`}
                    styles={buildStyles({
                      pathColor: '#FFBB28',
                      textColor: '#666',
                    })}
                  />
                </div>
                <p className="text-sm text-gray-600">Average Score</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{Math.round(analytics.totalTimeSpent / 60)}h</p>
                <p className="text-sm text-gray-600">Total Study Time</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">{Object.keys(analytics.categoryBreakdown).length}</p>
                <p className="text-sm text-gray-600">Categories Studied</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}