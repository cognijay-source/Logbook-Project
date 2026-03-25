'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import { Menu, BookOpen } from 'lucide-react'
import { useState } from 'react'

function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="bg-foreground flex h-8 w-8 items-center justify-center rounded-lg">
            <BookOpen className="text-background h-4 w-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight">SkyLog</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="#features"
            className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm transition-colors"
          >
            Features
          </Link>
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm transition-colors"
          >
            Log in
          </Link>
          <div className="ml-3">
            <Button asChild size="sm">
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        </nav>

        {/* Mobile nav */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="-mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="mt-8 flex flex-col gap-1">
              <Link
                href="#features"
                onClick={() => setOpen(false)}
                className="text-foreground hover:bg-muted rounded-md px-3 py-2.5 text-base font-medium transition-colors"
              >
                Features
              </Link>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="text-foreground hover:bg-muted rounded-md px-3 py-2.5 text-base font-medium transition-colors"
              >
                Log in
              </Link>
              <div className="mt-4 px-3">
                <Button asChild className="w-full">
                  <Link href="/signup" onClick={() => setOpen(false)}>
                    Sign up
                  </Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-border/40 border-t">
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="bg-foreground flex h-7 w-7 items-center justify-center rounded-md">
              <BookOpen className="text-background h-3.5 w-3.5" />
            </div>
            <span className="text-foreground text-sm font-medium">SkyLog</span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="#features"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Features
            </Link>
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
        <div className="border-border/40 mt-8 border-t pt-8">
          <p className="text-muted-foreground text-center text-sm">
            &copy; {new Date().getFullYear()} SkyLog. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
