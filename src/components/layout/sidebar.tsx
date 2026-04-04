'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/upload', label: 'Upload CSV' },
  { href: '/branches', label: 'Branches' },
  { href: '/partners', label: 'Partners' },
  { href: '/reports', label: 'Reports' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-screen bg-zinc-900 border-r border-zinc-800 p-6">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white">GP Dashboard</h2>
        <p className="text-zinc-500 text-xs mt-1">Admin Panel</p>
      </div>
      <nav className="space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-4 py-2.5 rounded-lg text-sm transition-colors ${
              pathname === link.href
                ? 'bg-lime-500/10 text-lime-400 font-medium'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
