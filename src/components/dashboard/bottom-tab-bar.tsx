'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Plus, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const primaryTabs = [
  { label: 'Daily', href: '/dashboard', emoji: '🏠' },
  { label: 'Logbook', href: '/flights', emoji: '📖' },
  { label: 'Currency', href: '/currency', emoji: '🔄' },
  { label: 'Mastery', href: '/journey', emoji: '🏆' },
]

const moreTabs = [
  { label: 'Ready', href: '/progress', emoji: '🎯' },
  { label: 'Costs', href: '/money', emoji: '💰' },
  { label: 'Documents', href: '/documents', emoji: '📁' },
  { label: 'Imports', href: '/imports', emoji: '📥' },
  { label: 'Reports', href: '/reports', emoji: '📊' },
  { label: 'Aircraft', href: '/aircraft', emoji: '✈️' },
  { label: 'Training', href: '/training', emoji: '📚' },
  { label: 'Settings', href: '/settings', emoji: '⚙️' },
]

export function BottomTabBar() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  const isMoreActive = moreTabs.some((t) => isActive(t.href))

  return (
    <>
      {/* More sheet overlay */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMoreOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* More slide-up sheet */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white shadow-2xl lg:hidden"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h3 className="font-heading text-base font-semibold text-[#1a1a2e]">
                More
              </h3>
              <button
                onClick={() => setMoreOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
              >
                <X className="h-4 w-4 text-[#71717a]" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 px-4 py-4 safe-bottom">
              {moreTabs.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-center transition-colors',
                    isActive(tab.href)
                      ? 'bg-[#10B981]/10 text-[#10B981]'
                      : 'text-[#71717a] active:bg-gray-50',
                  )}
                >
                  <span className="text-xl">{tab.emoji}</span>
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB — New Flight */}
      <Link
        href="/flights/new"
        className="glow-teal fixed right-4 bottom-[calc(56px+env(safe-area-inset-bottom,0px)+12px)] z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#10B981] text-white shadow-lg transition-transform active:scale-95 lg:hidden"
      >
        <Plus className="h-6 w-6" />
      </Link>

      {/* Tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200/80 bg-white/95 backdrop-blur-lg safe-bottom lg:hidden">
        <div className="flex h-14 items-stretch">
          {primaryTabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors',
                isActive(tab.href)
                  ? 'text-[#10B981]'
                  : 'text-[#71717a] active:text-[#1a1a2e]',
              )}
            >
              <span className="text-lg">{tab.emoji}</span>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          ))}
          <button
            onClick={() => setMoreOpen(true)}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors',
              isMoreActive
                ? 'text-[#10B981]'
                : 'text-[#71717a] active:text-[#1a1a2e]',
            )}
          >
            <span className="text-lg">☰</span>
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  )
}
