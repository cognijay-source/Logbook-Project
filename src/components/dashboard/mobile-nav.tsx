'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { navItems } from '@/components/dashboard/sidebar-nav'

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="grid gap-0.5 px-3">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-white/[0.08] text-white'
                : 'text-[#8a8a9a] hover:bg-white/[0.04] hover:text-white',
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
