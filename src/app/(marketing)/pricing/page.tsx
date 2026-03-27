import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — CrossCheck',
  description:
    'Start free with CrossCheck Core. Scale to Mastery or Command as your flying career demands more visibility.',
}

/* ───────────────────────────────────────────────────────────── */
/*  Tier data                                                    */
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

/* ───────────────────────────────────────────────────────────── */
/*  Feature comparison                                           */
/* ───────────────────────────────────────────────────────────── */

interface ComparisonRow {
  feature: string
  core: boolean
  mastery: boolean
  command: boolean
}

const comparisonRows: ComparisonRow[] = [
  { feature: 'Digital logbook', core: true, mastery: true, command: true },
  { feature: 'Fast flight entry', core: true, mastery: true, command: true },
  { feature: 'Structured records', core: true, mastery: true, command: true },
  { feature: 'Basic totals', core: true, mastery: true, command: true },
  {
    feature: 'Basic search and filter',
    core: true,
    mastery: true,
    command: true,
  },
  { feature: 'Basic dashboard', core: true, mastery: true, command: true },
  { feature: 'Mobile-friendly', core: true, mastery: true, command: true },
  {
    feature: 'Currency tracking',
    core: false,
    mastery: true,
    command: true,
  },
  {
    feature: 'Certificate and rating progress',
    core: false,
    mastery: true,
    command: true,
  },
  {
    feature: 'Milestone detection',
    core: false,
    mastery: true,
    command: true,
  },
  { feature: 'Cost tracking', core: false, mastery: true, command: true },
  { feature: 'Deeper summaries', core: false, mastery: true, command: true },
  { feature: 'Record review', core: false, mastery: true, command: true },
  {
    feature: 'Career-readiness tracking',
    core: false,
    mastery: false,
    command: true,
  },
  {
    feature: 'Advanced threshold visibility',
    core: false,
    mastery: false,
    command: true,
  },
  {
    feature: 'Data quality checks',
    core: false,
    mastery: false,
    command: true,
  },
  {
    feature: 'Derived intelligence',
    core: false,
    mastery: false,
    command: true,
  },
  {
    feature: 'Advanced analysis',
    core: false,
    mastery: false,
    command: true,
  },
  {
    feature: 'Premium reports and AI parsing',
    core: false,
    mastery: false,
    command: true,
  },
]

/* ───────────────────────────────────────────────────────────── */
/*  FAQ                                                          */
/* ───────────────────────────────────────────────────────────── */

const faqs = [
  {
    question: 'What is CrossCheck?',
    answer:
      'CrossCheck is a pilot operating system for flight records, training progress, currency, costs, and career readiness. It turns logged flights into clarity and strategic visibility.',
  },
  {
    question: 'Who is CrossCheck for?',
    answer:
      'Student pilots, time builders, instrument and commercial students, flight instructors, career-track pilots preparing for hiring minimums, and professional pilots maintaining operational discipline.',
  },
  {
    question: 'Can I import my existing logbook?',
    answer:
      'Yes. CrossCheck supports CSV imports from existing digital logbooks. The Command tier also includes AI-assisted parsing to stage flight entries for your review.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Your records are stored in a secure, encrypted database with row-level security. Files are stored in private, authenticated storage. Your data is yours.',
  },
  {
    question: 'Can I use CrossCheck on mobile?',
    answer:
      'CrossCheck is fully responsive and works on any modern mobile browser. Log flights, check currency, and review progress from anywhere.',
  },
  {
    question: "What's the difference between Mastery and Command?",
    answer:
      'Mastery adds currency tracking, cost tracking, certificate progress, and milestone detection. Command adds career-readiness tracking, advanced threshold visibility, data quality checks, derived intelligence, and AI parsing.',
  },
]

/* ───────────────────────────────────────────────────────────── */
/*  Page                                                         */
/* ───────────────────────────────────────────────────────────── */

function Dot({ active }: { active: boolean }) {
  return active ? (
    <Check className="mx-auto h-4 w-4 text-[#10B981]" />
  ) : (
    <span className="mx-auto block text-sm text-[#6b6b7b]">&mdash;</span>
  )
}

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="px-6 pt-24 pb-12 sm:pt-32 sm:pb-16 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Pricing
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[#8a8a9a] sm:text-lg">
            Start free. Scale as your career demands more visibility.
          </p>
        </div>
      </section>

      {/* Tier cards — Glass Morphism */}
      <section className="px-6 pb-16 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`glass-card relative flex flex-col p-8 transition-all duration-300 hover:-translate-y-1 ${
                tier.highlight
                  ? 'border-[#10B981]/40 shadow-[0_0_30px_rgba(16,185,129,0.15)]'
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
              <h2 className="font-heading text-base font-semibold text-white">
                {tier.name}
              </h2>
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
            </div>
          ))}
        </div>
      </section>

      {/* Feature comparison table */}
      <section className="border-t border-white/[0.06] px-6 py-16 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-heading mb-10 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Feature comparison
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#12121a]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="px-4 py-4 text-left font-medium text-[#8a8a9a]">
                    Feature
                  </th>
                  <th className="px-4 py-4 text-center font-medium text-[#8a8a9a]">
                    Core
                  </th>
                  <th className="px-4 py-4 text-center font-medium text-[#8a8a9a]">
                    Mastery
                  </th>
                  <th className="px-4 py-4 text-center font-medium text-[#8a8a9a]">
                    Command
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr
                    key={row.feature}
                    className="border-b border-white/[0.04] last:border-0"
                  >
                    <td className="px-4 py-3 pr-4 text-[#c0c0cc]">
                      {row.feature}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Dot active={row.core} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Dot active={row.mastery} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Dot active={row.command} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#12121a] px-6 py-16 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading mb-10 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-2xl border border-white/[0.08] bg-[#0a0a0f]/50 p-5"
              >
                <h3 className="font-heading text-base font-semibold text-white">
                  {faq.question}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#8a8a9a]">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
