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
import { Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'

const navLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/#pricing' },
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
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 shadow-sm backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2">
          <span className="text-xl">✈️</span>
          <span
            className={`font-heading text-lg font-semibold tracking-tight transition-colors duration-300 ${
              scrolled ? 'text-[var(--text-primary)]' : 'text-white'
            }`}
          >
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
              className={`rounded-md px-3 py-2 text-sm transition-colors duration-200 ${
                scrolled
                  ? 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className={`rounded-md px-3 py-2 text-sm transition-colors duration-200 ${
              scrolled
                ? 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Sign In
          </Link>
          <div className="ml-3">
            <Link
              href="/signup"
              className="btn-primary inline-flex items-center text-sm"
            >
              Get Started
            </Link>
          </div>
        </nav>

        {/* Mobile nav */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className={`-mr-2 ${scrolled ? 'text-[var(--text-primary)] hover:bg-black/5' : 'text-white hover:bg-white/10'}`}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 border-gray-200 bg-white">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="mt-8 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => handleAnchorClick(link.href)}
                  className="rounded-md px-3 py-2.5 text-base font-medium text-[var(--text-primary)] transition-colors duration-200 hover:bg-[var(--bg-primary)]"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-base font-medium text-[var(--text-primary)] transition-colors duration-200 hover:bg-[var(--bg-primary)]"
              >
                Sign In
              </Link>
              <div className="mt-4 px-3">
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="btn-primary block w-full text-center text-sm"
                >
                  Get Started
                </Link>
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
  { label: 'Pricing', href: '/#pricing' },
  { label: 'About', href: '/about' },
  { label: 'Login', href: '/login' },
  { label: 'Sign Up', href: '/signup' },
]

function Footer() {
  return (
    <footer className="bg-[var(--bg-navy)]">
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-lg">✈️</span>
            <span className="font-heading text-sm font-medium text-white">
              CrossCheck
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-white/50 transition-colors duration-200 hover:text-white/80"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-8">
          <p className="text-center text-sm text-white/40">
            &copy; 2026 CrossCheck. All rights reserved.
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
