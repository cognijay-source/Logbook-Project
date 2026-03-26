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
      <section className="px-6 pt-24 pb-16 sm:pt-32 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
            About CrossCheck
          </h1>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            Built because aviation is structured on paper but opaque in
            practice.
          </p>
        </div>
      </section>

      {/* Origin */}
      <section className="border-border/40 border-t px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            Why CrossCheck exists
          </h2>
          <div className="text-muted-foreground mt-6 space-y-4 text-base leading-relaxed">
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
      <section className="bg-muted/30 px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            Mission
          </h2>
          <p className="text-muted-foreground mt-6 text-base leading-relaxed">
            Help pilots navigate an opaque industry with cleaner records,
            clearer progress, and more objective readiness. CrossCheck exists so
            that every pilot can see the system clearly and build mastery
            deliberately.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="border-border/40 border-t px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-foreground mb-12 text-2xl font-bold tracking-tight sm:text-3xl">
            Values
          </h2>
          <div className="grid gap-8 sm:grid-cols-2">
            {values.map((v) => (
              <div key={v.principle}>
                <h3 className="text-foreground text-base font-semibold">
                  {v.principle}
                </h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
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
