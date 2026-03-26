'use client'

import { LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MobileNav } from '@/components/dashboard/mobile-nav'
import { logout } from '@/app/(dashboard)/actions'

export function TopBar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border/60 bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        <MobileNav />
        <span className="font-brand text-sm font-medium text-muted-foreground md:hidden">
          CrossCheck
        </span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0f0f3] transition-colors duration-200 hover:bg-[#e8e8ed]">
              <User className="h-4 w-4 text-[#6b6b7b]" />
            </div>
            <span className="sr-only">Account menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              logout()
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
