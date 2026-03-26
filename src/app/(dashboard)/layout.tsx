import { SidebarNav } from '@/components/dashboard/sidebar-nav'
import { TopBar } from '@/components/dashboard/top-bar'
import { BookOpen } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-col bg-sidebar-background md:flex">
        <div className="flex items-center gap-2.5 px-6 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-cyan-400 shadow-md shadow-sky-500/20">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <h2 className="font-heading text-lg font-semibold text-sidebar-accent-foreground">
            CrossCheck
          </h2>
        </div>
        <div className="flex-1 px-3 pb-4">
          <SidebarNav />
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <TopBar />
        <main className="flex-1 bg-muted/30 p-6">{children}</main>
      </div>
    </div>
  )
}
