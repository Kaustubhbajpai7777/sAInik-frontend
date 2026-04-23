'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from './ThemeToggle';

// Define the navigation links with icons for better mobile UX
const navLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
  { name: 'AI Summarizer', href: '/summarizer', icon: '🤖' },
  { name: 'Study Rooms', href: '/chat', icon: '💬' },
  { name: 'UPSC Notifications', href: '/upsc-files', icon: '📋' },
  { name: 'Microtasks', href: '/microtasks', icon: '⚡' },
  { name: 'Daily Tasks', href: '/daily-tasks', icon: '📅' },
  { name: 'Weekly Tasks', href: '/weekly-tasks', icon: '📊' },
  { name: 'My Analytics', href: '/analytics', icon: '📈' },
  { name: 'Content History', href: '/history', icon: '📚' },
  { name: 'Profile', href: '/profile', icon: '👤' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, userName } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header with Hamburger Menu */}
      <div className="lg:hidden bg-card border-b border-gray-700 px-4 py-3 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-bold text-brand-orange">sAInik</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-300 hidden sm:block">Hi, {userName}</span>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md hover:bg-gray-700 transition-colors touch-manipulation"
            aria-label="Toggle menu"
          >
            <div className="space-y-1">
              <span className={`block w-5 h-0.5 bg-current transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
              <span className={`block w-5 h-0.5 bg-current transition-opacity duration-200 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-5 h-0.5 bg-current transition-transform duration-200 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar - Desktop & Mobile Drawer */}
      <div className={`
        fixed lg:fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
        lg:transform-none lg:transition-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col h-screen bg-card text-card-foreground border-r border-gray-700
      `}>
        {/* Desktop Header */}
        <div className="hidden lg:block p-4 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-brand-orange">sAInik</h1>
          <p className="text-sm text-gray-400 mt-1">Welcome, {userName}</p>
        </div>

        {/* Mobile Header in Drawer */}
        <div className="lg:hidden p-4 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-brand-orange">sAInik</h1>
            <p className="text-sm text-gray-400">Welcome, {userName}</p>
          </div>
          <button
            onClick={closeMobileMenu}
            className="p-2 rounded-md hover:bg-gray-700 transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-grow p-3 lg:p-4 overflow-y-auto">
          <ul className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 px-3 py-3 lg:py-2 rounded-md transition duration-200 touch-manipulation ${
                      isActive 
                        ? 'bg-brand-orange text-white shadow-md' 
                        : 'hover:bg-gray-700 text-gray-300 hover:text-white'
                    }`}
                  >
                    <span className="text-lg lg:text-base">{link.icon}</span>
                    <span className="text-sm lg:text-base font-medium">{link.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Section - Always visible */}
        <div className="mt-auto p-3 lg:p-4 border-t border-gray-700 space-y-3 bg-card">
          <div className="flex justify-center items-center">
            <ThemeToggle />
          </div>
          <button
            onClick={() => {
              logout();
              closeMobileMenu();
            }}
            className="w-full px-4 py-3 lg:py-2 font-bold text-white bg-red-600 rounded-md hover:bg-red-700 transition duration-300 touch-manipulation text-sm lg:text-base"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
}