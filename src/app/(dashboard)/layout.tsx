import { SidebarNav } from '@/components/dashboard/sidebar-nav'
import { TopBar } from '@/components/dashboard/top-bar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-col border-r border-white/10 bg-[var(--bg-navy)] md:flex">
        <div className="flex items-center gap-2 px-6 py-5">
          <span className="text-xl">✈️</span>
          <h2 className="font-heading text-lg font-semibold text-white">
            CrossCheck
          </h2>
        </div>
        <div className="flex-1 px-3 pb-4">
          <SidebarNav />
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <TopBar />
        <main className="flex-1 bg-[var(--bg-primary)] p-6 md:p-8">{children}</main>
      </div>
    </div>
  )
}
