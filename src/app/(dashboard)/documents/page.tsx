export default function DocumentsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Documents</h1>
      <p className="text-muted-foreground mt-2">
        Store and organize your aviation certificates, endorsements, and
        records.
      </p>
      <div className="mt-12 flex flex-col items-center justify-center text-center">
        <p className="text-muted-foreground text-sm">
          No documents uploaded yet. Add your first document to get started.
        </p>
      </div>
    </div>
  )
}
