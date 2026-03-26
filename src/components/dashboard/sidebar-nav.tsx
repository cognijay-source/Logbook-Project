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
  { label: 'Aircraft', href: '/aircraft', icon: Wrench },
  { label: 'Training', href: '/training', icon: GraduationCap },
  { label: 'Settings', href: '/settings', icon: Settings },
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
            <item.icon
              className={cn(
                'h-4 w-4 transition-colors duration-200',
                isActive
                  ? 'text-[#00d4aa]'
                  : 'text-[#6b6b7b] group-hover:text-[#8a8a9a]',
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
