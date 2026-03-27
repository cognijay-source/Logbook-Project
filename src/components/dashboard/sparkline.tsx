export function Sparkline() {
  // Decorative placeholder — hardcoded points suggesting an upward trend
  const points = '0,14 8,10 16,12 24,7 32,8 40,3'

  return (
    <svg width="40" height="16" viewBox="0 0 40 16" className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke="#10B981"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
