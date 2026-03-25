import { SidebarNav } from '@/components/dashboard/sidebar-nav'
import { TopBar } from '@/components/dashboard/top-bar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-col border-r md:flex">
        <div className="p-6">
          <h2 className="text-lg font-semibold">Logbook</h2>
        </div>
        <div className="flex-1 px-3">
          <SidebarNav />
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <TopBar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
