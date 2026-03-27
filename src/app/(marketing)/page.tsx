'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  Check,
  GraduationCap,
  Plane,
  Target,
} from 'lucide-react'
import { motion } from 'framer-motion'

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
      staggerChildren: 0.08,
    },
  },
}

/* ───────────────────────────────────────────────────────────── */
/*  Hero                                                         */
/* ───────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[var(--bg-primary)] px-6 pt-28 pb-32 sm:pt-36 sm:pb-40 lg:px-8 lg:pt-44 lg:pb-48">
      {/* Subtle radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute top-1/3 left-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent-teal)]/[0.07] blur-[120px]" />
      </div>

      <motion.div
        className="mx-auto max-w-3xl text-center"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div
          variants={fadeInUp}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--text-primary)]/10 bg-white px-4 py-1.5 font-mono text-sm text-[var(--text-secondary)]"
        >
          <span>The Pilot Operating System</span>
        </motion.div>

        <motion.h1
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="font-heading text-5xl leading-[1.05] font-bold tracking-tight text-[var(--text-primary)] sm:text-6xl lg:text-7xl"
        >
          ✈️ CrossCheck
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-5 text-xl leading-relaxed font-medium text-[var(--text-primary)] sm:text-2xl"
        >
          See the system clearly. Build mastery deliberately.
        </motion.p>

        <motion.p
          variants={fadeInUp}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)]"
        >
          The pilot operating system for flight records, training progress,
          currency, costs, and career readiness.
        </motion.p>

        <motion.div
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/signup"
            className="btn-primary inline-flex w-full items-center justify-center text-base sm:w-auto"
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link
            href="#features"
            className="btn-outline inline-flex w-full items-center justify-center text-base sm:w-auto"
          >
            See Features
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ───────────────────────────────────────────────────────────── */
/*  Problem                                                      */
/* ───────────────────────────────────────────────────────────── */

function Problem() {
  return (
    <section className="bg-white px-6 py-28 sm:py-36 lg:px-8">
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
          className="font-heading text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl"
        >
          Aviation runs on records. Too often, careers run on ambiguity.
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 text-lg leading-relaxed text-[var(--text-secondary)]"
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
/*  Feature Showcase                                              */
/* ───────────────────────────────────────────────────────────── */

const suiteFeatures = [
  {
    emoji: '📖',
    name: 'CrossCheck Logbook',
    description:
      'Clean, structured, reliable digital flight records. Fast entry. Smart search. Automatic totals.',
  },
  {
    emoji: '🔄',
    name: 'CrossCheck Currency',
    description:
      'Track recency requirements. See upcoming lapses. Stay operationally current.',
  },
  {
    emoji: '🏆',
    name: 'CrossCheck Mastery',
    description:
      'Monitor certificates, ratings, training progression, and milestone development.',
  },
  {
    emoji: '🎯',
    name: 'CrossCheck Ready',
    description:
      'Understand actual readiness for certifications, career goals, and hiring thresholds.',
  },
  {
    emoji: '💰',
    name: 'CrossCheck Costs',
    description:
      'Track cost per flight, aircraft, training block, and time period.',
  },
  {
    emoji: '📊',
    name: 'CrossCheck Daily',
    description:
      'Your operational dashboard. Recent activity, progress, currency, and what needs attention.',
  },
]

function FeatureShowcase() {
  return (
    <section id="features" className="scroll-mt-16 bg-[var(--bg-primary)] px-6 py-28 sm:py-36 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mx-auto mb-16 max-w-2xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={staggerContainer}
        >
          <motion.h2
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="font-heading text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl"
          >
            The CrossCheck Suite
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)]"
          >
            Six integrated modules. One operating system for your flying career.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={staggerContainer}
        >
          {suiteFeatures.map((item) => (
            <motion.div
              key={item.name}
              variants={fadeInUp}
              transition={{ duration: 0.4 }}
              className="card-elevated p-6"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-teal)]/10 text-lg">
                {item.emoji}
              </div>
              <h3 className="font-heading text-sm font-semibold text-[var(--text-primary)]">
                {item.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                {item.description}
              </p>
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
    <section className="bg-white px-6 py-28 sm:py-36 lg:px-8">
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
          className="font-heading text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl"
        >
          From logged hours to real readiness.
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 text-lg leading-relaxed text-[var(--text-secondary)]"
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
    icon: GraduationCap,
    label: 'Student Pilots',
    detail: 'Beginning structured records from your first entry.',
  },
  {
    icon: Plane,
    label: 'Time-Building Pilots',
    detail: 'Tracking progress toward career goals with every hour.',
  },
  {
    icon: Target,
    label: 'Instrument & Commercial Students',
    detail: 'Managing complex training requirements with clarity.',
  },
]

function Audience() {
  return (
    <section className="bg-[var(--bg-navy)] px-6 py-28 sm:py-36 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mx-auto mb-16 max-w-2xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={staggerContainer}
        >
          <motion.h2
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Built for every stage of a flying career
          </motion.h2>
        </motion.div>

        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={staggerContainer}
        >
          {audiences.map((item) => (
            <motion.div
              key={item.label}
              variants={fadeInUp}
              transition={{ duration: 0.4 }}
              className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-teal)]/15">
                <item.icon className="h-5 w-5 text-[var(--accent-teal)]" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-semibold text-white">
                  {item.label}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-white/60">
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
/*  Pricing                                                      */
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
      className="scroll-mt-16 bg-[var(--bg-primary)] px-6 py-28 sm:py-36 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mx-auto mb-16 max-w-2xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={staggerContainer}
        >
          <motion.h2
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="font-heading text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl"
          >
            Pricing
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)]"
          >
            Start free. Scale as your career demands more visibility.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid items-center gap-6 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={staggerContainer}
        >
          {tiers.map((tier) => (
            <motion.div
              key={tier.name}
              variants={fadeInUp}
              transition={{ duration: 0.4 }}
              className={`group relative flex flex-col rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                tier.highlight
                  ? 'scale-[1.02] border-[var(--accent-teal)]/40 bg-white shadow-lg shadow-[var(--accent-teal)]/10 lg:scale-105'
                  : 'border-[var(--text-primary)]/6 bg-white'
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-[var(--accent-teal)] to-[var(--accent-teal-hover)] px-4 py-1 text-xs font-semibold text-white shadow-md shadow-[var(--accent-teal)]/20">
                    Most Popular
                  </span>
                </div>
              )}
              <h3 className="font-heading text-base font-semibold text-[var(--text-primary)]">
                {tier.name}
              </h3>
              <p className="mt-4 font-heading text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                {tier.price}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                {tier.description}
              </p>
              <ul className="mt-8 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-[var(--text-secondary)]"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-teal)]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button
                  asChild
                  className={`w-full ${
                    tier.highlight
                      ? 'btn-primary justify-center py-3'
                      : 'btn-outline justify-center py-3'
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
    <section className="bg-[var(--bg-navy)] px-6 py-28 sm:py-36 lg:px-8">
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
          className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          Start with CrossCheck
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-4 text-lg leading-relaxed text-white/70"
        >
          Every career starts with the first entry. Build yours on a foundation
          designed for where you are headed.
        </motion.p>
        <motion.div
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Link
            href="/signup"
            className="btn-primary inline-flex w-full items-center justify-center text-base sm:w-auto"
          >
            ✈️ Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </motion.div>
        <motion.p
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-5 text-sm text-white/50"
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
