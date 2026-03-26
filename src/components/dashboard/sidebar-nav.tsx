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
    <nav className="grid gap-1">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground',
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export { navItems }
