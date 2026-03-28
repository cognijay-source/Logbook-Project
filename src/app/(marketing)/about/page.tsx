import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About — CrossCheck',
  description:
    'CrossCheck was built because aviation is structured on paper but opaque in practice.',
}

/* ───────────────────────────────────────────────────────────── */
/*  Values                                                       */
/* ───────────────────────────────────────────────────────────── */

const values = [
  {
    principle: 'Truth over narrative',
    detail: 'Your records reflect what happened, not what sounds good.',
  },
  {
    principle: 'Visibility over ambiguity',
    detail:
      'See where you stand clearly, even when the answer is uncomfortable.',
  },
  {
    principle: 'Mastery over gamification',
    detail: 'Real progress, measured honestly. No badges. No streaks.',
  },
  {
    principle: 'Readiness over vanity metrics',
    detail:
      'What matters is whether you are ready, not whether a number looks impressive.',
  },
  {
    principle: 'Structure over clutter',
    detail: 'Clean records, clean interface, clean data. Nothing unnecessary.',
  },
  {
    principle: 'Trust over novelty',
    detail:
      'Reliable, precise, and consistent. The tool earns trust by working every time.',
  },
]

/* ───────────────────────────────────────────────────────────── */
/*  Page                                                         */
/* ───────────────────────────────────────────────────────────── */

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="px-6 pt-24 pb-12 sm:pt-32 sm:pb-16 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl">
            About CrossCheck
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[#8a8a9a] sm:text-lg">
            Built because aviation is structured on paper but opaque in
            practice.
          </p>
        </div>
      </section>

      {/* Origin */}
      <section className="border-t border-white/[0.06] px-6 py-16 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Why CrossCheck exists
          </h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-[#8a8a9a]">
            <p>
              Aviation demands precision. Regulations are specific. Standards
              are measurable. Progress is quantifiable. Yet the tools most
              pilots use to track their careers are paper logbooks, scattered
              spreadsheets, and mental math.
            </p>
            <p>
              The result is an industry where pilots are expected to know
              exactly where they stand but given few tools that actually make
              that possible. Currency lapses go unnoticed. Training gaps stay
              invisible. Career readiness is guessed at, not measured.
            </p>
            <p>
              CrossCheck was built to close that gap. Not with another app that
              looks like a paper logbook on a screen, but with a structured
              operating system that turns flight records into clarity, progress,
              and readiness.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-[#12121a] px-6 py-16 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Mission
          </h2>
          <p className="mt-6 text-base leading-relaxed text-[#8a8a9a]">
            Help pilots navigate an opaque industry with cleaner records,
            clearer progress, and more objective readiness. CrossCheck exists so
            that every pilot can see the system clearly and build mastery
            deliberately.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-white/[0.06] px-6 py-16 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading mb-10 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Values
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {values.map((v) => (
              <div
                key={v.principle}
                className="rounded-2xl border border-white/[0.08] bg-[#12121a] p-5 transition-all duration-300 hover:border-white/[0.15]"
              >
                <h3 className="font-heading text-base font-semibold text-white">
                  {v.principle}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#8a8a9a]">
                  {v.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
