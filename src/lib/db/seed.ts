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
    requirementType: string
    sortOrder: number
  }[]
}

const goals: GoalSeed[] = [
  {
    code: 'private',
    name: 'Private Pilot',
    description: 'FAA Private Pilot Certificate requirements (§ 61.109)',
    category: 'certificate',
    sortOrder: 1,
    requirements: [
      {
        field: 'total_time',
        label: '40 hours total flight time',
        requiredValue: '40',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 1,
      },
      {
        field: 'dual_received',
        label: '20 hours dual instruction',
        requiredValue: '20',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 2,
      },
      {
        field: 'cross_country',
        label: '3 hours dual cross-country',
        requiredValue: '3',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 3,
      },
      {
        field: 'night',
        label: '3 hours dual night flight',
        requiredValue: '3',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 4,
      },
      {
        field: 'actual_instrument',
        label: '3 hours dual instrument training',
        requiredValue: '3',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 5,
      },
      {
        field: 'checklist_ppl_test_prep',
        label:
          '3 hours dual practical test prep (within 2 calendar months)',
        requiredValue: '0',
        unit: 'checklist',
        requirementType: 'checklist',
        sortOrder: 6,
      },
      {
        field: 'solo',
        label: '10 hours solo flight',
        requiredValue: '10',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 7,
      },
      {
        field: 'cross_country_solo',
        label: '5 hours solo cross-country',
        requiredValue: '5',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 8,
      },
      {
        field: 'checklist_ppl_long_xc',
        label:
          'Solo XC >150nm, 3 landings, one segment >50nm from departure',
        requiredValue: '0',
        unit: 'checklist',
        requirementType: 'checklist',
        sortOrder: 9,
      },
      {
        field: 'checklist_ppl_night_xc',
        label: 'Night XC >100nm total distance (within night dual)',
        requiredValue: '0',
        unit: 'checklist',
        requirementType: 'checklist',
        sortOrder: 10,
      },
      {
        field: 'checklist_ppl_towered',
        label:
          '3 solo takeoffs/landings at towered airport (full stop)',
        requiredValue: '0',
        unit: 'checklist',
        requirementType: 'checklist',
        sortOrder: 11,
      },
    ],
  },
  {
    code: 'instrument',
    name: 'Instrument Rating',
    description: 'FAA Instrument Rating requirements (§ 61.65)',
    category: 'rating',
    sortOrder: 2,
    requirements: [
      {
        field: 'cross_country',
        label: '50 hours PIC cross-country',
        requiredValue: '50',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 1,
      },
      {
        field: 'actual_instrument',
        label: '40 hours actual or simulated instrument time',
        requiredValue: '40',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 2,
      },
      {
        field: 'instrument_instruction',
        label: '15 hours instrument training from CFII',
        requiredValue: '15',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 3,
      },
      {
        field: 'checklist_ir_test_prep',
        label:
          '3 hours instrument training within 2 calendar months of checkride',
        requiredValue: '0',
        unit: 'checklist',
        requirementType: 'checklist',
        sortOrder: 4,
      },
      {
        field: 'checklist_ir_long_xc',
        label:
          'IFR XC >250nm, approaches at each airport, 3 different approach types',
        requiredValue: '0',
        unit: 'checklist',
        requirementType: 'checklist',
        sortOrder: 5,
      },
    ],
  },
  {
    code: 'commercial',
    name: 'Commercial Pilot',
    description: 'FAA Commercial Pilot Certificate requirements (§ 61.129)',
    category: 'certificate',
    sortOrder: 3,
    requirements: [
      {
        field: 'total_time',
        label: '250 hours total flight time',
        requiredValue: '250',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 1,
      },
      {
        field: 'pic',
        label: '100 hours PIC time',
        requiredValue: '100',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 2,
      },
      {
        field: 'cross_country',
        label: '50 hours PIC cross-country',
        requiredValue: '50',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 3,
      },
      {
        field: 'dual_received',
        label: '20 hours dual instruction',
        requiredValue: '20',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 4,
      },
      {
        field: 'actual_instrument',
        label: '10 hours instrument training',
        requiredValue: '10',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 5,
      },
      {
        field: 'complex_taa',
        label: '10 hours complex or TAA time',
        requiredValue: '10',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 6,
      },
      {
        field: 'checklist_cpl_day_xc',
        label:
          'Dual day VFR XC >2hrs, one leg >50nm from departure',
        requiredValue: '0',
        unit: 'checklist',
        requirementType: 'checklist',
        sortOrder: 7,
      },
      {
        field: 'checklist_cpl_night_xc',
        label:
          'Dual night VFR XC >2hrs, one leg >50nm from departure',
        requiredValue: '0',
        unit: 'checklist',
        requirementType: 'checklist',
        sortOrder: 8,
      },
      {
        field: 'checklist_cpl_test_prep',
        label:
          '3 hours dual practical test prep (within 2 calendar months)',
        requiredValue: '0',
        unit: 'checklist',
        requirementType: 'checklist',
        sortOrder: 9,
      },
      {
        field: 'solo_pic',
        label: '10 hours solo/PIC-with-instructor',
        requiredValue: '10',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 10,
      },
      {
        field: 'checklist_cpl_long_xc',
        label: 'Solo XC >300nm, 3 landings, one segment >250nm',
        requiredValue: '0',
        unit: 'checklist',
        requirementType: 'checklist',
        sortOrder: 11,
      },
      {
        field: 'checklist_cpl_night_solo',
        label:
          '5 hours solo night VFR with 10 takeoffs/landings (full stop)',
        requiredValue: '0',
        unit: 'checklist',
        requirementType: 'checklist',
        sortOrder: 12,
      },
    ],
  },
  {
    code: 'atp',
    name: 'ATP',
    description: 'Airline Transport Pilot requirements (§ 61.159)',
    category: 'certificate',
    sortOrder: 4,
    requirements: [
      {
        field: 'total_time',
        label: '1500 hours total time',
        requiredValue: '1500',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 1,
      },
      {
        field: 'cross_country',
        label: '500 hours cross-country',
        requiredValue: '500',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 2,
      },
      {
        field: 'night',
        label: '100 hours night',
        requiredValue: '100',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 3,
      },
      {
        field: 'actual_instrument',
        label: '75 hours instrument (max 25 in sim)',
        requiredValue: '75',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 4,
      },
      {
        field: 'pic',
        label: '250 hours PIC',
        requiredValue: '250',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 5,
      },
    ],
  },
  {
    code: 'cfi',
    name: 'CFI',
    description: 'Certified Flight Instructor requirements',
    category: 'certificate',
    sortOrder: 5,
    requirements: [
      {
        field: 'total_time',
        label: 'Total Time',
        requiredValue: '250',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 1,
      },
      {
        field: 'pic',
        label: 'PIC Time',
        requiredValue: '100',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 2,
      },
    ],
  },
  {
    code: 'regional_fo',
    name: 'Regional First Officer',
    description: 'Typical regional airline first officer minimums',
    category: 'career',
    sortOrder: 6,
    requirements: [
      {
        field: 'total_time',
        label: 'Total Time',
        requiredValue: '1500',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 1,
      },
      {
        field: 'cross_country',
        label: 'Cross-Country',
        requiredValue: '500',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 2,
      },
      {
        field: 'night',
        label: 'Night',
        requiredValue: '100',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 3,
      },
      {
        field: 'actual_instrument',
        label: 'Instrument',
        requiredValue: '75',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 4,
      },
      {
        field: 'multi_engine',
        label: 'Multi-Engine',
        requiredValue: '25',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 5,
      },
    ],
  },
  {
    code: 'part135',
    name: '135 Pilot',
    description: 'Part 135 operations typical minimums',
    category: 'career',
    sortOrder: 7,
    requirements: [
      {
        field: 'total_time',
        label: 'Total Time',
        requiredValue: '1200',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 1,
      },
      {
        field: 'pic',
        label: 'PIC Time',
        requiredValue: '500',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 2,
      },
      {
        field: 'cross_country',
        label: 'Cross-Country',
        requiredValue: '500',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 3,
      },
      {
        field: 'night',
        label: 'Night',
        requiredValue: '100',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 4,
      },
      {
        field: 'actual_instrument',
        label: 'Instrument',
        requiredValue: '75',
        unit: 'hours',
        requirementType: 'hours',
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
    sortOrder: 8,
    requirements: [
      {
        field: 'total_time',
        label: 'Total Time',
        requiredValue: '3000',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 1,
      },
      {
        field: 'pic',
        label: 'PIC Time',
        requiredValue: '1500',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 2,
      },
      {
        field: 'turbine',
        label: 'Turbine',
        requiredValue: '1000',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 3,
      },
      {
        field: 'multi_engine',
        label: 'Multi-Engine',
        requiredValue: '1000',
        unit: 'hours',
        requirementType: 'hours',
        sortOrder: 4,
      },
      {
        field: 'cross_country',
        label: 'Cross-Country',
        requiredValue: '1000',
        unit: 'hours',
        requirementType: 'hours',
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
          field: r.field,
          label: r.label,
          requiredValue: r.requiredValue,
          unit: r.unit,
          requirementType: r.requirementType,
          sortOrder: r.sortOrder,
        })
      }
    }
  }

  console.log('Seed complete.')
  await client.end()
}

seed().catch(console.error)
