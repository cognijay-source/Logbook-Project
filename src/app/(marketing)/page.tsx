import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  Target,
  DollarSign,
  Award,
  BarChart3,
  FileUp,
  Plane,
  GraduationCap,
  Users,
  ArrowRight,
  Shield,
  Database,
  Brain,
  Clock,
} from 'lucide-react'

/* ───────────────────────────────────────────────────────────── */
/*  Hero                                                         */
/* ───────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-24 pb-28 sm:pt-32 sm:pb-36 lg:px-8 lg:pt-40 lg:pb-44">
      {/* Subtle background gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="bg-muted/50 absolute top-0 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl text-center">
        <div className="border-border/60 bg-muted/50 text-muted-foreground mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm">
          <Clock className="h-3.5 w-3.5" />
          <span>Intelligent pilot logbook</span>
        </div>

        <h1 className="text-foreground text-4xl leading-[1.1] font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Your hours are building something.{' '}
          <span className="text-muted-foreground">Know exactly what.</span>
        </h1>

        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl">
          Track every flight with precision. Measure your progress toward
          certificates and career thresholds. Always know where you stand and
          what comes next.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="w-full px-8 sm:w-auto">
            <Link href="/signup">
              Create Your Logbook
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full px-8 sm:w-auto"
          >
            <Link href="#features">See How It Works</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────────────────────────────────────────── */
/*  Value Proposition                                            */
/* ───────────────────────────────────────────────────────────── */

const values = [
  {
    icon: BookOpen,
    title: 'Precision Logging',
    description:
      'Every leg, approach, and crew member captured with the detail your career demands. No shortcuts.',
  },
  {
    icon: Target,
    title: 'Readiness Tracking',
    description:
      'Set goal profiles for your next certificate or position. See exactly where you stand and what remains.',
  },
  {
    icon: DollarSign,
    title: 'Financial Position',
    description:
      "Training costs, income, and career-phase totals. Know what you've invested and what you've earned.",
  },
  {
    icon: Award,
    title: 'Milestone Detection',
    description:
      'Automatic recognition of career thresholds as you reach them. Your trajectory, documented.',
  },
]

function ValueProposition() {
  return (
    <section className="border-border/40 border-t px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            More than a digital logbook
          </h2>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            Not a replica of your paper logbook. A career system built around
            how serious pilots track, measure, and advance.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((item) => (
            <div
              key={item.title}
              className="group border-border/60 bg-card hover:border-border hover:bg-muted/30 rounded-2xl border p-6 transition-colors"
            >
              <div className="bg-foreground/5 mb-4 flex h-10 w-10 items-center justify-center rounded-lg">
                <item.icon className="text-foreground h-5 w-5" />
              </div>
              <h3 className="text-foreground text-sm font-semibold">
                {item.title}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
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
    detail: 'Build structure and discipline from your first entry.',
  },
  {
    icon: Plane,
    label: 'Time Builders',
    detail: 'Every hour measured. Every threshold within sight.',
  },
  {
    icon: Users,
    label: 'Regional & 135 Pilots',
    detail: 'Multi-leg days, crew tracking, and complex schedules.',
  },
  {
    icon: Award,
    label: 'Career Captains',
    detail: 'Your complete record, structured and searchable.',
  },
]

function Audience() {
  return (
    <section className="bg-muted/30 px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            From student to captain
          </h2>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            One logbook from first solo to thousandth leg.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {audiences.map((item) => (
            <div
              key={item.label}
              className="bg-background ring-border/50 flex flex-col items-center rounded-xl p-8 text-center shadow-sm ring-1"
            >
              <div className="bg-foreground/5 flex h-12 w-12 items-center justify-center rounded-full">
                <item.icon className="text-foreground h-5 w-5" />
              </div>
              <h3 className="text-foreground mt-5 text-sm font-semibold">
                {item.label}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────────────────────────────────────────── */
/*  Features                                                     */
/* ───────────────────────────────────────────────────────────── */

const features = [
  {
    icon: BookOpen,
    title: 'Flight Logging',
    description:
      'Multi-leg entries, approaches, crew, and a draft workflow. Log now, finalize later. The full picture of every flight.',
  },
  {
    icon: Target,
    title: 'Career Progress',
    description:
      'Set goal profiles for certificates and positions. Gap analysis shows exactly what stands between you and your next threshold.',
  },
  {
    icon: Award,
    title: 'Milestone Timeline',
    description:
      'Automatic detection as you reach career benchmarks. First solo to type rating, documented as it happens.',
  },
  {
    icon: BarChart3,
    title: 'Experience Analytics',
    description:
      'Breakdowns by aircraft, category, conditions, and period. Identify strengths and gaps before an interviewer does.',
  },
  {
    icon: DollarSign,
    title: 'Money Tracking',
    description:
      'Training costs, checkride fees, and income by career phase. See the true cost and return of your flying.',
  },
  {
    icon: FileUp,
    title: 'Import & Smart Entry',
    description:
      'CSV imports from existing logbooks. AI-assisted draft entry parses flight details and stages them for your review.',
  },
]

function Features() {
  return (
    <section
      id="features"
      className="border-border/40 scroll-mt-16 border-t px-6 py-24 sm:py-32 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            Built for the way pilots advance
          </h2>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            Purpose-built for the complexity of a real aviation career.
          </p>
        </div>

        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((item) => (
            <div key={item.title} className="flex gap-4">
              <div className="bg-foreground/5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                <item.icon className="text-foreground h-5 w-5" />
              </div>
              <div>
                <h3 className="text-foreground text-sm leading-6 font-semibold">
                  {item.title}
                </h3>
                <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────────────────────────────────────────── */
/*  Trust / Credibility                                          */
/* ───────────────────────────────────────────────────────────── */

const differentiators = [
  {
    icon: Database,
    title: 'Structured Data',
    description:
      'Normalized, queryable records. Not flat files or PDFs. Data you can analyze, export, and rely on.',
  },
  {
    icon: Brain,
    title: 'Derived Insight',
    description:
      'Automatic calculations, readiness scoring, and gap detection. Your logbook measures your trajectory.',
  },
  {
    icon: Shield,
    title: 'Career-Grade Integrity',
    description:
      'Your records deserve the same precision you bring to the cockpit. Audit trails, data integrity, secure storage.',
  },
]

function Trust() {
  return (
    <section className="bg-muted/30 px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            Engineered for precision
          </h2>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            Not a photocopy of your paper logbook. A career instrument that
            turns hours into measurable progress.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {differentiators.map((item) => (
            <div
              key={item.title}
              className="border-border/60 bg-background rounded-2xl border p-8 text-center"
            >
              <div className="bg-foreground/5 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                <item.icon className="text-foreground h-5 w-5" />
              </div>
              <h3 className="text-foreground mt-6 text-sm font-semibold">
                {item.title}
              </h3>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────────────────────────────────────────── */
/*  Final CTA                                                    */
/* ───────────────────────────────────────────────────────────── */

function CTA() {
  return (
    <section className="border-border/40 border-t px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
          Start your logbook
        </h2>
        <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
          Every career starts with the first entry. Build yours on a foundation
          designed for where you are headed.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="w-full px-8 sm:w-auto">
            <Link href="/signup">
              Create Your Logbook
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <p className="text-muted-foreground mt-5 text-sm">
          Free to start. No credit card required.
        </p>
      </div>
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
      <ValueProposition />
      <Audience />
      <Features />
      <Trust />
      <CTA />
    </>
  )
}
