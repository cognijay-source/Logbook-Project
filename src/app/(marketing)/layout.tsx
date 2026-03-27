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
import { Menu, Compass } from 'lucide-react'
import { useState, useEffect } from 'react'

const navLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
]

function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleAnchorClick(href: string) {
    setOpen(false)
    if (href.startsWith('/#') && pathname === '/') {
      const id = href.slice(2)
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/[0.05] bg-[#0a0a0f]/80 backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="glow-teal flex h-8 w-8 items-center justify-center rounded-lg bg-[#10B981] transition-shadow duration-300">
            <Compass className="h-4 w-4 text-[#0a0a0f]" />
          </div>
          <span className="font-brand text-lg font-semibold tracking-tight text-white">
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
              className="rounded-md px-3 py-2 text-sm text-[#8a8a9a] transition-colors duration-200 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="ml-2 rounded-lg border border-white/[0.15] px-3 py-1.5 text-sm text-white transition-all duration-200 hover:border-white/[0.3] hover:bg-white/[0.05]"
          >
            Sign In
          </Link>
          <div className="ml-3">
            <Button
              asChild
              size="sm"
              className="glow-teal bg-[#10B981] text-[#0a0a0f] font-semibold hover:bg-[#059669]"
            >
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </nav>

        {/* Mobile nav */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="-mr-2 text-white hover:bg-white/10"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-72 border-white/[0.06] bg-[#12121a]"
          >
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="mt-8 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => handleAnchorClick(link.href)}
                  className="rounded-md px-3 py-2.5 text-base font-medium text-[#f0f0f5] transition-colors duration-200 hover:bg-white/[0.06]"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-base font-medium text-[#f0f0f5] transition-colors duration-200 hover:bg-white/[0.06]"
              >
                Sign In
              </Link>
              <div className="mt-4 px-3">
                <Button
                  asChild
                  className="w-full bg-[#10B981] text-[#0a0a0f] font-semibold hover:bg-[#059669]"
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
    <footer className="border-t border-white/[0.05]">
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#10B981] shadow-sm">
              <Compass className="h-3.5 w-3.5 text-[#0a0a0f]" />
            </div>
            <span className="font-brand text-sm font-medium text-white">
              CrossCheck
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[#8a8a9a] transition-colors duration-200 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-8 border-t border-white/[0.05] pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-[#6b6b7b]">
              &copy; 2026 CrossCheck. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-sm text-[#6b6b7b] transition-colors duration-200 hover:text-[#8a8a9a]"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-[#6b6b7b] transition-colors duration-200 hover:text-[#8a8a9a]"
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
    <div className="dark flex min-h-screen flex-col bg-[#0a0a0f]">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
