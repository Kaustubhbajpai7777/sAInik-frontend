'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, Video } from 'lucide-react';

interface HistoryItem {
  id: number;
  title: string;
  type: string;
  createdAt: string;
}

export default function HistoryPage() {
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authIsLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem('token');
      if (!token || !isAuthenticated) return;

      try {
        setIsLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/content`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch history data.');
        const data = await res.json();
        setHistory(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated]);
  
  if (authIsLoading || isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-foreground">Loading History...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-orange mb-6 sm:mb-8 text-center sm:text-left">Your Content History</h1>
        <div className="space-y-3 sm:space-y-4">
          {history.length > 0 ? (
            history.map((item) => (
              <Link href={`/content/${item.id}`} key={item.id} className="block bg-card p-4 sm:p-6 rounded-lg hover:bg-orange-600 transition duration-300 touch-manipulation">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    {item.type === 'pdf' ? <FileText className="text-orange-400 w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" /> : <Video className="text-orange-400 w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base sm:text-lg font-bold truncate">{item.title}</h2>
                      <p className="text-xs sm:text-sm text-muted-foreground">Processed on: {new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="text-muted-foreground ml-2 flex-shrink-0">&rarr;</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-16 sm:py-20">
              <p className="text-muted-foreground text-base sm:text-lg">You haven't processed any content yet.</p>
              <Link href="/summarizer" className="mt-4 inline-block px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors touch-manipulation">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}