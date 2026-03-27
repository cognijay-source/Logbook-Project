'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Plane,
  Wrench,
  Map,
  Target,
  DollarSign,
  Upload,
  Settings,
  ShieldCheck,
  GraduationCap,
  FileText,
  BarChart3,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const navItems = [
  { label: 'Daily', href: '/dashboard', icon: LayoutDashboard, emoji: '🏠' },
  { label: 'Logbook', href: '/flights', icon: Plane, emoji: '📖' },
  { label: 'Currency', href: '/currency', icon: ShieldCheck, emoji: '🔄' },
  { label: 'Mastery', href: '/journey', icon: Map, emoji: '🏆' },
  { label: 'Ready', href: '/progress', icon: Target, emoji: '🎯' },
  { label: 'Costs', href: '/money', icon: DollarSign, emoji: '💰' },
  { label: 'Documents', href: '/documents', icon: FileText, emoji: '📁' },
  { label: 'Imports', href: '/imports', icon: Upload, emoji: '📥' },
  { label: 'Reports', href: '/reports', icon: BarChart3, emoji: '📊' },
  { label: 'Aircraft', href: '/aircraft', icon: Wrench, emoji: '✈️' },
  { label: 'Training', href: '/training', icon: GraduationCap, emoji: '📚' },
  { label: 'Settings', href: '/settings', icon: Settings, emoji: '⚙️' },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col gap-1">
      <nav className="grid gap-0.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'text-white'
                  : 'text-white/60 hover:bg-white/[0.06] hover:text-white',
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-[var(--accent-teal)]"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10 text-base">{item.emoji}</span>
              <span className="relative z-10">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-4 border-t border-white/10 pt-4">
        <Link
          href="/flights/new"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent-teal)] px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-[var(--accent-teal-hover)] hover:shadow-lg hover:shadow-[var(--accent-teal)]/20"
        >
          <Plus className="h-4 w-4" />
          New Flight
        </Link>
      </div>
    </div>
  )
}

export { navItems }
