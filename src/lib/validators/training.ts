import { z } from 'zod'

// ---------- Training Entries ----------

const trainingEntryBase = z.object({
  entryDate: z.string().min(1, 'Date is required'),
  entryType: z.enum(['ground', 'simulator', 'flight'], {
    required_error: 'Type is required',
  }),
  duration: z.coerce.number().min(0).optional(),
  instructor: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  subject: z.string().min(1, 'Subject is required'),
  description: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  notes: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
})

export const trainingEntryCreateSchema = trainingEntryBase
export const trainingEntryUpdateSchema = trainingEntryBase.partial()

export type TrainingEntryCreate = z.infer<typeof trainingEntryCreateSchema>
export type TrainingEntryUpdate = z.infer<typeof trainingEntryUpdateSchema>

// ---------- Certificates ----------

const certificateBase = z.object({
  certificateType: z.enum(
    [
      'Student',
      'Private',
      'Instrument',
      'Commercial',
      'ATP',
      'CFI',
      'CFII',
      'MEI',
      'Other',
    ],
    { required_error: 'Certificate type is required' },
  ),
  name: z.string().min(1, 'Certificate number is required'),
  issuedDate: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  expiryDate: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  issuingAuthority: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  documentUrl: z.string().url().optional().or(z.literal('')),
  notes: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
})

export const certificateCreateSchema = certificateBase
export const certificateUpdateSchema = certificateBase.partial()

export type CertificateCreate = z.infer<typeof certificateCreateSchema>
export type CertificateUpdate = z.infer<typeof certificateUpdateSchema>

// ---------- Endorsements ----------

const endorsementBase = z.object({
  endorsementType: z.enum(
    [
      'Solo',
      'Cross-country',
      'Class/Type',
      'Checkride',
      'High performance',
      'Complex',
      'Tailwheel',
      'High altitude',
      'Other',
    ],
    { required_error: 'Endorsement type is required' },
  ),
  description: z.string().min(1, 'Description is required'),
  endorsedDate: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  instructorName: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  instructorCertNumber: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  documentUrl: z.string().url().optional().or(z.literal('')),
  notes: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
})

export const endorsementCreateSchema = endorsementBase
export const endorsementUpdateSchema = endorsementBase.partial()

export type EndorsementCreate = z.infer<typeof endorsementCreateSchema>
export type EndorsementUpdate = z.infer<typeof endorsementUpdateSchema>
