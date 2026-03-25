export default function ImportsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Imports</h1>
      <p className="text-muted-foreground mt-2">
        Import flight records from other logbooks or CSV files.
      </p>
      <div className="mt-12 flex flex-col items-center justify-center text-center">
        <p className="text-muted-foreground text-sm">
          No imports yet. Upload a file to get started.
        </p>
      </div>
    </div>
  )
}
