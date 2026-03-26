'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import { Menu, BookOpen } from 'lucide-react'
import { useState } from 'react'

const navLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
]

function Header() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  function handleAnchorClick(href: string) {
    setOpen(false)
    if (href.startsWith('/#') && pathname === '/') {
      const id = href.slice(2)
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className="border-border/40 bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-cyan-400 shadow-md shadow-sky-500/20 transition-shadow duration-300 group-hover:shadow-lg group-hover:shadow-sky-500/30">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <span className="font-heading text-lg font-semibold tracking-tight">
            CrossCheck
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => {
                if (link.href.startsWith('/#') && pathname === '/') {
                  e.preventDefault()
                  handleAnchorClick(link.href)
                }
              }}
              className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm transition-colors duration-200"
          >
            Sign In
          </Link>
          <div className="ml-3">
            <Button
              asChild
              size="sm"
              className="bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-md shadow-sky-500/20 hover:from-sky-500 hover:to-cyan-400 hover:shadow-lg"
            >
              <Link href="/signup">Get Started</Link>
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
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => handleAnchorClick(link.href)}
                  className="text-foreground hover:bg-muted rounded-md px-3 py-2.5 text-base font-medium transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="text-foreground hover:bg-muted rounded-md px-3 py-2.5 text-base font-medium transition-colors duration-200"
              >
                Sign In
              </Link>
              <div className="mt-4 px-3">
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-sky-600 to-cyan-500 text-white"
                >
                  <Link href="/signup" onClick={() => setOpen(false)}>
                    Get Started
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

const footerLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Login', href: '/login' },
  { label: 'Sign Up', href: '/signup' },
]

function Footer() {
  return (
    <footer className="border-border/40 border-t">
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-sky-500 to-cyan-400 shadow-sm">
              <BookOpen className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-foreground text-sm font-medium">
              CrossCheck
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="border-border/40 mt-8 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-muted-foreground text-sm">
              &copy; 2026 CrossCheck. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200"
              >
                Terms of Service
              </Link>
            </div>
          </div>
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
    <div className="dark flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
