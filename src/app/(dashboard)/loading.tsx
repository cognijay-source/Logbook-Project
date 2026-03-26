export default function DashboardLoading() {
  return (
    <div className="animate-fade-in flex-1 p-6">
      <div className="mb-6 h-8 w-48 skeleton-shimmer rounded-lg" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="h-24 skeleton-shimmer rounded-xl"
          />
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-48 skeleton-shimmer rounded-xl"
          />
        ))}
      </div>
    </div>
  )
}
