'use client'

import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect } from 'react'

export function CountUp({
  value,
  decimals = 1,
}: {
  value: number
  decimals?: number
}) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => v.toFixed(decimals))

  useEffect(() => {
    if (value <= 0) return
    const controls = animate(count, value, { duration: 0.6 })
    return controls.stop
  }, [value, count])

  if (value <= 0) return <span>&mdash;</span>

  return <motion.span>{rounded}</motion.span>
}
