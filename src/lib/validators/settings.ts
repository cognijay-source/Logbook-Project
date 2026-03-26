import { z } from 'zod'

const optionalString = z
  .string()
  .optional()
  .transform((v) => (v === '' ? undefined : v))

const CERTIFICATE_LEVELS = [
  'Student',
  'Sport',
  'Recreational',
  'Private',
  'Commercial',
  'ATP',
] as const

const MEDICAL_CLASSES = [
  'First',
  'Second',
  'Third',
  'BasicMed',
] as const

const CAREER_PHASES = [
  'Student',
  'Time Building',
  'Regional',
  'Corporate',
  'Major',
  'Military',
  'Instructor',
  'Other',
] as const

const TIME_FORMATS = ['decimal', 'hhmm'] as const

export const profileUpdateSchema = z.object({
  displayName: optionalString,
  certificateLevel: optionalString.pipe(
    z.enum(CERTIFICATE_LEVELS).optional(),
  ),
  certificateNumber: optionalString,
  medicalClass: optionalString.pipe(z.enum(MEDICAL_CLASSES).optional()),
  medicalExpiry: optionalString,
  homeAirport: optionalString.pipe(
    z
      .string()
      .max(4, 'ICAO code must be 4 characters or fewer')
      .regex(/^[A-Z0-9]*$/, 'ICAO code must be uppercase alphanumeric')
      .optional(),
  ),
  careerPhase: optionalString.pipe(z.enum(CAREER_PHASES).optional()),
})

export const preferencesSchema = z.object({
  timeFormat: z.enum(TIME_FORMATS),
  timezone: z.string().min(1, 'Timezone is required'),
})

export const changePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type ProfileUpdate = z.infer<typeof profileUpdateSchema>
export type PreferencesUpdate = z.infer<typeof preferencesSchema>
export type ChangePassword = z.infer<typeof changePasswordSchema>

export {
  CERTIFICATE_LEVELS,
  MEDICAL_CLASSES,
  CAREER_PHASES,
  TIME_FORMATS,
}
