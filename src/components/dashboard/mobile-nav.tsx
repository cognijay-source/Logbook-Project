'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Compass } from 'lucide-react'
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
      <SheetContent side="left" className="w-72 border-white/[0.06] bg-[#111118] p-0">
        <SheetHeader className="px-6 pt-5 pb-4">
          <SheetTitle className="flex items-center gap-2.5 text-left text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00d4aa] shadow-md shadow-[#00d4aa]/20">
              <Compass className="h-4 w-4 text-[#111118]" />
            </div>
            <span className="font-brand">CrossCheck</span>
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
                    'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
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
                      'h-4 w-4',
                      isActive ? 'text-[#00d4aa]' : 'text-[#6b6b7b]',
                    )}
                  />
                  {item.label}
                </Link>
              </SheetClose>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
