import { SidebarNav } from '@/components/dashboard/sidebar-nav'
import { TopBar } from '@/components/dashboard/top-bar'
import { BottomTabBar } from '@/components/dashboard/bottom-tab-bar'
import { Compass } from 'lucide-react'
import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-col border-r border-white/[0.06] bg-[#0B1C3B] lg:flex">
        <div className="flex items-center gap-2.5 px-6 py-5">
          <div className="glow-teal flex h-8 w-8 items-center justify-center rounded-lg bg-[#10B981]">
            <Compass className="h-4 w-4 text-[#0B1C3B]" />
          </div>
          <h2 className="font-brand text-lg font-semibold text-white">
            CrossCheck
          </h2>
        </div>
        <div className="flex-1 px-3 pb-4">
          <SidebarNav />
        </div>
        <div className="border-t border-white/[0.06] px-4 py-4">
          <Link
            href="/flights/new"
            className="glow-teal flex w-full items-center justify-center gap-2 rounded-xl bg-[#10B981] px-4 py-2.5 text-sm font-semibold text-[#0B1C3B] transition-all duration-200 hover:bg-[#059669]"
          >
            + New Flight
          </Link>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <TopBar />
        <main className="flex-1 bg-[#f8f8fa] p-4 pb-24 sm:p-6 lg:pb-6">
          <div className="mx-auto max-w-[1200px]">{children}</div>
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <BottomTabBar />
    </div>
  )
}
