import Link from 'next/link'
import { Compass } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="flex items-center justify-center border-b border-border/60 bg-white px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#10B981]">
            <Compass className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-brand text-lg font-semibold">CrossCheck</span>
        </Link>
      </header>
      <main>{children}</main>
    </div>
  )
}
