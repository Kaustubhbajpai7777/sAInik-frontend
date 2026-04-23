'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';

interface Content {
  title: string;
}

export default function ContentPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [content, setContent] = useState<Content | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);
  
  useEffect(() => {
    const fetchContent = async () => {
      const token = localStorage.getItem('token');
      if (!isAuthenticated) {
        console.log("Not authenticated, skipping fetch.");
        return;
      }
      if (!token) {
        console.log("No token found, skipping fetch.");
        return;
      }

      console.log(`Fetching content for ID: ${params.id}`); // <-- Log 1
      try {
        const res = await fetch(`http://localhost:8000/api/content/${params.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('Response Status:', res.status); // <-- Log 2

        if (!res.ok) {
          throw new Error('Failed to fetch content details. Status: ' + res.status);
        }

        const data = await res.json();
        console.log('Successfully parsed JSON data:', data); // <-- Log 3
        setContent(data);
      } catch (err) {
        console.error('An error occurred in fetchContent:', err); // <-- Log 4
        setError(err instanceof Error ? err.message : 'An error occurred.');
      }
    };

    if (isAuthenticated) {
      fetchContent();
    }
  }, [params.id, isAuthenticated]);

  if (isLoading || !content) {
    return <div className="flex min-h-screen items-center justify-center bg-card text-foreground">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-card text-foreground p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="text-center bg-card p-6 sm:p-8 lg:p-10 rounded-lg max-w-md sm:max-w-lg w-full mx-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Content Ready!</h1>
        <p className="text-lg sm:text-xl mb-6 sm:mb-8 break-words">"{content.title}"</p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link href={`/summary/${params.id}`} className="px-6 py-3 font-bold text-foreground bg-orange-600 rounded-md hover:bg-orange-700 touch-manipulation transition-colors">View Summary</Link>
          <Link href={`/quiz/${params.id}`} className="px-6 py-3 font-bold text-foreground bg-blue-600 rounded-md hover:bg-blue-700 touch-manipulation transition-colors">Take Quiz</Link>
        </div>
      </div>
    </div>
  );
}