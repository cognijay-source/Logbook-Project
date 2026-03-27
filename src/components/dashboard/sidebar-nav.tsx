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
  { label: 'Analytics', href: '/analytics', emoji: '📈' },
  { label: 'Aircraft', href: '/aircraft', emoji: '✈️' },
  { label: 'Training', href: '/training', emoji: '📚' },
  { label: 'Settings', href: '/settings', emoji: '⚙️' },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="grid gap-0.5">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-white/[0.08] text-white'
                : 'text-[#8a8a9a] hover:bg-white/[0.04] hover:text-white',
            )}
          >
            {isActive && (
              <div className="absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#00d4aa]" />
            )}
            <span className="text-base leading-none">{item.emoji}</span>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export { navItems }
