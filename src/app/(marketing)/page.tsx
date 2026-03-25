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
          <span>Pilot logbook &amp; career tracker</span>
        </div>

        <h1 className="text-foreground text-4xl leading-[1.1] font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Your flight time tells a story.{' '}
          <span className="text-muted-foreground">Make it count.</span>
        </h1>

        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl">
          The logbook built for career progression. Track every hour with
          precision, surface the intelligence your experience contains, and
          always know exactly where you stand.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="w-full px-8 sm:w-auto">
            <Link href="/signup">
              Start Logging
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full px-8 sm:w-auto"
          >
            <Link href="#features">Learn More</Link>
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
      'Every leg, approach, and crew member captured with the detail your career demands. No shortcuts, no approximations.',
  },
  {
    icon: Target,
    title: 'Career Intelligence',
    description:
      'Goal profiles, readiness tracking, and gap analysis that turn raw hours into a clear picture of where you stand.',
  },
  {
    icon: DollarSign,
    title: 'Financial Clarity',
    description:
      "Training costs, income tracking, and career-phase financial intelligence. Know what you've invested and what you've earned.",
  },
  {
    icon: Award,
    title: 'Milestone Tracking',
    description:
      'Automatic detection of career milestones as they happen. Your progression documented, your trajectory visible.',
  },
]

function ValueProposition() {
  return (
    <section className="border-border/40 border-t px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            A logbook that works as hard as you do
          </h2>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            Not another digital replica of a paper logbook. A system built for
            the way serious pilots think about their careers.
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
    detail: 'Build your foundation with structure from day one.',
  },
  {
    icon: Plane,
    label: 'Time Builders',
    detail: 'Every hour counted, every milestone within sight.',
  },
  {
    icon: Users,
    label: 'Regional & 135 Pilots',
    detail: 'Complex schedules, multi-leg days, crew tracking handled.',
  },
  {
    icon: Award,
    label: 'Career Captains',
    detail: 'Your complete aviation career, structured and searchable.',
  },
]

function Audience() {
  return (
    <section className="bg-muted/30 px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            Built for every stage of your career
          </h2>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            From your first solo to your thousandth leg. One logbook that grows
            with you.
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
      'Multi-leg entries, instrument approaches, crew details, and a draft workflow that lets you log now and finalize later. Capture the full picture of every flight.',
  },
  {
    icon: Target,
    title: 'Career Progress',
    description:
      'Define goal profiles for your next certificate or position. Readiness tracking and gap analysis show exactly what stands between you and your next milestone.',
  },
  {
    icon: Award,
    title: 'Milestone Timeline',
    description:
      'Automatic milestone detection as you hit career benchmarks. Your journey from first flight to type rating, visualized and documented.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description:
      'Deep experience breakdowns by aircraft type, category, conditions, and time period. Understand your strengths and identify gaps before an interviewer does.',
  },
  {
    icon: DollarSign,
    title: 'Money Tracking',
    description:
      'Training costs, checkride fees, equipment expenses, and income tracking. Career-phase financial intelligence that shows the true cost and return of your flying.',
  },
  {
    icon: FileUp,
    title: 'Import & Smart Entry',
    description:
      'CSV imports from existing logbooks and digital sources. AI-assisted draft entry parses your flight details and stages them for review.',
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
            Every tool a serious pilot needs
          </h2>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            Purpose-built features that respect the complexity of a real
            aviation career.
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
      'Your logbook stored in a normalized, queryable format. Not flat files. Not PDFs. Real structured data you can analyze, export, and rely on.',
  },
  {
    icon: Brain,
    title: 'Derived Intelligence',
    description:
      "Automatic calculations, trend detection, and readiness scoring. Your logbook doesn't just record -- it understands your trajectory.",
  },
  {
    icon: Shield,
    title: 'Career-Grade Reliability',
    description:
      'Your flight records deserve the same precision you bring to the cockpit. Audit trails, data integrity, and secure cloud storage.',
  },
]

function Trust() {
  return (
    <section className="bg-muted/30 px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            Built for pilots who take their career seriously
          </h2>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            This is not a digital photocopy of your paper logbook. It is a
            career instrument engineered to surface the intelligence your hours
            contain.
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
          Begin your logbook
        </h2>
        <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
          Every career starts with the first entry. Build yours on a foundation
          designed for where you are headed.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="w-full px-8 sm:w-auto">
            <Link href="/signup">
              Start Logging
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
