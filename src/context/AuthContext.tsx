'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userName: string | null; // <-- ADD THIS
  login: (token: string, name: string) => void; // <-- UPDATE THIS
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null); // <-- ADD THIS
  const router = useRouter();

  useEffect(() => {
    // Check for token and name in localStorage on initial load
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('userName');
    if (token && name) {
      setIsAuthenticated(true);
      setUserName(name);
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, name: string) => { // <-- UPDATE THIS
    localStorage.setItem('token', token);
    localStorage.setItem('userName', name); // <-- ADD THIS
    setIsAuthenticated(true);
    setUserName(name); // <-- ADD THIS
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName'); // <-- ADD THIS
    setIsAuthenticated(false);
    setUserName(null); // <-- ADD THIS
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, userName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}