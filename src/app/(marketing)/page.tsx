import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-5xl font-bold tracking-tight">Logbook Project</h1>
      <p className="text-muted-foreground text-lg">
        Pilot logbook and aviation career tracker
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/login">Get Started</Link>
        </Button>
      </div>
    </div>
  )
}
