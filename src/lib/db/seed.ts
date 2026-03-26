/**
 * Seed script for milestone definitions, currency rules, and goal profiles.
 * Run with: npx tsx src/lib/db/seed.ts
 */
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import {
  milestoneDefinitions,
  currencyRuleDefinitions,
  goalProfiles,
  goalRequirements,
} from './schema'

const connectionString =
  process.env.DATABASE_URL_DIRECT ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL!

const client = postgres(connectionString, { prepare: false })
const db = drizzle(client)

const milestones = [
  // Event milestones
  {
    code: 'first_solo',
    name: 'First Solo',
    description: 'Completed first solo flight',
    category: 'event',
    evaluationType: 'event',
    field: 'is_solo_flight',
    sortOrder: 1,
  },
  {
    code: 'first_cross_country',
    name: 'First Cross-Country',
    description: 'Completed first cross-country flight',
    category: 'event',
    evaluationType: 'event',
    field: 'cross_country',
    sortOrder: 2,
  },
  {
    code: 'first_night',
    name: 'First Night Flight',
    description: 'Completed first night flight',
    category: 'event',
    evaluationType: 'event',
    field: 'night',
    sortOrder: 3,
  },
  {
    code: 'first_actual_instrument',
    name: 'First Actual IMC',
    description: 'First flight in actual instrument conditions',
    category: 'event',
    evaluationType: 'event',
    field: 'actual_instrument',
    sortOrder: 4,
  },
  {
    code: 'first_turbine',
    name: 'First Turbine Flight',
    description: 'First flight in a turbine-powered aircraft',
    category: 'event',
    evaluationType: 'event',
    field: 'turbine',
    sortOrder: 5,
  },
  {
    code: 'first_multi_engine',
    name: 'First Multi-Engine Flight',
    description: 'First flight in a multi-engine aircraft',
    category: 'event',
    evaluationType: 'event',
    field: 'multi_engine',
    sortOrder: 6,
  },
  {
    code: 'first_checkride',
    name: 'First Checkride',
    description: 'Completed first practical test',
    category: 'event',
    evaluationType: 'event',
    field: 'is_checkride',
    sortOrder: 7,
  },
  // Threshold milestones
  {
    code: 'total_100',
    name: '100 Total Hours',
    description: 'Reached 100 total flight hours',
    category: 'threshold',
    evaluationType: 'threshold',
    field: 'total_time',
    threshold: 100,
    sortOrder: 10,
  },
  {
    code: 'total_250',
    name: '250 Total Hours',
    description: 'Reached 250 total flight hours',
    category: 'threshold',
    evaluationType: 'threshold',
    field: 'total_time',
    threshold: 250,
    sortOrder: 11,
  },
  {
    code: 'total_500',
    name: '500 Total Hours',
    description: 'Reached 500 total flight hours',
    category: 'threshold',
    evaluationType: 'threshold',
    field: 'total_time',
    threshold: 500,
    sortOrder: 12,
  },
  {
    code: 'total_1000',
    name: '1,000 Total Hours',
    description: 'Reached 1,000 total flight hours',
    category: 'threshold',
    evaluationType: 'threshold',
    field: 'total_time',
    threshold: 1000,
    sortOrder: 13,
  },
  {
    code: 'total_1500',
    name: '1,500 Total Hours',
    description: 'ATP minimums — 1,500 total hours',
    category: 'threshold',
    evaluationType: 'threshold',
    field: 'total_time',
    threshold: 1500,
    sortOrder: 14,
  },
  {
    code: 'pic_100',
    name: '100 PIC Hours',
    description: 'Reached 100 pilot-in-command hours',
    category: 'threshold',
    evaluationType: 'threshold',
    field: 'pic',
    threshold: 100,
    sortOrder: 20,
  },
  {
    code: 'pic_250',
    name: '250 PIC Hours',
    description: 'Reached 250 pilot-in-command hours',
    category: 'threshold',
    evaluationType: 'threshold',
    field: 'pic',
    threshold: 250,
    sortOrder: 21,
  },
  {
    code: 'xc_500',
    name: '500 Cross-Country Hours',
    description: 'Reached 500 cross-country hours',
    category: 'threshold',
    evaluationType: 'threshold',
    field: 'cross_country',
    threshold: 500,
    sortOrder: 30,
  },
  {
    code: 'night_100',
    name: '100 Night Hours',
    description: 'Reached 100 night flight hours',
    category: 'threshold',
    evaluationType: 'threshold',
    field: 'night',
    threshold: 100,
    sortOrder: 31,
  },
  {
    code: 'instrument_50',
    name: '50 Instrument Hours',
    description: 'Reached 50 actual instrument hours',
    category: 'threshold',
    evaluationType: 'threshold',
    field: 'actual_instrument',
    threshold: 50,
    sortOrder: 32,
  },
  {
    code: 'multi_100',
    name: '100 Multi-Engine Hours',
    description: 'Reached 100 multi-engine hours',
    category: 'threshold',
    evaluationType: 'threshold',
    field: 'multi_engine',
    threshold: 100,
    sortOrder: 33,
  },
  {
    code: 'turbine_100',
    name: '100 Turbine Hours',
    description: 'Reached 100 turbine hours',
    category: 'threshold',
    evaluationType: 'threshold',
    field: 'turbine',
    threshold: 100,
    sortOrder: 34,
  },
]

const currencyRules = [
  {
    code: 'passenger_day',
    name: 'Passenger Currency (Day)',
    description:
      '3 takeoffs and landings within 90 days for carrying passengers',
    regulation: '14 CFR 61.57(a)',
    requiredCount: 3,
    requiredField: 'day_landings',
    periodDays: 90,
    category: 'passenger',
  },
  {
    code: 'passenger_night',
    name: 'Passenger Currency (Night)',
    description:
      '3 takeoffs and full-stop landings at night within 90 days for carrying passengers at night',
    regulation: '14 CFR 61.57(b)',
    requiredCount: 3,
    requiredField: 'night_landings',
    periodDays: 90,
    category: 'passenger',
  },
  {
    code: 'instrument',
    name: 'Instrument Currency',
    description:
      '6 approaches, holding, and intercepting/tracking within 6 calendar months',
    regulation: '14 CFR 61.57(c)',
    requiredCount: 6,
    requiredField: 'approaches',
    periodDays: 183,
    category: 'instrument',
  },
  {
    code: 'flight_review',
    name: 'Flight Review',
    description: 'Biennial flight review within 24 calendar months',
    regulation: '14 CFR 61.56',
    requiredCount: 1,
    requiredField: 'flight_review',
    periodDays: 730,
    category: 'general',
  },
]

type GoalSeed = {
  code: string
  name: string
  description: string
  category: string
  sortOrder: number
  requirements: {
    field: string
    label: string
    requiredValue: string
    unit: string
    sortOrder: number
  }[]
}

const goals: GoalSeed[] = [
  {
    code: 'private',
    name: 'Private Pilot',
    description: 'FAA Private Pilot Certificate requirements',
    category: 'certificate',
    sortOrder: 1,
    requirements: [
      {
        field: 'total_time',
        label: 'Total Time',
        requiredValue: '40',
        unit: 'hours',
        sortOrder: 1,
      },
      {
        field: 'dual_received',
        label: 'Dual Received',
        requiredValue: '20',
        unit: 'hours',
        sortOrder: 2,
      },
      {
        field: 'solo',
        label: 'Solo',
        requiredValue: '10',
        unit: 'hours',
        sortOrder: 3,
      },
      {
        field: 'cross_country',
        label: 'Cross-Country',
        requiredValue: '3',
        unit: 'hours',
        sortOrder: 4,
      },
      {
        field: 'night',
        label: 'Night',
        requiredValue: '3',
        unit: 'hours',
        sortOrder: 5,
      },
      {
        field: 'actual_instrument',
        label: 'Instrument Training',
        requiredValue: '3',
        unit: 'hours',
        sortOrder: 6,
      },
    ],
  },
  {
    code: 'instrument',
    name: 'Instrument Rating',
    description: 'FAA Instrument Rating requirements',
    category: 'rating',
    sortOrder: 2,
    requirements: [
      {
        field: 'total_time',
        label: 'Total Time',
        requiredValue: '50',
        unit: 'hours',
        sortOrder: 1,
      },
      {
        field: 'cross_country',
        label: 'Cross-Country PIC',
        requiredValue: '50',
        unit: 'hours',
        sortOrder: 2,
      },
      {
        field: 'actual_instrument',
        label: 'Instrument Time',
        requiredValue: '40',
        unit: 'hours',
        sortOrder: 3,
      },
    ],
  },
  {
    code: 'commercial',
    name: 'Commercial Pilot',
    description: 'FAA Commercial Pilot Certificate requirements',
    category: 'certificate',
    sortOrder: 3,
    requirements: [
      {
        field: 'total_time',
        label: 'Total Time',
        requiredValue: '250',
        unit: 'hours',
        sortOrder: 1,
      },
      {
        field: 'pic',
        label: 'PIC Time',
        requiredValue: '100',
        unit: 'hours',
        sortOrder: 2,
      },
      {
        field: 'cross_country',
        label: 'Cross-Country',
        requiredValue: '50',
        unit: 'hours',
        sortOrder: 3,
      },
      {
        field: 'night',
        label: 'Night',
        requiredValue: '10',
        unit: 'hours',
        sortOrder: 4,
      },
      {
        field: 'actual_instrument',
        label: 'Instrument',
        requiredValue: '10',
        unit: 'hours',
        sortOrder: 5,
      },
    ],
  },
  {
    code: 'cfi',
    name: 'CFI',
    description: 'Certified Flight Instructor requirements',
    category: 'certificate',
    sortOrder: 4,
    requirements: [
      {
        field: 'total_time',
        label: 'Total Time',
        requiredValue: '250',
        unit: 'hours',
        sortOrder: 1,
      },
      {
        field: 'pic',
        label: 'PIC Time',
        requiredValue: '100',
        unit: 'hours',
        sortOrder: 2,
      },
    ],
  },
  {
    code: 'regional_fo',
    name: 'Regional First Officer',
    description: 'Typical regional airline first officer minimums',
    category: 'career',
    sortOrder: 5,
    requirements: [
      {
        field: 'total_time',
        label: 'Total Time',
        requiredValue: '1500',
        unit: 'hours',
        sortOrder: 1,
      },
      {
        field: 'cross_country',
        label: 'Cross-Country',
        requiredValue: '500',
        unit: 'hours',
        sortOrder: 2,
      },
      {
        field: 'night',
        label: 'Night',
        requiredValue: '100',
        unit: 'hours',
        sortOrder: 3,
      },
      {
        field: 'actual_instrument',
        label: 'Instrument',
        requiredValue: '75',
        unit: 'hours',
        sortOrder: 4,
      },
      {
        field: 'multi_engine',
        label: 'Multi-Engine',
        requiredValue: '25',
        unit: 'hours',
        sortOrder: 5,
      },
    ],
  },
  {
    code: 'part135',
    name: '135 Pilot',
    description: 'Part 135 operations typical minimums',
    category: 'career',
    sortOrder: 6,
    requirements: [
      {
        field: 'total_time',
        label: 'Total Time',
        requiredValue: '1200',
        unit: 'hours',
        sortOrder: 1,
      },
      {
        field: 'pic',
        label: 'PIC Time',
        requiredValue: '500',
        unit: 'hours',
        sortOrder: 2,
      },
      {
        field: 'cross_country',
        label: 'Cross-Country',
        requiredValue: '500',
        unit: 'hours',
        sortOrder: 3,
      },
      {
        field: 'night',
        label: 'Night',
        requiredValue: '100',
        unit: 'hours',
        sortOrder: 4,
      },
      {
        field: 'actual_instrument',
        label: 'Instrument',
        requiredValue: '75',
        unit: 'hours',
        sortOrder: 5,
      },
    ],
  },
  {
    code: 'major_readiness',
    name: 'Major Airline Readiness',
    description:
      'Competitive minimums for major airline applications — placeholder targets',
    category: 'career',
    sortOrder: 7,
    requirements: [
      {
        field: 'total_time',
        label: 'Total Time',
        requiredValue: '3000',
        unit: 'hours',
        sortOrder: 1,
      },
      {
        field: 'pic',
        label: 'PIC Time',
        requiredValue: '1500',
        unit: 'hours',
        sortOrder: 2,
      },
      {
        field: 'turbine',
        label: 'Turbine',
        requiredValue: '1000',
        unit: 'hours',
        sortOrder: 3,
      },
      {
        field: 'multi_engine',
        label: 'Multi-Engine',
        requiredValue: '1000',
        unit: 'hours',
        sortOrder: 4,
      },
      {
        field: 'cross_country',
        label: 'Cross-Country',
        requiredValue: '1000',
        unit: 'hours',
        sortOrder: 5,
      },
    ],
  },
]

async function seed() {
  console.log('Seeding milestone definitions...')
  for (const m of milestones) {
    await db
      .insert(milestoneDefinitions)
      .values(m)
      .onConflictDoNothing({ target: milestoneDefinitions.code })
  }

  console.log('Seeding currency rule definitions...')
  for (const c of currencyRules) {
    await db
      .insert(currencyRuleDefinitions)
      .values(c)
      .onConflictDoNothing({ target: currencyRuleDefinitions.code })
  }

  console.log('Seeding goal profiles and requirements...')
  for (const g of goals) {
    const [inserted] = await db
      .insert(goalProfiles)
      .values({
        code: g.code,
        name: g.name,
        description: g.description,
        category: g.category,
        sortOrder: g.sortOrder,
      })
      .onConflictDoNothing({ target: goalProfiles.code })
      .returning({ id: goalProfiles.id })

    if (inserted) {
      for (const r of g.requirements) {
        await db.insert(goalRequirements).values({
          goalProfileId: inserted.id,
          ...r,
        })
      }
    }
  }

  console.log('Seed complete.')
  await client.end()
}

seed().catch(console.error)
