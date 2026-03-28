'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

/* SVG illustrations — single-color teal at 30% opacity, ~120x120px */

function LogbookIllustration() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      <rect x="20" y="15" width="80" height="90" rx="4" stroke="#10B981" strokeOpacity="0.3" strokeWidth="2" />
      <path d="M60 15V105" stroke="#10B981" strokeOpacity="0.2" strokeWidth="1.5" />
      <line x1="30" y1="35" x2="55" y2="35" stroke="#10B981" strokeOpacity="0.3" strokeWidth="1.5" />
      <line x1="30" y1="50" x2="55" y2="50" stroke="#10B981" strokeOpacity="0.3" strokeWidth="1.5" />
      <line x1="30" y1="65" x2="55" y2="65" stroke="#10B981" strokeOpacity="0.3" strokeWidth="1.5" />
      <line x1="65" y1="35" x2="90" y2="35" stroke="#10B981" strokeOpacity="0.3" strokeWidth="1.5" />
      <line x1="65" y1="50" x2="90" y2="50" stroke="#10B981" strokeOpacity="0.3" strokeWidth="1.5" />
      <line x1="65" y1="65" x2="90" y2="65" stroke="#10B981" strokeOpacity="0.3" strokeWidth="1.5" />
    </svg>
  )
}

function CurrencyIllustration() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      <circle cx="60" cy="60" r="40" stroke="#10B981" strokeOpacity="0.2" strokeWidth="2" />
      <path
        d="M60 20A40 40 0 0 1 97 72"
        stroke="#10B981"
        strokeOpacity="0.3"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line x1="60" y1="60" x2="60" y2="32" stroke="#10B981" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" />
      <line x1="60" y1="60" x2="78" y2="60" stroke="#10B981" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" />
      <circle cx="60" cy="60" r="3" fill="#10B981" fillOpacity="0.3" />
    </svg>
  )
}

function MasteryIllustration() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      <path d="M20 95L50 50L70 65L100 25" stroke="#10B981" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 95L50 50L70 65L100 25" stroke="#10B981" strokeOpacity="0.08" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 4" />
      <circle cx="100" cy="25" r="6" stroke="#10B981" strokeOpacity="0.3" strokeWidth="2" />
      <line x1="97" y1="25" x2="103" y2="25" stroke="#10B981" strokeOpacity="0.3" strokeWidth="1.5" />
      <line x1="100" y1="22" x2="100" y2="28" stroke="#10B981" strokeOpacity="0.3" strokeWidth="1.5" />
    </svg>
  )
}

function ReadyIllustration() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      <circle cx="60" cy="60" r="40" stroke="#10B981" strokeOpacity="0.15" strokeWidth="2" />
      <circle cx="60" cy="60" r="28" stroke="#10B981" strokeOpacity="0.2" strokeWidth="2" />
      <circle cx="60" cy="60" r="16" stroke="#10B981" strokeOpacity="0.25" strokeWidth="2" />
      <circle cx="60" cy="60" r="4" fill="#10B981" fillOpacity="0.3" />
      <path d="M85 35L62 58" stroke="#10B981" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" />
      <path d="M85 35L78 37L83 42Z" fill="#10B981" fillOpacity="0.3" />
    </svg>
  )
}

function CostsIllustration() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      <rect x="25" y="30" width="70" height="60" rx="8" stroke="#10B981" strokeOpacity="0.3" strokeWidth="2" />
      <rect x="25" y="45" width="70" height="2" fill="#10B981" fillOpacity="0.15" />
      <circle cx="75" cy="70" r="12" stroke="#10B981" strokeOpacity="0.3" strokeWidth="2" />
      <path d="M75 64V76M72 67H78M72 73H78" stroke="#10B981" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function AircraftIllustration() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      <path d="M60 20L90 80H30L60 20Z" stroke="#10B981" strokeOpacity="0.3" strokeWidth="2" strokeLinejoin="round" />
      <path d="M60 80V100" stroke="#10B981" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" />
      <path d="M50 100H70" stroke="#10B981" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function DocumentsIllustration() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      <rect x="25" y="20" width="55" height="80" rx="4" stroke="#10B981" strokeOpacity="0.3" strokeWidth="2" />
      <rect x="40" y="15" width="55" height="80" rx="4" stroke="#10B981" strokeOpacity="0.2" strokeWidth="2" fill="none" />
      <line x1="35" y1="45" x2="65" y2="45" stroke="#10B981" strokeOpacity="0.3" strokeWidth="1.5" />
      <line x1="35" y1="55" x2="60" y2="55" stroke="#10B981" strokeOpacity="0.3" strokeWidth="1.5" />
      <line x1="35" y1="65" x2="55" y2="65" stroke="#10B981" strokeOpacity="0.3" strokeWidth="1.5" />
    </svg>
  )
}

function TrainingIllustration() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      <path d="M60 30L100 50L60 70L20 50L60 30Z" stroke="#10B981" strokeOpacity="0.3" strokeWidth="2" strokeLinejoin="round" />
      <path d="M30 55V80L60 95L90 80V55" stroke="#10B981" strokeOpacity="0.25" strokeWidth="2" strokeLinejoin="round" />
      <line x1="100" y1="50" x2="100" y2="80" stroke="#10B981" strokeOpacity="0.2" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ImportsIllustration() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      <rect x="30" y="40" width="60" height="55" rx="4" stroke="#10B981" strokeOpacity="0.3" strokeWidth="2" />
      <path d="M50 40V30H70V40" stroke="#10B981" strokeOpacity="0.3" strokeWidth="2" />
      <path d="M60 55V80" stroke="#10B981" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" />
      <path d="M50 65L60 55L70 65" stroke="#10B981" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export const illustrations = {
  logbook: LogbookIllustration,
  currency: CurrencyIllustration,
  mastery: MasteryIllustration,
  ready: ReadyIllustration,
  costs: CostsIllustration,
  aircraft: AircraftIllustration,
  documents: DocumentsIllustration,
  training: TrainingIllustration,
  imports: ImportsIllustration,
} as const

interface EmptyStateProps {
  illustration: keyof typeof illustrations
  title: string
  subtitle: string
  actionLabel?: string
  actionHref?: string
}

export function EmptyState({
  illustration,
  title,
  subtitle,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  const Illustration = illustrations[illustration]

  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <div className="h-[80px] w-[80px] sm:h-[120px] sm:w-[120px]">
        <Illustration />
      </div>
      <div className="text-center">
        <p className="text-base font-medium text-[#1a1a2e]">{title}</p>
        <p className="mt-1 text-sm text-[#71717a]">{subtitle}</p>
      </div>
      {actionLabel && actionHref && (
        <Button asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  )
}
