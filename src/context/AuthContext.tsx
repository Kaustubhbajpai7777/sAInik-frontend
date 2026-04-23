'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userName: string | null;
  user: { name: string | null; id: string | null };
  token: string | null;
  login: (token: string, name: string, id?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check for token and name in localStorage on initial load
    const storedToken = localStorage.getItem('token');
    const name = localStorage.getItem('userName');
    const id = localStorage.getItem('userId');
    if (storedToken && name) {
      setIsAuthenticated(true);
      setUserName(name);
      setToken(storedToken);
      setUserId(id);
    }
    setIsLoading(false);
  }, []);

  const login = (authToken: string, name: string, id?: string) => {
    localStorage.setItem('token', authToken);
    localStorage.setItem('userName', name);
    if (id) localStorage.setItem('userId', id);
    setIsAuthenticated(true);
    setUserName(name);
    setToken(authToken);
    setUserId(id || null);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setUserName(null);
    setToken(null);
    setUserId(null);
    router.push('/');
  };

  const user = {
    name: userName,
    id: userId
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, userName, user, token, login, logout }}>
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