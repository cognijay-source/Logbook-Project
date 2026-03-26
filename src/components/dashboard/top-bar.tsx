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
    <header className="bg-background/80 flex h-14 items-center justify-between border-b px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-3">
        <MobileNav />
        <span className="font-heading text-muted-foreground text-sm font-medium md:hidden">
          CrossCheck
        </span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <div className="bg-muted hover:bg-muted/80 flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-200">
              <User className="text-muted-foreground h-4 w-4" />
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
