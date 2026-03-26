'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  Target,
  DollarSign,
  Award,
  Compass,
  LayoutDashboard,
  ArrowRight,
  Clock,
  Check,
  GraduationCap,
  Plane,
  Wrench,
  Briefcase,
  Users,
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
    <section className="relative overflow-hidden px-6 pt-28 pb-32 sm:pt-36 sm:pb-40 lg:px-8 lg:pt-44 lg:pb-48">
      {/* Subtle radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute top-1/3 left-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00d4aa]/[0.07] blur-[120px]" />
        <div className="absolute top-2/3 right-1/3 h-[300px] w-[300px] rounded-full bg-[#00d4aa]/[0.04] blur-[80px]" />
        {/* Dot grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
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
        variants={staggerContainer}
      >
        <motion.div
          variants={fadeInUp}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5 text-sm text-[#8a8a9a] backdrop-blur-sm"
        >
          <Clock className="h-3.5 w-3.5 text-[#00d4aa]" />
          <span>The Pilot Operating System</span>
        </motion.div>

        <motion.h1
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="font-heading text-5xl leading-[1.05] font-bold tracking-tight sm:text-6xl lg:text-7xl"
        >
          <span className="bg-gradient-to-r from-white to-[#00d4aa] bg-clip-text text-transparent">
            CrossCheck
          </span>
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-5 text-xl leading-relaxed font-medium text-[#c0c0cc] sm:text-2xl"
        >
          See the system clearly. Build mastery deliberately.
        </motion.p>

        <motion.p
          variants={fadeInUp}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#8a8a9a]"
        >
          The pilot operating system for flight records, training progress,
          currency, costs, and career readiness.
        </motion.p>

        <motion.div
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button
            asChild
            size="lg"
            className="w-full bg-[#00d4aa] px-8 text-[#0a0a0f] font-semibold shadow-lg shadow-[#00d4aa]/25 transition-all duration-200 hover:bg-[#00e8bb] hover:shadow-xl hover:shadow-[#00d4aa]/30 hover:scale-[1.02] sm:w-auto"
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
    </section>
  )
}

/* ───────────────────────────────────────────────────────────── */
/*  Problem                                                      */
/* ───────────────────────────────────────────────────────────── */

function Problem() {
  return (
    <section className="border-t border-white/[0.06] px-6 py-28 sm:py-36 lg:px-8">
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
          className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          Aviation runs on records. Too often, careers run on ambiguity.
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 text-lg leading-relaxed text-[#8a8a9a]"
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
    icon: BookOpen,
    name: 'CrossCheck Logbook',
    description:
      'Clean, structured, reliable digital flight records. Fast entry. Smart search. Automatic totals.',
  },
  {
    icon: Clock,
    name: 'CrossCheck Currency',
    description:
      'Track recency requirements. See upcoming lapses. Stay operationally current.',
  },
  {
    icon: Award,
    name: 'CrossCheck Mastery',
    description:
      'Monitor certificates, ratings, training progression, and milestone development.',
  },
  {
    icon: Compass,
    name: 'CrossCheck Ready',
    description:
      'Understand actual readiness for certifications, career goals, and hiring thresholds.',
  },
  {
    icon: DollarSign,
    name: 'CrossCheck Costs',
    description:
      'Track cost per flight, aircraft, training block, and time period. See where the money goes.',
  },
  {
    icon: LayoutDashboard,
    name: 'CrossCheck Daily',
    description:
      'Your operational dashboard. Recent activity, progress, currency, and what needs attention next.',
  },
]

function FeatureShowcase() {
  return (
    <section id="features" className="scroll-mt-16 px-6 py-28 sm:py-36 lg:px-8">
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
            The CrossCheck Suite
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg leading-relaxed text-[#8a8a9a]"
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
              className="group rounded-2xl border border-white/[0.08] bg-[#12121a] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#00d4aa]/40 hover:shadow-lg hover:shadow-[#00d4aa]/[0.05]"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#00d4aa]/[0.08] transition-colors duration-300 group-hover:bg-[#00d4aa]/[0.15]">
                <item.icon className="h-5 w-5 text-[#8a8a9a] transition-colors duration-300 group-hover:text-[#00d4aa]" />
              </div>
              <h3 className="font-heading text-sm font-semibold text-white">
                {item.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#8a8a9a]">
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
    <section className="border-t border-white/[0.06] px-6 py-28 sm:py-36 lg:px-8">
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
          className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          From logged hours to real readiness.
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 text-lg leading-relaxed text-[#8a8a9a]"
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
  {
    icon: Wrench,
    label: 'Flight Instructors',
    detail: 'Maintaining currency and records across students and aircraft.',
  },
  {
    icon: Briefcase,
    label: 'Career-Track Pilots',
    detail: 'Preparing for hiring minimums with objective evidence.',
  },
  {
    icon: Users,
    label: 'Professional Pilots',
    detail: 'Maintaining operational discipline throughout a career.',
  },
]

function Audience() {
  return (
    <section className="bg-white/[0.02] px-6 py-28 sm:py-36 lg:px-8">
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
              className="group flex items-start gap-4 rounded-xl border border-white/[0.08] bg-[#12121a] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.15] hover:shadow-md hover:shadow-black/20"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#00d4aa]/[0.08]">
                <item.icon className="h-5 w-5 text-[#00d4aa]" />
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
      className="scroll-mt-16 border-t border-white/[0.06] px-6 py-28 sm:py-36 lg:px-8"
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
            className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Pricing
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg leading-relaxed text-[#8a8a9a]"
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
                  ? 'scale-[1.02] border-[#00d4aa]/40 bg-[#12121a] shadow-lg shadow-[#00d4aa]/[0.08] lg:scale-105'
                  : 'border-white/[0.08] bg-[#12121a]'
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-[#00d4aa] px-4 py-1 text-xs font-semibold text-[#0a0a0f] shadow-md shadow-[#00d4aa]/20">
                    Most Popular
                  </span>
                </div>
              )}
              <h3 className="font-heading text-base font-semibold text-white">
                {tier.name}
              </h3>
              <p className="mt-4 text-3xl font-bold tracking-tight text-white">
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
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00d4aa]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button
                  asChild
                  className={`w-full ${
                    tier.highlight
                      ? 'bg-[#00d4aa] text-[#0a0a0f] font-semibold shadow-md shadow-[#00d4aa]/25 hover:bg-[#00e8bb] hover:shadow-lg'
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
    <section className="relative overflow-hidden px-6 py-28 sm:py-36 lg:px-8">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute bottom-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-[#00d4aa]/[0.05] blur-[100px]" />
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
          className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          Start with CrossCheck
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-4 text-lg leading-relaxed text-[#8a8a9a]"
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
            className="w-full bg-[#00d4aa] px-8 text-[#0a0a0f] font-semibold shadow-lg shadow-[#00d4aa]/25 transition-all duration-200 hover:bg-[#00e8bb] hover:shadow-xl hover:shadow-[#00d4aa]/30 hover:scale-[1.02] sm:w-auto"
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
