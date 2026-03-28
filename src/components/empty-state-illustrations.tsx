const svgProps = {
  width: 80,
  height: 80,
  viewBox: '0 0 80 80',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
} as const

const stroke = 'rgba(16, 185, 129, 0.3)'
const fill = 'rgba(16, 185, 129, 0.15)'

export function LogbookIllustration() {
  return (
    <svg {...svgProps}>
      <rect
        x="16"
        y="18"
        width="40"
        height="50"
        rx="3"
        stroke={stroke}
        strokeWidth="2"
        fill={fill}
        transform="rotate(-5 36 43)"
      />
      <rect
        x="24"
        y="14"
        width="40"
        height="50"
        rx="3"
        stroke={stroke}
        strokeWidth="2"
        fill={fill}
        transform="rotate(3 44 39)"
      />
      <line x1="32" y1="26" x2="56" y2="26" stroke={stroke} strokeWidth="1.5" />
      <line x1="32" y1="34" x2="56" y2="34" stroke={stroke} strokeWidth="1.5" />
      <line x1="32" y1="42" x2="50" y2="42" stroke={stroke} strokeWidth="1.5" />
    </svg>
  )
}

export function CurrencyIllustration() {
  return (
    <svg {...svgProps}>
      <circle cx="40" cy="40" r="24" stroke={stroke} strokeWidth="2" fill={fill} />
      <path
        d="M40 20 A20 20 0 0 1 60 40"
        stroke={stroke}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <line x1="40" y1="40" x2="40" y2="26" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <line x1="40" y1="40" x2="50" y2="40" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <circle cx="40" cy="40" r="2" fill={stroke} />
    </svg>
  )
}

export function MasteryIllustration() {
  return (
    <svg {...svgProps}>
      <path
        d="M12 62 L30 30 L40 18 L50 30 L68 62"
        stroke={stroke}
        strokeWidth="2"
        fill={fill}
        strokeLinejoin="round"
      />
      <path
        d="M18 58 L30 38 L40 28"
        stroke={stroke}
        strokeWidth="1.5"
        strokeDasharray="3 3"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="40" cy="18" r="3" fill={stroke} />
    </svg>
  )
}

export function ReadyIllustration() {
  return (
    <svg {...svgProps}>
      <circle cx="40" cy="40" r="26" stroke={stroke} strokeWidth="2" fill="none" />
      <circle cx="40" cy="40" r="18" stroke={stroke} strokeWidth="2" fill="none" />
      <circle cx="40" cy="40" r="10" stroke={stroke} strokeWidth="2" fill={fill} />
      <line x1="56" y1="24" x2="44" y2="36" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <polygon points="58,20 60,28 52,26" fill={stroke} />
    </svg>
  )
}

export function CostsIllustration() {
  return (
    <svg {...svgProps}>
      <rect x="14" y="24" width="44" height="32" rx="4" stroke={stroke} strokeWidth="2" fill={fill} />
      <path d="M14 34 L58 34" stroke={stroke} strokeWidth="1.5" />
      <rect x="30" y="18" width="20" height="8" rx="2" stroke={stroke} strokeWidth="1.5" fill="none" />
      <circle cx="68" cy="52" r="10" stroke={stroke} strokeWidth="2" fill={fill} />
      <text x="68" y="56" textAnchor="middle" fontSize="12" fill={stroke} fontWeight="bold">$</text>
    </svg>
  )
}

export function AircraftIllustration() {
  return (
    <svg {...svgProps}>
      <path
        d="M40 16 L56 44 L40 40 L24 44 Z"
        stroke={stroke}
        strokeWidth="2"
        fill={fill}
        strokeLinejoin="round"
      />
      <line x1="40" y1="40" x2="40" y2="64" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <path
        d="M32 58 L40 54 L48 58"
        stroke={stroke}
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function DocumentsIllustration() {
  return (
    <svg {...svgProps}>
      <path
        d="M18 18 L54 18 L54 62 L18 62 Z"
        stroke={stroke}
        strokeWidth="2"
        fill={fill}
      />
      <rect x="24" y="12" width="38" height="50" rx="2" stroke={stroke} strokeWidth="2" fill={fill} />
      <line x1="32" y1="24" x2="54" y2="24" stroke={stroke} strokeWidth="1.5" />
      <line x1="32" y1="32" x2="54" y2="32" stroke={stroke} strokeWidth="1.5" />
      <line x1="32" y1="40" x2="48" y2="40" stroke={stroke} strokeWidth="1.5" />
    </svg>
  )
}

export function TrainingIllustration() {
  return (
    <svg {...svgProps}>
      <path
        d="M40 20 L60 32 L40 44 L20 32 Z"
        stroke={stroke}
        strokeWidth="2"
        fill={fill}
      />
      <rect x="30" y="44" width="20" height="14" stroke={stroke} strokeWidth="2" fill={fill} />
      <line x1="40" y1="32" x2="40" y2="16" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <line x1="60" y1="32" x2="60" y2="50" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function ImportsIllustration() {
  return (
    <svg {...svgProps}>
      <rect x="20" y="30" width="40" height="30" rx="3" stroke={stroke} strokeWidth="2" fill={fill} />
      <path d="M20 30 L40 30 L40 36 L44 30 L60 30" stroke={stroke} strokeWidth="2" fill="none" />
      <line x1="40" y1="16" x2="40" y2="32" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <polyline points="34,22 40,16 46,22" stroke={stroke} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function AnalyticsIllustration() {
  return (
    <svg {...svgProps}>
      <rect x="16" y="48" width="12" height="16" rx="2" stroke={stroke} strokeWidth="2" fill={fill} />
      <rect x="34" y="36" width="12" height="28" rx="2" stroke={stroke} strokeWidth="2" fill={fill} />
      <rect x="52" y="22" width="12" height="42" rx="2" stroke={stroke} strokeWidth="2" fill={fill} />
      <line x1="12" y1="66" x2="68" y2="66" stroke={stroke} strokeWidth="1.5" />
    </svg>
  )
}

export function NotificationsIllustration() {
  return (
    <svg {...svgProps}>
      <path
        d="M32 56 C32 60 36 64 40 64 C44 64 48 60 48 56"
        stroke={stroke}
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M24 54 L24 36 C24 26 32 18 40 18 C48 18 56 26 56 36 L56 54 L24 54 Z"
        stroke={stroke}
        strokeWidth="2"
        fill={fill}
      />
      <line x1="40" y1="14" x2="40" y2="18" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
