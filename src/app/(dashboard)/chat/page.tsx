'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

// For now, we'll use a static list of rooms.
const studyRooms = [
  { id: 'mathematics', name: 'Mathematics' },
  { id: 'history', name: 'History & G.K.' },
  { id: 'physics', name: 'Physics' },
  { id: 'chemistry', name: 'Chemistry' },
];

export default function ChatLobby() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-foreground">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-brand-orange mb-8">Join a Study Room</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {studyRooms.map((room) => (
            <Link 
              href={`/chat/${room.id}`} 
              key={room.id}
              className="block p-6 bg-card rounded-lg hover:bg-orange-600 transition duration-300"
            >
              <h2 className="text-2xl font-bold">{room.name}</h2>
              <p className="text-muted-foreground mt-2">Click to join the real-time chat</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}