'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  BarChart3,
  Upload,
  GitBranch,
  Users,
  FileText,
  LogOut,
  Menu,
  X,
  Settings,
  ChevronDown,
  Home,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const isAdmin = session?.user?.role === 'ADMIN';

  const adminNavItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <Home className="w-5 h-5" />,
    },
    {
      label: 'Reports',
      href: '/reports',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      label: 'Upload',
      href: '/upload',
      icon: <Upload className="w-5 h-5" />,
    },
    {
      label: 'Branches',
      href: '/branches',
      icon: <GitBranch className="w-5 h-5" />,
    },
    {
      label: 'Partners',
      href: '/partners',
      icon: <Users className="w-5 h-5" />,
    },
  ];

  const partnerNavItems: NavItem[] = [
    {
      label: 'Portal',
      href: '/portal',
      icon: <Home className="w-5 h-5" />,
    },
    {
      label: 'Reports',
      href: '/reports',
      icon: <FileText className="w-5 h-5" />,
    },
  ];

  const navItems = isAdmin ? adminNavItems : partnerNavItems;

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-purple rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">GP</span>
          </div>
          <span className="text-white font-semibold hidden sm:inline">Dashboard</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden text-zinc-400 hover:text-zinc-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-smooth ${
              isActive(item.href)
                ? 'bg-gradient-purple text-white shadow-lg'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
            }`}
          >
            {item.icon}
            <span className="text-sm font-medium">{item.label}</span>
            {item.badge && (
              <span className="ml-auto text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Divider */}
      <div className="px-3 py-4 border-t border-zinc-800">
        {/* Settings */}
        <Link
          href="/settings"
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-smooth mb-2"
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Settings</span>
        </Link>

        {/* User Profile */}
        <div className="glass-light rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-purple flex items-center justify-center text-white text-sm font-semibold">
              {session?.user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {session?.user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-zinc-500 truncate">
                {session?.user?.role || 'Partner'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 hover:text-white transition-smooth text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 hover:bg-zinc-800 rounded-lg text-zinc-100"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-zinc-950 border-r border-zinc-800 fixed left-0 top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen bg-zinc-950 border-r border-zinc-800 transform transition-transform md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
