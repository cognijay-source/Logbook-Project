'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'

export function MobileFAB() {
  return (
    <Link
      href="/flights/new"
      className="fixed right-4 bottom-20 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#10B981] text-white shadow-lg shadow-[#10B981]/30 transition-transform active:scale-95 md:hidden"
      aria-label="New flight"
    >
      <Plus className="h-6 w-6" />
    </Link>
  )
}
