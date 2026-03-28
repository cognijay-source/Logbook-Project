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

export type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { label: 'Daily', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Logbook', href: '/flights', icon: Plane },
  { label: 'Aircraft', href: '/aircraft', icon: Wrench },
  { label: 'Currency', href: '/currency', icon: ShieldCheck },
  { label: 'Mastery', href: '/journey', icon: Map },
  { label: 'Ready', href: '/progress', icon: Target },
  { label: 'Training', href: '/training', icon: GraduationCap },
  { label: 'Documents', href: '/documents', icon: FileText },
  { label: 'Imports', href: '/imports', icon: Upload },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Costs', href: '/money', icon: DollarSign },
  { label: 'Settings', href: '/settings', icon: Settings },
]

type NavGroup = {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: 'FLY',
    items: [
      { label: 'Daily', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Logbook', href: '/flights', icon: Plane },
      { label: 'Aircraft', href: '/aircraft', icon: Wrench },
    ],
  },
  {
    label: 'TRACK',
    items: [
      { label: 'Currency', href: '/currency', icon: ShieldCheck },
      { label: 'Mastery', href: '/journey', icon: Map },
      { label: 'Ready', href: '/progress', icon: Target },
    ],
  },
  {
    label: 'MANAGE',
    items: [
      { label: 'Training', href: '/training', icon: GraduationCap },
      { label: 'Documents', href: '/documents', icon: FileText },
      { label: 'Imports', href: '/imports', icon: Upload },
    ],
  },
  {
    label: 'ANALYZE',
    items: [
      { label: 'Reports', href: '/reports', icon: BarChart3 },
      { label: 'Costs', href: '/money', icon: DollarSign },
    ],
  },
  {
    label: 'ACCOUNT',
    items: [{ label: 'Settings', href: '/settings', icon: Settings }],
  },
]

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
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
}

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="grid gap-0.5">
      {navGroups.map((group, groupIndex) => (
        <div key={group.label}>
          {groupIndex > 0 && (
            <div className="border-t border-white/5 mt-4 mb-1" />
          )}
          <div className="px-3 mt-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
            {group.label}
          </div>
          {group.items.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/')
            return <NavLink key={item.href} item={item} isActive={isActive} />
          })}
        </div>
      ))}
    </nav>
  )
}

export { navItems, navGroups }
