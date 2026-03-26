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
              'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
            )}
          >
            <item.icon
              className={cn(
                'h-4 w-4 transition-colors duration-200',
                isActive
                  ? 'text-sidebar-primary'
                  : 'text-sidebar-muted group-hover:text-sidebar-accent-foreground',
              )}
            />
            {item.label}
            {isActive && (
              <div className="bg-sidebar-primary ml-auto h-1.5 w-1.5 rounded-full" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}

export { navItems }
