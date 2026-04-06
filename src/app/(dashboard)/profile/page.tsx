'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface UserProfile {
  name: string;
  email: string;
}

export default function ProfilePage() {
  const { isAuthenticated, isLoading: authIsLoading, userName, login } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(userName || '');

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authIsLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token || !isAuthenticated) return;

      try {
        setIsLoading(true);
        const res = await fetch('http://localhost:8000/api/user/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch profile data.');
        const data = await res.json();
        setProfile(data);
        setName(data.name || '');
      } catch (error) {
        toast.error("Could not load profile.");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('http://localhost:8000/api/user/profile', {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ name }),
        });
        if (!res.ok) throw new Error('Failed to update profile.');

        const updatedProfile = await res.json();
        setProfile(updatedProfile);
        // Also update the global context and localStorage
        if(token) login(token, updatedProfile.name);

        toast.success("Profile updated successfully!");
        setEditMode(false);
    } catch (error) {
        toast.error("Failed to update profile.");
    }
  };

  if (authIsLoading || isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-foreground">Loading Profile...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-brand-orange mb-8">Your Profile</h1>
        <div className="bg-card p-8 rounded-lg space-y-6">
          <div>
            <label className="text-sm text-muted-foreground">Name</label>
            {editMode ? (
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 px-4 py-2 text-foreground bg-background border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            ) : (
              <p className="text-xl">{profile?.name}</p>
            )}
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Email</label>
            <p className="text-xl text-gray-300">{profile?.email}</p>
          </div>
          <div className="pt-4">
            {editMode ? (
              <div className="flex gap-4">
                <button onClick={handleSave} className="px-6 py-2 font-bold text-foreground bg-green-600 rounded-md hover:bg-green-700">Save</button>
                <button onClick={() => setEditMode(false)} className="px-6 py-2 font-bold bg-gray-600 rounded-md hover:bg-gray-700">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setEditMode(true)} className="px-6 py-2 font-bold text-foreground bg-orange-600 rounded-md hover:bg-orange-700">Edit Profile</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}