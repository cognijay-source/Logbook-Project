import { SidebarNav } from '@/components/dashboard/sidebar-nav'
import { TopBar } from '@/components/dashboard/top-bar'
import { Compass } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-col border-r border-white/[0.06] bg-[#111118] md:flex">
        <div className="flex items-center gap-2.5 px-6 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00d4aa] shadow-md shadow-[#00d4aa]/20">
            <Compass className="h-4 w-4 text-[#111118]" />
          </div>
          <h2 className="font-brand text-lg font-semibold text-white">
            CrossCheck
          </h2>
        </div>
        <div className="flex-1 px-3 pb-4">
          <SidebarNav />
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <TopBar />
        <main className="flex-1 bg-[#fafafa] p-6">{children}</main>
      </div>
    </div>
  )
}
