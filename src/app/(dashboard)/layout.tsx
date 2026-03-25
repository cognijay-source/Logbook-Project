import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="bg-sidebar-background hidden w-64 border-r p-4 md:block">
        <div className="mb-8">
          <h2 className="text-lg font-semibold">Logbook Project</h2>
        </div>
        <nav className="grid gap-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
