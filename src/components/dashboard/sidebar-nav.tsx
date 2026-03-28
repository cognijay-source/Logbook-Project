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
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Daily', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Logbook', href: '/flights', icon: Plane },
  { label: 'Currency', href: '/currency', icon: ShieldCheck },
  { label: 'Mastery', href: '/journey', icon: Map },
  { label: 'Ready', href: '/progress', icon: Target },
  { label: 'Costs', href: '/money', icon: DollarSign },
  { label: 'Documents', href: '/documents', icon: FileText },
  { label: 'Imports', href: '/imports', icon: Upload },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Analytics', href: '/analytics', icon: TrendingUp },
  { label: 'Aircraft', href: '/aircraft', icon: Wrench },
  { label: 'Training', href: '/training', icon: GraduationCap },
  { label: 'Settings', href: '/settings', icon: Settings },
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
            <item.icon
              className={cn(
                'h-4 w-4 transition-colors duration-200',
                isActive
                  ? 'text-[#10B981]'
                  : 'text-white/40 group-hover:text-white/60',
              )}
            />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export { navItems }
