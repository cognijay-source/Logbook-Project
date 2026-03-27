'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { navItems } from '@/components/dashboard/sidebar-nav'

export function MobileNav() {
  const pathname = usePathname()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 border-white/10 bg-[var(--bg-navy)] p-0">
        <SheetHeader className="px-6 pt-5 pb-4">
          <SheetTitle className="flex items-center gap-2 text-left text-white">
            <span className="text-xl">✈️</span>
            <span className="font-heading">CrossCheck</span>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Navigation menu
          </SheetDescription>
        </SheetHeader>
        <nav className="grid gap-0.5 px-3">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <SheetClose key={item.href} asChild>
                <Link
                  href={item.href}
                  className={cn(
                    'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-[var(--accent-teal)] text-white'
                      : 'text-white/60 hover:bg-white/[0.06] hover:text-white',
                  )}
                >
                  <span className="text-base">{item.emoji}</span>
                  {item.label}
                </Link>
              </SheetClose>
            )
          })}
        </nav>
        <div className="mt-4 border-t border-white/10 px-3 pt-4">
          <SheetClose asChild>
            <Link
              href="/flights/new"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent-teal)] px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-[var(--accent-teal-hover)]"
            >
              <Plus className="h-4 w-4" />
              New Flight
            </Link>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}
