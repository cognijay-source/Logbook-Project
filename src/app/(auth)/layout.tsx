import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-center border-b px-4 py-3">
        <Link href="/" className="text-lg font-semibold">
          CrossCheck
        </Link>
      </header>
      <main>{children}</main>
    </div>
  )
}
