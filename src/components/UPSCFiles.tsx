'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  ExternalLink, 
  RefreshCw, 
  Search, 
  Calendar,
  AlertCircle,
  Sparkles,
  Clock,
  Filter,
  X,
  CalendarDays,
  Shield,
  Star,
  TrendingUp
} from 'lucide-react';

interface UPSCNotification {
  id: string;
  title: string;
  url: string;
  date: string;
  type: 'PDF' | 'Link';
  source: string;
  scrapedAt: string;
  aiInsight?: string;
  category?: 'Calendar' | 'NDA/NA' | 'General';
  priority?: number;
  pageType?: string;
}

interface CalendarData {
  calendarFiles: UPSCNotification[];
  aiAnalysis: any;
  lastAnalyzed: string;
  summary: string;
}

interface NDAData {
  ndaFiles: UPSCNotification[];
  aiAnalysis: string;
  lastAnalyzed: string;
  summary: string;
}

interface UPSCFilesProps {
  onClose?: () => void;
}

const UPSCFiles: React.FC<UPSCFilesProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<UPSCNotification[]>([]);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [ndaData, setNDAData] = useState<NDAData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'PDF' | 'Link'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'Calendar' | 'NDA/NA' | 'General'>('all');
  const [aiInsight, setAiInsight] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'calendar' | 'nda'>('all');

  useEffect(() => {
    fetchNotifications();
    fetchAIInsights();
    fetchCalendarData();
    fetchNDAData();
  }, []);

  const fetchNotifications = async (forceRefresh = false) => {
    try {
      setLoading(!forceRefresh);
      setRefreshing(forceRefresh);
      setError('');

      const endpoint = forceRefresh 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/upsc/refresh`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/upsc/notifications`;

      const method = forceRefresh ? 'POST' : 'GET';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setNotifications(data.data || []);
        setLastUpdated(data.lastUpdated || new Date().toISOString());
      } else {
        throw new Error(data.message || 'Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching UPSC notifications:', error);
      setError('Failed to load UPSC notifications. Please try again.');
      
      // Set fallback data
      setNotifications([
        {
          id: 'fallback_1',
          title: 'UPSC NDA & NA Examination (I) 2025 - Official Notification',
          url: 'https://upsc.gov.in/sites/default/files/Notific-NDA-NA-I-2025-Engl-11122024F.pdf',
          date: 'December 2024',
          type: 'PDF',
          source: 'UPSC Official',
          scrapedAt: new Date().toISOString(),
          aiInsight: 'This is the official NDA & NA Examination notification. Make sure to check eligibility and important dates.'
        }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAIInsights = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/upsc/ai-insights`);
      const data = await response.json();
      
      if (data.success) {
        setAiInsight(data.insight);
      }
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      setAiInsight('Stay updated with the latest UPSC notifications and prepare consistently for your NDA/NA examination.');
    }
  };

  const fetchCalendarData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/upsc/calendar`);
      const data = await response.json();
      
      if (data.success) {
        setCalendarData(data.data);
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    }
  };

  const fetchNDAData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/upsc/nda-notifications`);
      const data = await response.json();
      
      if (data.success) {
        setNDAData(data.data);
      }
    } catch (error) {
      console.error('Error fetching NDA data:', error);
    }
  };

  const handleDownload = async (notification: UPSCNotification) => {
    try {
      if (notification.type === 'PDF') {
        // Open PDF in a new tab for download
        window.open(notification.url, '_blank');
      } else {
        // Open link in new tab
        window.open(notification.url, '_blank');
      }
    } catch (error) {
      console.error('Download error:', error);
      // Fallback: just open the URL
      window.open(notification.url, '_blank');
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchNotifications();
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/upsc/search/${encodeURIComponent(searchTerm)}`
      );
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.data || []);
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filterType === 'all' || notification.type === filterType;
    const matchesCategory = categoryFilter === 'all' || notification.category === categoryFilter;
    const matchesSearch = !searchTerm || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesCategory && matchesSearch;
  });

  const getDisplayNotifications = () => {
    switch (activeTab) {
      case 'calendar':
        return calendarData?.calendarFiles || [];
      case 'nda':
        return ndaData?.ndaFiles || [];
      default:
        return filteredNotifications;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="min-h-full bg-background text-foreground p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RefreshCw className="animate-spin mx-auto mb-4 text-brand-orange" size={48} />
              <p className="text-lg">Loading UPSC Notifications...</p>
              <p className="text-sm text-muted-foreground mt-2">Fetching latest updates from UPSC website</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-brand-orange flex items-center gap-2">
              <FileText size={32} />
              UPSC Notification Center
            </h1>
            <p className="text-muted-foreground mt-1">
              Latest calendars, NDA/NA updates, and notifications with AI insights
            </p>
            {lastUpdated && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Clock size={12} />
                Last updated: {formatDate(lastUpdated)}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                fetchNotifications(true);
                fetchCalendarData();
                fetchNDAData();
              }}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-brand-orange hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh All'}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <X size={16} />
                Close
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 bg-card rounded-lg border p-1">
          <div className="flex">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'all' 
                  ? 'bg-brand-orange text-white' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText size={16} />
              All Notifications ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'calendar' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <CalendarDays size={16} />
              Calendar ({calendarData?.calendarFiles.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('nda')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'nda' 
                  ? 'bg-green-600 text-white' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Shield size={16} />
              NDA/NA ({ndaData?.ndaFiles.length || 0})
            </button>
          </div>
        </div>

        {/* AI Insights Section */}
        {aiInsight && (
          <div className="mb-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="text-purple-400 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-purple-300 mb-2">AI Insights for NDA Aspirants</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{aiInsight}</p>
              </div>
            </div>
          </div>
        )}

        {/* Calendar Analysis Section */}
        {activeTab === 'calendar' && calendarData?.aiAnalysis && (
          <div className="mb-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CalendarDays className="text-blue-400 flex-shrink-0 mt-1" size={20} />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-300 mb-2">📅 Calendar Analysis & Key Dates</h3>
                {calendarData.aiAnalysis.keyDates && calendarData.aiAnalysis.keyDates.length > 0 && (
                  <div className="mb-3">
                    <h4 className="font-medium text-sm mb-2">🎯 Important Exam Dates:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {calendarData.aiAnalysis.keyDates.slice(0, 4).map((date: any, index: number) => (
                        <div key={index} className="bg-blue-500/10 rounded p-2 text-xs">
                          <span className="font-medium">{date.exam}</span>
                          <br />
                          <span className="text-muted-foreground">{date.date} - {date.phase}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {calendarData.aiAnalysis.preparationAdvice || calendarData.aiAnalysis}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* NDA Analysis Section */}
        {activeTab === 'nda' && ndaData?.aiAnalysis && (
          <div className="mb-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="text-green-400 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-green-300 mb-2">🎖️ NDA/NA Strategic Analysis</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{ndaData.aiAnalysis}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-400" size={20} />
              <p className="text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Search and Filter Controls */}
        {activeTab === 'all' && (
          <div className="mb-6 bg-card rounded-lg border p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as 'all' | 'Calendar' | 'NDA/NA' | 'General')}
                  className="px-3 py-2 bg-background border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-orange"
                >
                  <option value="all">All Categories</option>
                  <option value="Calendar">📅 Calendar</option>
                  <option value="NDA/NA">🎖️ NDA/NA</option>
                  <option value="General">📋 General</option>
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as 'all' | 'PDF' | 'Link')}
                  className="px-3 py-2 bg-background border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-orange"
                >
                  <option value="all">All Types</option>
                  <option value="PDF">PDF Files</option>
                  <option value="Link">Web Links</option>
                </select>
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-brand-orange hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Search size={16} />
                  Search
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Grid */}
        <div className="grid gap-4">
          {getDisplayNotifications().length > 0 ? (
            getDisplayNotifications().map((notification) => (
              <div key={notification.id} className="bg-card border rounded-lg p-4 hover:bg-card/80 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      {notification.type === 'PDF' ? (
                        <FileText className="text-red-400 flex-shrink-0 mt-1" size={20} />
                      ) : (
                        <ExternalLink className="text-blue-400 flex-shrink-0 mt-1" size={20} />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1 leading-tight">
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {notification.date}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            notification.type === 'PDF' 
                              ? 'bg-red-500/20 text-red-300' 
                              : 'bg-blue-500/20 text-blue-300'
                          }`}>
                            {notification.type}
                          </span>
                          {notification.category && (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              notification.category === 'Calendar' 
                                ? 'bg-blue-500/20 text-blue-300' 
                                : notification.category === 'NDA/NA'
                                ? 'bg-green-500/20 text-green-300'
                                : 'bg-gray-500/20 text-gray-300'
                            }`}>
                              {notification.category === 'Calendar' ? '📅' : notification.category === 'NDA/NA' ? '🎖️' : '📋'} {notification.category}
                            </span>
                          )}
                          {notification.priority && notification.priority > 50 && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-500/20 text-yellow-300 flex items-center gap-1">
                              <Star size={10} />
                              Priority
                            </span>
                          )}
                          <span className="text-xs">{notification.source}</span>
                        </div>
                        {notification.aiInsight && (
                          <div className="mt-2 p-2 bg-purple-500/10 border border-purple-500/20 rounded text-xs text-muted-foreground">
                            <Sparkles size={12} className="inline mr-1 text-purple-400" />
                            {notification.aiInsight}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(notification)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-orange hover:bg-orange-700 text-white rounded-lg transition-colors text-sm font-medium flex-shrink-0"
                  >
                    {notification.type === 'PDF' ? (
                      <>
                        <Download size={16} />
                        Download
                      </>
                    ) : (
                      <>
                        <ExternalLink size={16} />
                        Open
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              {activeTab === 'calendar' ? (
                <CalendarDays className="mx-auto text-muted-foreground mb-4" size={64} />
              ) : activeTab === 'nda' ? (
                <Shield className="mx-auto text-muted-foreground mb-4" size={64} />
              ) : (
                <FileText className="mx-auto text-muted-foreground mb-4" size={64} />
              )}
              <h3 className="text-xl font-semibold mb-2">
                {activeTab === 'calendar' 
                  ? 'No calendar files found' 
                  : activeTab === 'nda' 
                  ? 'No NDA/NA notifications found'
                  : 'No notifications found'
                }
              </h3>
              <p className="text-muted-foreground mb-4">
                {activeTab === 'calendar' 
                  ? 'Calendar files will appear here when available from UPSC' 
                  : activeTab === 'nda'
                  ? 'NDA/NA specific notifications will be displayed here'
                  : searchTerm || filterType !== 'all' || categoryFilter !== 'all'
                  ? 'Try adjusting your search terms or filters' 
                  : 'No UPSC notifications available at the moment'
                }
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setCategoryFilter('all');
                  fetchNotifications(true);
                  if (activeTab === 'calendar') fetchCalendarData();
                  if (activeTab === 'nda') fetchNDAData();
                }}
                className="px-4 py-2 bg-brand-orange hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                Reset and Refresh
              </button>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Data sourced from official UPSC website (upsc.gov.in) • 
            Updates every 30 minutes • 
            For official information, always verify from UPSC website
          </p>
        </div>
      </div>
    </div>
  );
};

export default UPSCFiles;