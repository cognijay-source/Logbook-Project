'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { type ReactNode } from 'react'

export function PageTransition({ children }: { children: ReactNode }) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return <div>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
