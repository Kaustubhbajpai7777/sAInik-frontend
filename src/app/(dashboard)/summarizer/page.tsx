'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

export default function Summarizer() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();

  const [uploadType, setUploadType] = useState<'pdf' | 'video'>('pdf');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [summaryLength, setSummaryLength] = useState('medium');

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
    
    if (!title.trim()) return toast.error('A title is required.');
    if (uploadType === 'pdf' && !file) return toast.error('Please select a PDF file.');
    if (uploadType === 'video' && !url.trim()) return toast.error('Please enter a YouTube URL.');

    setIsProcessing(true);
    const loadingToast = toast.loading('Processing your content...');

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('You are not authenticated.');
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
      const res = await fetch('http://localhost:8000/api/content/process', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process the content.');
      }

      toast.success('Content processed successfully!', { id: loadingToast });
      router.push(`/content/${data.contentId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  if (authIsLoading) {
    return <div className="flex h-full w-full items-center justify-center bg-background text-foreground">Loading...</div>;
  }

  return (
    <div className="min-h-full bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-brand-orange mb-8">AI Summarizer & Quiz Generator</h1>
        
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex border-b mb-4">
            <button 
              onClick={() => setUploadType('pdf')} 
              className={`py-2 px-4 ${uploadType === 'pdf' ? 'border-b-2 border-brand-orange text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Upload PDF
            </button>
            <button 
              onClick={() => setUploadType('video')} 
              className={`py-2 px-4 ${uploadType === 'video' ? 'border-b-2 border-brand-orange text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              YouTube URL
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* --- UPLOAD FORM JSX RESTORED --- */}
            <div>
              <label className="block mb-2 text-sm font-bold text-muted-foreground">Title for your content</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g., Modern History Chapter 5" 
                required 
                className="w-full px-4 py-2 bg-input border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange" 
              />
            </div>

            {uploadType === 'pdf' ? (
              <div>
                <label className="block mb-2 text-sm font-bold text-muted-foreground">Select PDF File</label>
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                  accept=".pdf" 
                  required 
                  className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-orange file:text-white hover:file:opacity-90"
                />
              </div>
            ) : (
              <div>
                <label className="block mb-2 text-sm font-bold text-muted-foreground">Enter YouTube Video URL</label>
                <input 
                  type="url" 
                  value={url} 
                  onChange={(e) => setUrl(e.target.value)} 
                  placeholder="https://www.youtube.com/watch?v=..." 
                  required 
                  className="w-full px-4 py-2 bg-input border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange" 
                />
              </div>
            )}
            {/* --- END OF RESTORED JSX --- */}

            {/* --- NEW: Summary Length Selector --- */}
            <div>
              <label className="block mb-2 text-sm font-bold text-muted-foreground">Summary Length</label>
              <div className="flex gap-2 rounded-lg bg-secondary p-1">
                {(['short', 'medium', 'detailed'] as const).map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => setSummaryLength(len)}
                    className={`flex-1 capitalize rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                      summaryLength === len ? 'bg-brand-orange text-white' : 'hover:bg-muted'
                    }`}
                  >
                    {len}
                  </button>
                ))}
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={isProcessing} 
              className="w-full py-3 font-bold text-white bg-brand-orange rounded-md hover:opacity-90 disabled:bg-gray-500 transition duration-300"
            >
              {isProcessing ? 'Processing...' : 'Generate Summary & Quiz'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}