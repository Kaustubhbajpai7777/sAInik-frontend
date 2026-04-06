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
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-brand-orange mb-8">Your Content History</h1>
        <div className="space-y-4">
          {history.length > 0 ? (
            history.map((item) => (
              <Link href={`/content/${item.id}`} key={item.id} className="block bg-card p-4 rounded-lg hover:bg-orange-600 transition duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {item.type === 'pdf' ? <FileText className="text-orange-400" /> : <Video className="text-orange-400" />}
                    <div>
                      <h2 className="text-lg font-bold">{item.title}</h2>
                      <p className="text-sm text-muted-foreground">Processed on: {new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="text-muted-foreground">&rarr;</span>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-10">You haven't processed any content yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}