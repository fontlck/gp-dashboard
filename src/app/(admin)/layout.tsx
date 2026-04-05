import React from 'react';
import { Sidebar } from '@/components/layout/sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <Sidebar />
      <main className="flex-1 md:ml-64 overflow-y-auto bg-gradient-to-br from-zinc-950 to-black">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
