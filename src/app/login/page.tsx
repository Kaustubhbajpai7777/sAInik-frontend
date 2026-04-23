'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import { toast } from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Login successful!');
        login(data.token, data.name);
        router.push('/dashboard');
      } else {
        toast.error(data.error || 'Login failed.');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <AuthGuard requireAuth={false}>
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#1a202c] text-foreground px-4 py-8">
        <div className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-card rounded-lg shadow-md">
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-brand-orange">Login to sAInik</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-bold text-gray-300">Email</label>
              <input 
                onChange={(e) => setEmail(e.target.value)} 
                type="email" 
                placeholder="user@example.com" 
                className="w-full px-4 py-3 sm:py-2 text-foreground bg-background border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-base" 
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-bold text-gray-300">Password</label>
              <input 
                onChange={(e) => setPassword(e.target.value)} 
                type="password" 
                placeholder="********" 
                className="w-full px-4 py-3 sm:py-2 text-foreground bg-background border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-base" 
                required
              />
            </div>
            <button type="submit" className="w-full py-3 sm:py-2 font-bold text-foreground bg-orange-600 rounded-md hover:bg-orange-700 transition duration-300 touch-manipulation">
              Login
            </button>
          </form>
          <div className="text-center">
            <Link href="/register" className="text-sm text-orange-400 hover:underline">
              Don't have an account? Register
            </Link>
          </div>
          <div className="text-center">
            <Link href="/" className="text-sm text-gray-400 hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}