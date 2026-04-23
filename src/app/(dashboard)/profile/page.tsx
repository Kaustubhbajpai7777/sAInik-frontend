'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface UserProfile {
  name: string;
  email: string;
  languagePreference: string;
}

interface UserStats {
  totalQuizzes: number;
  averageScore: number;
  totalContent: number;
  completedTasks: number;
  totalGoals: number;
  totalTimeSpent: number;
  recentActivity: {
    quizzes: Array<{
      id: number;
      score: number;
      totalQuestions: number;
      completedAt: string;
      processedContent: { title: string };
    }>;
    content: Array<{
      id: number;
      title: string;
      type: string;
      createdAt: string;
    }>;
  };
}

export default function ProfilePage() {
  const { isAuthenticated, isLoading: authIsLoading, userName, login } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(userName || '');
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'settings'>('overview');

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authIsLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem('token');
      if (!token || !isAuthenticated) return;

      try {
        setIsLoading(true);
        
        // Fetch profile data
        const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/user/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!profileRes.ok) throw new Error('Failed to fetch profile data.');
        const profileData = await profileRes.json();
        setProfile(profileData);
        setName(profileData.name || '');

        // Fetch user statistics
        const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/user/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error("Could not load profile data.");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchProfileData();
    }
  }, [isAuthenticated]);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/user/profile`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ name }),
        });
        if (!res.ok) throw new Error('Failed to update profile.');

        const updatedProfile = await res.json();
        setProfile(updatedProfile);
        if(token) login(token, updatedProfile.name);

        toast.success("Profile updated successfully!");
        setEditMode(false);
    } catch (error) {
        console.error('Error updating profile:', error);
        toast.error("Failed to update profile.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (authIsLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold flex-shrink-0">
              {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="text-center sm:text-left flex-1 w-full">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                {editMode ? (
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full max-w-md bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-center sm:text-left"
                    placeholder="Enter your name"
                  />
                ) : (
                  profile?.name || 'Anonymous User'
                )}
              </h1>
              <p className="text-gray-400 text-base sm:text-lg break-all">{profile?.email}</p>
              <div className="flex items-center justify-center sm:justify-start space-x-2 sm:space-x-4 mt-2">
                {editMode ? (
                  <div className="flex space-x-2">
                    <button 
                      onClick={handleSave} 
                      className="px-4 py-2 sm:py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors touch-manipulation"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => { setEditMode(false); setName(profile?.name || ''); }} 
                      className="px-4 py-2 sm:py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm font-medium transition-colors touch-manipulation"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setEditMode(true)} 
                    className="px-4 py-2 sm:py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-sm font-medium transition-colors touch-manipulation"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg w-full sm:w-fit overflow-x-auto">
            {[{ id: 'overview', label: 'Overview' }, { id: 'activity', label: 'Activity' }, { id: 'settings', label: 'Settings' }].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 sm:px-6 py-3 sm:py-2 rounded-md text-sm font-medium transition-colors touch-manipulation flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-gray-800 p-4 sm:p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-xs sm:text-sm">Quiz Attempts</p>
                      <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalQuizzes}</p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 p-4 sm:p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-xs sm:text-sm">Average Score</p>
                      <p className="text-xl sm:text-2xl font-bold text-white">{stats.averageScore ? `${Math.round(stats.averageScore)}%` : 'N/A'}</p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 p-4 sm:p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-xs sm:text-sm">Content Processed</p>
                      <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalContent}</p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 p-4 sm:p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-xs sm:text-sm">Time Spent</p>
                      <p className="text-xl sm:text-2xl font-bold text-white">{formatTime(stats.totalTimeSpent || 0)}</p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Achievement Badge */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 sm:p-6 rounded-lg">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">NDA Achiever</h3>
                  <p className="text-orange-100 text-sm sm:text-base">Keep up the excellent work! You're on track for success.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-4 sm:space-y-6">
            {stats?.recentActivity && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Recent Quizzes */}
                <div className="bg-gray-800 p-4 sm:p-6 rounded-lg">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Recent Quizzes
                  </h3>
                  <div className="space-y-3">
                    {stats.recentActivity.quizzes.length > 0 ? (
                      stats.recentActivity.quizzes.map((quiz) => (
                        <div key={quiz.id} className="bg-gray-700 p-3 sm:p-4 rounded-lg">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 space-y-1 sm:space-y-0">
                            <h4 className="text-white font-medium text-sm sm:text-base truncate pr-2">{quiz.processedContent.title}</h4>
                            <span className={`px-2 py-1 text-xs rounded self-start flex-shrink-0 ${
                              (quiz.score / quiz.totalQuestions) * 100 >= 70 
                                ? 'bg-green-500/20 text-green-400' 
                                : (quiz.score / quiz.totalQuestions) * 100 >= 50 
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {Math.round((quiz.score / quiz.totalQuestions) * 100)}%
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm text-gray-400 space-y-1 sm:space-y-0">
                            <span>{quiz.score}/{quiz.totalQuestions} correct</span>
                            <span>{formatDate(quiz.completedAt)}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-center py-8">No quizzes completed yet</p>
                    )}
                  </div>
                </div>

                {/* Recent Content */}
                <div className="bg-gray-800 p-4 sm:p-6 rounded-lg">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Recent Content
                  </h3>
                  <div className="space-y-3">
                    {stats.recentActivity.content.length > 0 ? (
                      stats.recentActivity.content.map((content) => (
                        <div key={content.id} className="bg-gray-700 p-3 sm:p-4 rounded-lg">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 space-y-1 sm:space-y-0">
                            <h4 className="text-white font-medium text-sm sm:text-base truncate pr-2">{content.title}</h4>
                            <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded self-start flex-shrink-0">
                              {content.type.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-400">{formatDate(content.createdAt)}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-center py-8">No content processed yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl">
            <div className="bg-gray-800 p-4 sm:p-6 rounded-lg space-y-4 sm:space-y-6">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Account Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 touch-manipulation"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                  <input 
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full px-4 py-3 bg-gray-600 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed touch-manipulation"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Language Preference</label>
                  <select 
                    value={profile?.languagePreference || 'en'}
                    disabled
                    className="w-full px-4 py-3 bg-gray-600 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed touch-manipulation"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Language preferences coming soon</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <button 
                  onClick={handleSave}
                  className="w-full sm:w-auto px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors touch-manipulation"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}