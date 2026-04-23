'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Summarizer() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();

  const [uploadType, setUploadType] = useState<'pdf' | 'video'>('pdf');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [summaryLength, setSummaryLength] = useState('medium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authIsLoading, isAuthenticated, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You are not authenticated.');
      setIsProcessing(false);
      return;
    }

    // Basic validation
    if (!title.trim()) {
      setError('A title is required.');
      setIsProcessing(false);
      return;
    }
    if (uploadType === 'pdf' && !file) {
      setError('Please select a PDF file.');
      setIsProcessing(false);
      return;
    }
    if (uploadType === 'video' && !url.trim()) {
      setError('Please enter a YouTube URL.');
      setIsProcessing(false);
      return;
    }

    const formData = new FormData();
    formData.append('type', uploadType);
    formData.append('title', title);
    formData.append('summaryLength', summaryLength);
    if (uploadType === 'pdf' && file) {
      formData.append('file', file);
    } else if (uploadType === 'video') {
      formData.append('url', url);
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/content/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to process the content.');
      }

      const data = await res.json();
      // On successful processing, redirect to the new content hub page
      router.push(`/content/${data.contentId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during processing.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (authIsLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-foreground">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-orange mb-6 sm:mb-8 text-center sm:text-left">AI Summarizer & Quiz Generator</h1>
        
        <div className="bg-card p-4 sm:p-6 rounded-lg">
          <div className="flex border-b border-gray-600 mb-4">
            <button 
              onClick={() => setUploadType('pdf')} 
              className={`py-3 px-4 sm:px-6 flex-1 sm:flex-none touch-manipulation ${uploadType === 'pdf' ? 'border-b-2 border-orange-500 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Upload PDF
            </button>
            <button 
              onClick={() => setUploadType('video')} 
              className={`py-3 px-4 sm:px-6 flex-1 sm:flex-none touch-manipulation ${uploadType === 'video' ? 'border-b-2 border-orange-500 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              YouTube URL
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-bold text-gray-300">Title for your content</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g., Modern History Chapter 5" 
                required 
                className="w-full px-4 py-3 text-foreground bg-background border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 touch-manipulation" 
              />
            </div>

            {uploadType === 'pdf' ? (
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-300">Select PDF File</label>
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                  accept=".pdf" 
                  required 
                  className="w-full text-sm text-muted-foreground file:mr-2 sm:file:mr-4 file:py-2 sm:file:py-3 file:px-3 sm:file:px-4 file:rounded-md file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-orange-600 file:text-foreground hover:file:bg-orange-700 file:touch-manipulation"
                />
              </div>
            ) : (
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-300">Enter YouTube Video URL</label>
                <input 
                  type="url" 
                  value={url} 
                  onChange={(e) => setUrl(e.target.value)} 
                  placeholder="https://www.youtube.com/watch?v=..." 
                  required 
                  className="w-full px-4 py-3 text-foreground bg-background border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 touch-manipulation" 
                />
              </div>
            )}

            <div>
              <label className="block mb-2 text-sm font-bold text-gray-300">Summary Length</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 rounded-md overflow-hidden">
                <button 
                  type="button"
                  onClick={() => setSummaryLength('short')}
                  className={`py-3 px-4 text-sm font-medium transition-colors touch-manipulation ${
                    summaryLength === 'short' 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  } sm:rounded-none rounded-md`}
                >
                  Short
                </button>
                <button 
                  type="button"
                  onClick={() => setSummaryLength('medium')}
                  className={`py-3 px-4 text-sm font-medium transition-colors touch-manipulation ${
                    summaryLength === 'medium' 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  } sm:rounded-none rounded-md`}
                >
                  Medium
                </button>
                <button 
                  type="button"
                  onClick={() => setSummaryLength('detailed')}
                  className={`py-3 px-4 text-sm font-medium transition-colors touch-manipulation ${
                    summaryLength === 'detailed' 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  } sm:rounded-none rounded-md`}
                >
                  Detailed
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={isProcessing} 
              className="w-full py-3 sm:py-2 font-bold text-foreground bg-orange-600 rounded-md hover:bg-orange-700 disabled:bg-gray-500 transition duration-300 touch-manipulation"
            >
              {isProcessing ? 'Processing...' : 'Generate Summary & Quiz'}
            </button>
          </form>
        </div>

        {error && <div className="mt-6 p-4 bg-red-900 border border-red-700 text-red-200 rounded-lg">{error}</div>}
      </div>
    </div>
  );
}