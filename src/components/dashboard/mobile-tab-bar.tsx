'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Plane,
  ShieldCheck,
  DollarSign,
  MoreHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { label: 'Daily', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Logbook', href: '/flights', icon: Plane },
  { label: 'Currency', href: '/currency', icon: ShieldCheck },
  { label: 'Costs', href: '/money', icon: DollarSign },
  { label: 'More', href: '/settings', icon: MoreHorizontal },
]

export function MobileTabBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(tab.href + '/')
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
                isActive
                  ? 'text-[#10B981]'
                  : 'text-gray-500 active:text-gray-700 dark:text-gray-400',
              )}
            >
              <tab.icon
                className={cn(
                  'h-5 w-5',
                  isActive ? 'text-[#10B981]' : '',
                )}
              />
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
