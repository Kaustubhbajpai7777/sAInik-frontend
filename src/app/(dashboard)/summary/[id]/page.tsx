'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Content {
  title: string;
  summary: string;
}


export default function SummaryPage() { // <-- Remove params from here
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const params = useParams(); // <-- Get params using the hook
  const contentId = params.id as string;

  const [content, setContent] = useState<Content | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authIsLoading, isAuthenticated, router]);
  
  useEffect(() => {
    const fetchContent = async () => {
      const token = localStorage.getItem('token');
      if (!token || !isAuthenticated) return;

      try {
        const res = await fetch(`http://localhost:8000/api/content/${params.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch summary.');
        const data = await res.json();
        setContent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred.');
      }
    };

    if (isAuthenticated) {
      fetchContent();
    }
  }, [params.id, isAuthenticated]);

  if (authIsLoading || !content) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-foreground">Loading Summary...</div>;
  }
  
  if (error) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-red-400">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <Link href={`/content/${params.id}`} className="text-orange-400 hover:underline mb-8 inline-block">&larr; Back to Content Hub</Link>
        <div className="bg-card p-8 rounded-lg">
          <h1 className="text-3xl font-bold mb-2 text-brand-orange">{content.title}</h1>
          <h2 className="text-xl font-semibold mb-6 text-gray-300">AI-Generated Summary</h2>
          <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap">
            {content.summary}
          </div>
        </div>
      </div>
    </div>
  );
}