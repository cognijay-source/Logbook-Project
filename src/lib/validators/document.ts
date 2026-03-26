import { z } from 'zod'

export const documentCategoryEnum = z.enum([
  'medical',
  'insurance',
  'endorsement',
  'receipt',
  'certificate',
  'other',
])

export type DocumentCategory = z.infer<typeof documentCategoryEnum>

export const DOCUMENT_CATEGORIES: { value: DocumentCategory; label: string }[] =
  [
    { value: 'medical', label: 'Medical' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'endorsement', label: 'Endorsement' },
    { value: 'receipt', label: 'Receipt' },
    { value: 'certificate', label: 'Certificate' },
    { value: 'other', label: 'Other' },
  ]

export const entityTypeEnum = z.enum(['flight', 'aircraft', 'training'])

export type EntityType = z.infer<typeof entityTypeEnum>

export const documentUploadSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  documentType: documentCategoryEnum,
  entityType: entityTypeEnum.optional(),
  entityId: z.string().uuid().optional(),
})

export const documentUpdateSchema = z.object({
  documentType: documentCategoryEnum.optional(),
  entityType: entityTypeEnum.nullable().optional(),
  entityId: z.string().uuid().nullable().optional(),
})

export type DocumentUpload = z.infer<typeof documentUploadSchema>
export type DocumentUpdate = z.infer<typeof documentUpdateSchema>
