'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Daily', href: '/dashboard', emoji: '🏠' },
  { label: 'Logbook', href: '/flights', emoji: '📖' },
  { label: 'Currency', href: '/currency', emoji: '🔄' },
  { label: 'Mastery', href: '/journey', emoji: '🏆' },
  { label: 'Ready', href: '/progress', emoji: '🎯' },
  { label: 'Costs', href: '/money', emoji: '💰' },
  { label: 'Documents', href: '/documents', emoji: '📁' },
  { label: 'Imports', href: '/imports', emoji: '📥' },
  { label: 'Reports', href: '/reports', emoji: '📊' },
  { label: 'Aircraft', href: '/aircraft', emoji: '✈️' },
  { label: 'Training', href: '/training', emoji: '📚' },
  { label: 'Settings', href: '/settings', emoji: '⚙️' },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="grid gap-1">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-[#10B981]/15 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'text-white/50 hover:bg-white/[0.05] hover:text-white/80',
            )}
          >
            <span className="text-base">{item.emoji}</span>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export { navItems }
