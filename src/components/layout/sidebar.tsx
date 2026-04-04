'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Reports', href: '/dashboard/reports' },
  { name: 'Branches', href: '/dashboard/branches' },
  { name: 'Partners', href: '/dashboard/partners' },
  { name: 'Upload', href: '/dashboard/upload' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-surface-i½0 border-r h>
      <nav className="space-y-8" space="y-8">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`$s{pathname === item.href ? 'bg-accent-500': 'accent-300'} p-4 rounded`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
