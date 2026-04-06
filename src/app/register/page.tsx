'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast.error('All fields are necessary.');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        toast.success('Registration successful! Please log in.');
        router.push('/login');
      } else {
        const data = await res.json();
        toast.error(data.error || 'User registration failed.');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-brand-orange">Register for sAInik</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-bold text-gray-300">Name</label>
            <input onChange={(e) => setName(e.target.value)} type="text" placeholder="John Doe" className="w-full px-4 py-2 text-foreground bg-background border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label className="block mb-2 text-sm font-bold text-gray-300">Email</label>
            <input onChange={(e) => setEmail(e.target.value)} type="email" placeholder="user@example.com" className="w-full px-4 py-2 text-foreground bg-background border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label className="block mb-2 text-sm font-bold text-gray-300">Password</label>
            <input onChange={(e) => setPassword(e.target.value)} type="password" placeholder="********" className="w-full px-4 py-2 text-foreground bg-background border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <button type="submit" className="w-full py-2 font-bold text-foreground bg-orange-600 rounded-md hover:bg-orange-700 transition duration-300">Register</button>
        </form>
        <div className="text-center">
          <Link href="/login" className="text-sm text-orange-400 hover:underline">Already have an account? Login</Link>
        </div>
      </div>
    </div>
  );
}