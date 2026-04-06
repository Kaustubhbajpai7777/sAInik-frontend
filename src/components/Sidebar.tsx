'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from './ThemeToggle';

// Define the navigation links (hardcoded in English is correct for now)
const navLinks = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'AI Summarizer', href: '/summarizer' },
  { name: 'Study Rooms', href: '/chat' },
  { name: 'My Analytics', href: '/analytics' },
  { name: 'Content History', href: '/history' },
  { name: 'Profile', href: '/profile' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="flex flex-col h-full bg-card text-card-foreground border-r">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold text-brand-orange">sAInik</h1>
      </div>
      <nav className="flex-grow p-4">
        <ul>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.name} className="mb-2">
                <Link 
                  href={link.href}
                  className={`block px-4 py-2 rounded-md transition duration-200 ${
                    isActive 
                      ? 'bg-brand-orange text-white' // Use brand color for active link
                      : 'hover:bg-secondary' // Use theme-aware hover color
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {/* 3. Add the ThemeToggle and organize the bottom section */}
      <div className="p-4 border-t flex justify-between items-center">
        <ThemeToggle />
        <button
          onClick={logout}
          className="px-4 py-2 font-bold text-white bg-red-600 rounded-md hover:bg-red-700 transition duration-300"
        >
          Logout
        </button>
      </div>
    </div>
  );
}