import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: 'flights' | 'documents' | 'analytics' | 'goals' | 'generic'
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

function FlightsSVG() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-[#10B981]"
    >
      <circle cx="60" cy="60" r="56" fill="currentColor" fillOpacity="0.06" />
      <path
        d="M35 75L55 45L75 55L95 35"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.3"
      />
      <path
        d="M70 42L82 38L78 50"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.4"
      />
      <circle cx="55" cy="45" r="3" fill="currentColor" fillOpacity="0.5" />
      <circle cx="75" cy="55" r="3" fill="currentColor" fillOpacity="0.5" />
      <path
        d="M30 85H90"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.15"
      />
    </svg>
  )
}

function DocumentsSVG() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-[#10B981]"
    >
      <circle cx="60" cy="60" r="56" fill="currentColor" fillOpacity="0.06" />
      <rect
        x="38"
        y="30"
        width="44"
        height="56"
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
        strokeOpacity="0.3"
      />
      <path
        d="M48 50H72M48 58H68M48 66H64"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.2"
      />
      <path
        d="M48 42H60"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity="0.4"
      />
    </svg>
  )
}

function AnalyticsSVG() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-[#10B981]"
    >
      <circle cx="60" cy="60" r="56" fill="currentColor" fillOpacity="0.06" />
      <rect x="32" y="60" width="12" height="25" rx="2" fill="currentColor" fillOpacity="0.2" />
      <rect x="48" y="45" width="12" height="40" rx="2" fill="currentColor" fillOpacity="0.3" />
      <rect x="64" y="35" width="12" height="50" rx="2" fill="currentColor" fillOpacity="0.4" />
      <rect x="80" y="50" width="12" height="35" rx="2" fill="currentColor" fillOpacity="0.25" />
      <path
        d="M28 85H96"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.15"
      />
    </svg>
  )
}

function GoalsSVG() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-[#10B981]"
    >
      <circle cx="60" cy="60" r="56" fill="currentColor" fillOpacity="0.06" />
      <circle cx="60" cy="56" r="28" stroke="currentColor" strokeWidth="2" strokeOpacity="0.15" />
      <circle cx="60" cy="56" r="18" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
      <circle cx="60" cy="56" r="8" fill="currentColor" fillOpacity="0.4" />
      <path
        d="M60 28V20M60 20L54 26M60 20L66 26"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.3"
      />
    </svg>
  )
}

function GenericSVG() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-[#10B981]"
    >
      <circle cx="60" cy="60" r="56" fill="currentColor" fillOpacity="0.06" />
      <circle cx="60" cy="55" r="12" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
      <path
        d="M54 55L58 59L66 51"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.4"
      />
    </svg>
  )
}

const iconMap = {
  flights: FlightsSVG,
  documents: DocumentsSVG,
  analytics: AnalyticsSVG,
  goals: GoalsSVG,
  generic: GenericSVG,
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const Icon = iconMap[icon]
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed py-16',
        className,
      )}
    >
      <Icon />
      <p className="text-muted-foreground mt-4 text-lg font-medium">{title}</p>
      {description && (
        <p className="text-muted-foreground mt-1 max-w-sm text-center text-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
