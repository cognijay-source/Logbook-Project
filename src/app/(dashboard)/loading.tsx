export default function DashboardLoading() {
  return (
    <div className="flex h-full">
      {/* Sidebar placeholder */}
      <div className="bg-muted/40 hidden w-64 shrink-0 md:block">
        <div className="space-y-2 p-4">
          <div className="bg-muted h-8 w-32 animate-pulse rounded" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-muted h-6 animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex-1 p-6">
        <div className="bg-muted mb-6 h-8 w-48 animate-pulse rounded" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-muted h-32 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
