'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  Check,
} from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

/* ───────────────────────────────────────────────────────────── */
/*  Animation helpers                                           */
/* ───────────────────────────────────────────────────────────── */

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const staggerFast = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

/* ───────────────────────────────────────────────────────────── */
/*  Dashboard Mockup                                             */
/* ───────────────────────────────────────────────────────────── */

function DashboardMockup() {
  return (
    <div
      className="mx-auto mt-16 hidden max-w-3xl sm:block"
      style={{
        perspective: '1200px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#12121a]"
        style={{
          transform: 'perspective(1200px) rotateX(5deg)',
        }}
      >
        <div className="flex">
          {/* Sidebar mock */}
          <div className="flex w-14 flex-col gap-3 border-r border-white/[0.06] bg-[#0B1C3B] p-3">
            <div className="h-6 w-6 rounded-md bg-[#10B981]/80" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full ${i === 1 ? 'bg-[#10B981]' : 'bg-white/20'}`}
              />
            ))}
          </div>

          {/* Main content mock */}
          <div className="flex-1 p-4">
            {/* Stat cards row */}
            <div className="mb-4 flex gap-3">
              {[
                { label: 'Total', value: '247.3' },
                { label: 'PIC', value: '189.1' },
                { label: 'XC', value: '102.5' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex-1 rounded-lg border border-white/[0.06] bg-white/[0.03] p-3"
                >
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-[#8a8a9a]">
                    {stat.label}
                  </div>
                  <div className="font-mono text-lg font-semibold text-white">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Mini table */}
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02]">
              <div className="border-b border-white/[0.06] px-3 py-2">
                <div className="text-[10px] uppercase tracking-wider text-[#8a8a9a]">
                  Recent Flights
                </div>
              </div>
              {[
                { route: 'KSJC → KLAX', time: '1.5', date: 'Mar 25' },
                { route: 'KLAX → KSFO', time: '1.2', date: 'Mar 23' },
                { route: 'KSFO → KOAK', time: '0.6', date: 'Mar 20' },
              ].map((row) => (
                <div
                  key={row.route}
                  className="flex items-center justify-between border-b border-white/[0.04] px-3 py-2 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-white/80">
                      {row.route}
                    </span>
                    <span className="text-[10px] text-[#8a8a9a]">
                      {row.date}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-[#10B981]">
                    {row.time}h
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
      </motion.div>
    </div>
  )
}

/* ───────────────────────────────────────────────────────────── */
/*  Hero                                                         */
/* ───────────────────────────────────────────────────────────── */

function Hero() {
  const prefersReduced = useReducedMotion()

  return (
    <section className="relative overflow-hidden px-6 pt-24 pb-16 sm:pt-32 sm:pb-20 lg:px-8">
      {/* Subtle radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute top-1/3 left-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#10B981]/[0.05] blur-[120px]" />
        {/* Dot grid overlay */}
        <div className="dot-grid absolute inset-0 opacity-[0.03]" />
      </div>

      {/* Animated compass rings */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2"
      >
        <div className="animate-pulse-ring h-[500px] w-[500px] rounded-full border border-white/[0.04]" />
        <div
          className="animate-pulse-ring absolute inset-8 rounded-full border border-white/[0.03]"
          style={{ animationDelay: '0.5s' }}
        />
        <div
          className="animate-pulse-ring absolute inset-16 rounded-full border border-white/[0.02]"
          style={{ animationDelay: '1s' }}
        />
      </div>

      <motion.div
        className="mx-auto max-w-3xl text-center"
        initial="hidden"
        animate="visible"
        variants={prefersReduced ? undefined : staggerContainer}
      >
        <motion.div
          variants={prefersReduced ? undefined : fadeInUp}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-[#8a8a9a] backdrop-blur-sm"
        >
          The Pilot Operating System
        </motion.div>

        <motion.h1
          variants={prefersReduced ? undefined : fadeInUp}
          transition={{ duration: 0.6 }}
          className="font-heading text-5xl leading-[1.05] font-bold tracking-tight sm:text-7xl lg:text-[100px]"
        >
          <span className="gradient-text">CrossCheck</span>
        </motion.h1>

        <motion.p
          variants={prefersReduced ? undefined : fadeInUp}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-5 text-xl leading-relaxed font-medium text-white sm:text-2xl"
        >
          See the system clearly. Build mastery deliberately.
        </motion.p>

        <motion.p
          variants={prefersReduced ? undefined : fadeInUp}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#8a8a9a] sm:text-lg"
        >
          The pilot operating system for flight records, training progress,
          currency, costs, and career readiness.
        </motion.p>

        <motion.div
          variants={prefersReduced ? undefined : fadeInUp}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button
            asChild
            size="lg"
            className="glow-teal w-full bg-[#10B981] px-8 text-[#0a0a0f] font-semibold transition-all duration-200 hover:bg-[#059669] hover:scale-[1.02] sm:w-auto"
          >
            <Link href="/signup">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="w-full border border-white/[0.15] bg-transparent px-8 text-white backdrop-blur-sm transition-all duration-200 hover:border-white/[0.3] hover:bg-white/[0.05] sm:w-auto"
          >
            <Link href="#features">See Features</Link>
          </Button>
        </motion.div>
      </motion.div>

      <DashboardMockup />
    </section>
  )
}

/* ───────────────────────────────────────────────────────────── */
/*  Problem                                                      */
/* ───────────────────────────────────────────────────────────── */

function Problem() {
  return (
    <section className="border-t border-white/[0.06] px-6 py-16 sm:py-20 lg:px-8">
      <motion.div
        className="mx-auto max-w-3xl text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={staggerContainer}
      >
        <motion.h2
          variants={fadeInUp}
          transition={{ duration: 0.5 }}
          className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl"
        >
          Aviation runs on records. Too often, careers run on ambiguity.
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 text-base leading-relaxed text-[#8a8a9a] sm:text-lg"
        >
          Pilots are expected to track standards, progress, costs, and readiness
          in a system that often lacks clarity. Paper logbooks, scattered
          spreadsheets, and manual calculations leave gaps where precision
          matters most. CrossCheck makes that system legible.
        </motion.p>
      </motion.div>
    </section>
  )
}

/* ───────────────────────────────────────────────────────────── */
/*  Feature Showcase — Bento Grid                                */
/* ───────────────────────────────────────────────────────────── */

const bentoFeatures = [
  {
    emoji: '📖',
    name: 'CrossCheck Logbook',
    description:
      'Clean, structured, reliable digital flight records. Fast entry. Smart search. Automatic totals.',
    span: 2,
    animated: 'table' as const,
  },
  {
    emoji: '🔄',
    name: 'CrossCheck Currency',
    description:
      'Track recency requirements. See upcoming lapses. Stay operationally current.',
    span: 1,
    animated: null,
  },
  {
    emoji: '🏆',
    name: 'CrossCheck Mastery',
    description:
      'Monitor certificates, ratings, training progression, and milestone development.',
    span: 1,
    animated: null,
  },
  {
    emoji: '🏠',
    name: 'CrossCheck Daily',
    description:
      'Your operational dashboard. Recent activity, progress, currency, and what needs attention next.',
    span: 2,
    animated: 'bars' as const,
  },
  {
    emoji: '🎯',
    name: 'CrossCheck Ready',
    description:
      'Understand actual readiness for certifications, career goals, and hiring thresholds.',
    span: 1,
    animated: null,
  },
  {
    emoji: '💰',
    name: 'CrossCheck Costs',
    description:
      'Track cost per flight, aircraft, training block, and time period. See where the money goes.',
    span: 1,
    animated: null,
  },
]

function MiniTableAnimation() {
  return (
    <div className="mt-4 space-y-1.5">
      {['KSJC → KLAX', 'KLAX → KSFO', 'KSFO → KOAK'].map((route, i) => (
        <motion.div
          key={route}
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
          className="flex items-center justify-between rounded-md bg-white/[0.04] px-3 py-1.5"
        >
          <span className="text-xs text-white/60">{route}</span>
          <span className="font-mono text-xs text-[#10B981]">
            {(1.5 - i * 0.3).toFixed(1)}h
          </span>
        </motion.div>
      ))}
    </div>
  )
}

function MiniBarsAnimation() {
  return (
    <div className="mt-4 space-y-2">
      {[
        { label: 'PIC', pct: 75 },
        { label: 'XC', pct: 45 },
        { label: 'Night', pct: 28 },
      ].map((bar) => (
        <div key={bar.label} className="flex items-center gap-2">
          <span className="w-8 text-[10px] text-white/50">{bar.label}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#10B981] to-[#059669]"
              initial={{ width: 0 }}
              whileInView={{ width: `${bar.pct}%` }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function FeatureShowcase() {
  return (
    <section
      id="features"
      className="scroll-mt-16 px-6 py-16 sm:py-20 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mx-auto mb-12 max-w-2xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={staggerContainer}
        >
          <motion.h2
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl"
          >
            The CrossCheck Suite
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-base leading-relaxed text-[#8a8a9a] sm:text-lg"
          >
            Six integrated modules. One operating system for your flying career.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={staggerFast}
        >
          {bentoFeatures.map((item) => (
            <motion.div
              key={item.name}
              variants={fadeInUp}
              transition={{ duration: 0.4 }}
              className={`group rounded-[20px] border border-white/[0.08] bg-[#12121a] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#10B981]/30 hover:shadow-lg hover:shadow-[#10B981]/[0.05] ${
                item.span === 2 ? 'sm:col-span-2 lg:col-span-2' : ''
              }`}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#10B981]/[0.1] text-xl">
                {item.emoji}
              </div>
              <h3 className="font-heading text-base font-semibold text-white">
                {item.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#8a8a9a]">
                {item.description}
              </p>
              {item.animated === 'table' && <MiniTableAnimation />}
              {item.animated === 'bars' && <MiniBarsAnimation />}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ───────────────────────────────────────────────────────────── */
/*  Core Promise                                                 */
/* ───────────────────────────────────────────────────────────── */

function CorePromise() {
  return (
    <section className="border-t border-white/[0.06] px-6 py-16 sm:py-20 lg:px-8">
      <motion.div
        className="mx-auto max-w-3xl text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={staggerContainer}
      >
        <motion.h2
          variants={fadeInUp}
          transition={{ duration: 0.5 }}
          className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl"
        >
          From logged hours to real readiness.
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 text-base leading-relaxed text-[#8a8a9a] sm:text-lg"
        >
          CrossCheck turns logged flights into clarity, readiness, and strategic
          visibility. Track every flight. Measure real progress. Understand
          where you stand. Build your flying career on evidence, not guesswork.
        </motion.p>
      </motion.div>
    </section>
  )
}

/* ───────────────────────────────────────────────────────────── */
/*  Who It's For                                                 */
/* ───────────────────────────────────────────────────────────── */

const audiences = [
  {
    emoji: '🎓',
    label: 'Student Pilots',
    detail: 'Beginning structured records from your first entry.',
  },
  {
    emoji: '✈️',
    label: 'Time-Building Pilots',
    detail: 'Tracking progress toward career goals with every hour.',
  },
  {
    emoji: '🧭',
    label: 'Instrument & Commercial Students',
    detail: 'Managing complex training requirements with clarity.',
  },
  {
    emoji: '👨‍✈️',
    label: 'Flight Instructors',
    detail: 'Maintaining currency and student records.',
  },
  {
    emoji: '💼',
    label: 'Career-Track Pilots',
    detail: 'Preparing for hiring minimums with objective data.',
  },
  {
    emoji: '🛩️',
    label: 'Professional Pilots',
    detail: 'Maintaining operational discipline and compliance.',
  },
]

function Audience() {
  return (
    <section className="bg-[#12121a] px-6 py-16 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mx-auto mb-12 max-w-2xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={staggerContainer}
        >
          <motion.h2
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl"
          >
            Built for every stage of a flying career
          </motion.h2>
        </motion.div>

        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={staggerFast}
        >
          {audiences.map((item) => (
            <motion.div
              key={item.label}
              variants={fadeInUp}
              transition={{ duration: 0.4 }}
              className="group flex items-start gap-4 rounded-2xl border border-white/[0.08] bg-[#0a0a0f]/50 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.15]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#10B981]/[0.1] text-lg">
                {item.emoji}
              </div>
              <div>
                <h3 className="font-heading text-sm font-semibold text-white">
                  {item.label}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-[#8a8a9a]">
                  {item.detail}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ───────────────────────────────────────────────────────────── */
/*  Pricing — Glass Morphism                                     */
/* ───────────────────────────────────────────────────────────── */

const tiers = [
  {
    name: 'CrossCheck Core',
    price: 'Free',
    description: 'Start with a record you can trust.',
    features: [
      'Digital logbook',
      'Fast flight entry',
      'Structured records',
      'Basic totals',
      'Basic search and filter',
      'Basic dashboard',
      'Mobile-friendly',
    ],
    cta: 'Start Free',
    highlight: false,
  },
  {
    name: 'CrossCheck Mastery',
    price: '$X/mo',
    description: 'Build mastery with clear progress and disciplined tracking.',
    features: [
      'Everything in Core',
      'Currency tracking',
      'Certificate and rating progress',
      'Milestone detection',
      'Cost tracking',
      'Deeper summaries',
      'Record review',
    ],
    cta: 'Start Mastery',
    highlight: true,
  },
  {
    name: 'CrossCheck Command',
    price: '$X/mo',
    description: 'Operate your flying career with precision.',
    features: [
      'Everything in Mastery',
      'Career-readiness tracking',
      'Advanced threshold visibility',
      'Data quality checks',
      'Derived intelligence',
      'Advanced analysis',
      'Premium reports and AI parsing',
    ],
    cta: 'Start Command',
    highlight: false,
  },
]

function Pricing() {
  return (
    <section
      id="pricing"
      className="scroll-mt-16 border-t border-white/[0.06] px-6 py-16 sm:py-20 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mx-auto mb-12 max-w-2xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={staggerContainer}
        >
          <motion.h2
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl"
          >
            Pricing
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-base leading-relaxed text-[#8a8a9a] sm:text-lg"
          >
            Start free. Scale as your career demands more visibility.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid items-center gap-6 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={staggerFast}
        >
          {tiers.map((tier) => (
            <motion.div
              key={tier.name}
              variants={fadeInUp}
              transition={{ duration: 0.4 }}
              className={`glass-card group relative flex flex-col p-8 transition-all duration-300 hover:-translate-y-1 ${
                tier.highlight
                  ? 'scale-[1.02] border-[#10B981]/40 shadow-[0_0_30px_rgba(16,185,129,0.15)] lg:scale-105'
                  : ''
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-[#10B981] px-4 py-1 text-xs font-semibold text-[#0a0a0f] shadow-md shadow-[#10B981]/20">
                    Most Popular
                  </span>
                </div>
              )}
              <h3 className="font-heading text-base font-semibold text-white">
                {tier.name}
              </h3>
              <p className="mt-4 font-heading text-3xl font-bold tracking-tight text-white">
                {tier.price}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#8a8a9a]">
                {tier.description}
              </p>
              <ul className="mt-8 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-[#8a8a9a]"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button
                  asChild
                  className={`w-full ${
                    tier.highlight
                      ? 'glow-teal bg-[#10B981] text-[#0a0a0f] font-semibold hover:bg-[#059669]'
                      : 'border border-white/[0.15] bg-transparent text-white hover:border-white/[0.3] hover:bg-white/[0.05]'
                  }`}
                >
                  <Link href="/signup">{tier.cta}</Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ───────────────────────────────────────────────────────────── */
/*  Final CTA                                                    */
/* ───────────────────────────────────────────────────────────── */

function CTA() {
  return (
    <section className="relative overflow-hidden px-6 py-16 sm:py-20 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute bottom-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-[#10B981]/[0.05] blur-[100px]" />
      </div>

      <motion.div
        className="mx-auto max-w-xl text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={staggerContainer}
      >
        <motion.h2
          variants={fadeInUp}
          transition={{ duration: 0.5 }}
          className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl"
        >
          Start with CrossCheck
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-4 text-base leading-relaxed text-[#8a8a9a] sm:text-lg"
        >
          Every career starts with the first entry. Build yours on a foundation
          designed for where you are headed.
        </motion.p>
        <motion.div
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Button
            asChild
            size="lg"
            className="glow-teal w-full bg-[#10B981] px-8 text-[#0a0a0f] font-semibold transition-all duration-200 hover:bg-[#059669] hover:scale-[1.02] sm:w-auto"
          >
            <Link href="/signup">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
        <motion.p
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-5 text-sm text-[#6b6b7b]"
        >
          Free to start. No credit card required.
        </motion.p>
      </motion.div>
    </section>
  )
}

/* ───────────────────────────────────────────────────────────── */
/*  Page                                                         */
/* ───────────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Problem />
      <FeatureShowcase />
      <CorePromise />
      <Audience />
      <Pricing />
      <CTA />
    </>
  )
}
