'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useReducedMotion } from 'framer-motion'

interface AnimatedNumberProps {
  value: number
  format?: (n: number) => string
  duration?: number
}

export function AnimatedNumber({
  value,
  format,
  duration = 600,
}: AnimatedNumberProps) {
  const prefersReduced = useReducedMotion()
  const spanRef = useRef<HTMLSpanElement>(null)
  const rafRef = useRef<number>(0)

  const formatValue = useCallback(
    (v: number) => {
      if (format) return format(v)
      if (v === 0 && value === 0) return '\u2014'
      if (v % 1 === 0 && value % 1 === 0) return Math.round(v).toString()
      return v.toFixed(1)
    },
    [format, value],
  )

  useEffect(() => {
    const el = spanRef.current
    if (!el) return

    if (prefersReduced || value === 0) {
      el.textContent = formatValue(value)
      return
    }

    let start: number | null = null

    function animate(timestamp: number) {
      if (start === null) start = timestamp
      const elapsed = timestamp - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = eased * value

      if (el) el.textContent = formatValue(current)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else if (el) {
        el.textContent = formatValue(value)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value, duration, prefersReduced, formatValue])

  return <span ref={spanRef}>{formatValue(prefersReduced || value === 0 ? value : 0)}</span>
}
