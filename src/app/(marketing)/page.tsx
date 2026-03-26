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

/* ───────────────────────────────────────────────────────────── */
/*  Hero                                                         */
/* ───────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-24 pb-28 sm:pt-32 sm:pb-36 lg:px-8 lg:pt-40 lg:pb-44">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="bg-muted/50 absolute top-0 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl text-center">
        <div className="border-border/60 bg-muted/50 text-muted-foreground mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm">
          <Clock className="h-3.5 w-3.5" />
          <span>The Pilot Operating System</span>
        </div>

        <h1 className="text-foreground text-4xl leading-[1.1] font-bold tracking-tight sm:text-5xl lg:text-6xl">
          CrossCheck
        </h1>

        <p className="text-muted-foreground mt-4 text-xl leading-relaxed font-medium sm:text-2xl">
          See the system clearly. Build mastery deliberately.
        </p>

        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-relaxed">
          The pilot operating system for flight records, training progress,
          currency, costs, and career readiness.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="w-full px-8 sm:w-auto">
            <Link href="/signup">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full px-8 sm:w-auto"
          >
            <Link href="#features">See Features</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────────────────────────────────────────── */
/*  Problem                                                      */
/* ───────────────────────────────────────────────────────────── */

function Problem() {
  return (
    <section className="border-border/40 border-t px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
          Aviation runs on records. Too often, careers run on ambiguity.
        </h2>
        <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
          Pilots are expected to track standards, progress, costs, and readiness
          in a system that often lacks clarity. Paper logbooks, scattered
          spreadsheets, and manual calculations leave gaps where precision
          matters most. CrossCheck makes that system legible.
        </p>
      </div>
    </section>
  )
}

/* ───────────────────────────────────────────────────────────── */
/*  Feature Showcase — The CrossCheck Suite                       */
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
    <section
      id="features"
      className="bg-muted/30 scroll-mt-16 px-6 py-24 sm:py-32 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            The CrossCheck Suite
          </h2>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            Six integrated modules. One operating system for your flying career.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {suiteFeatures.map((item) => (
            <div
              key={item.name}
              className="border-border/60 bg-background hover:border-border rounded-2xl border p-6 transition-colors"
            >
              <div className="bg-foreground/5 mb-4 flex h-10 w-10 items-center justify-center rounded-lg">
                <item.icon className="text-foreground h-5 w-5" />
              </div>
              <h3 className="text-foreground text-sm font-semibold">
                {item.name}
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
/*  Core Promise                                                 */
/* ───────────────────────────────────────────────────────────── */

function CorePromise() {
  return (
    <section className="border-border/40 border-t px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
          From logged hours to real readiness.
        </h2>
        <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
          CrossCheck turns logged flights into clarity, readiness, and strategic
          visibility. Track every flight. Measure real progress. Understand
          where you stand. Build your flying career on evidence, not guesswork.
        </p>
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
    <section className="bg-muted/30 px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            Built for every stage of a flying career
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {audiences.map((item) => (
            <div
              key={item.label}
              className="bg-background ring-border/50 flex items-start gap-4 rounded-xl p-6 shadow-sm ring-1"
            >
              <div className="bg-foreground/5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                <item.icon className="text-foreground h-5 w-5" />
              </div>
              <div>
                <h3 className="text-foreground text-sm font-semibold">
                  {item.label}
                </h3>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                  {item.detail}
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
      className="border-border/40 scroll-mt-16 border-t px-6 py-24 sm:py-32 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            Pricing
          </h2>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            Start free. Scale as your career demands more visibility.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`border-border/60 flex flex-col rounded-2xl border p-8 ${
                tier.highlight
                  ? 'ring-foreground/20 bg-muted/30 ring-2'
                  : 'bg-background'
              }`}
            >
              <h3 className="text-foreground text-base font-semibold">
                {tier.name}
              </h3>
              <p className="text-foreground mt-4 text-3xl font-bold tracking-tight">
                {tier.price}
              </p>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {tier.description}
              </p>
              <ul className="mt-8 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="text-muted-foreground flex items-start gap-3 text-sm"
                  >
                    <Check className="text-foreground mt-0.5 h-4 w-4 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button
                  asChild
                  variant={tier.highlight ? 'default' : 'outline'}
                  className="w-full"
                >
                  <Link href="/signup">{tier.cta}</Link>
                </Button>
              </div>
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
    <section className="bg-muted/30 px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
          Start with CrossCheck
        </h2>
        <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
          Every career starts with the first entry. Build yours on a foundation
          designed for where you are headed.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="w-full px-8 sm:w-auto">
            <Link href="/signup">
              Get Started
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
      <Problem />
      <FeatureShowcase />
      <CorePromise />
      <Audience />
      <Pricing />
      <CTA />
    </>
  )
}
