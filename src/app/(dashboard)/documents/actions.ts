'use server'

import * as Sentry from '@sentry/nextjs'
import { eq, and, desc } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { getOrCreateProfile } from '@/lib/services/profile'
import { createAuditEvent } from '@/lib/services/audit'
import { createClient } from '@/lib/supabase/server'
import {
  documentUploadSchema,
  documentUpdateSchema,
  documentCategoryEnum,
} from '@/lib/validators/document'

// ---------- Types ----------

export type DocumentRecord = typeof schema.documents.$inferSelect

const BUCKET = 'documents'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/csv',
]

// ---------- Upload Document ----------

export async function uploadDocument(formData: FormData): Promise<{
  data: DocumentRecord | null
  error: string | null
}> {
  try {
    const profile = await getOrCreateProfile()

    const file = formData.get('file') as File | null
    if (!file || file.size === 0) {
      return { data: null, error: 'No file provided' }
    }

    if (file.size > MAX_FILE_SIZE) {
      return { data: null, error: 'File size exceeds 10MB limit' }
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return { data: null, error: 'File type not allowed' }
    }

    const category = formData.get('category') as string
    const entityType = (formData.get('entityType') as string) || undefined
    const entityId = (formData.get('entityId') as string) || undefined

    const validated = documentUploadSchema.parse({
      name: file.name,
      documentType: category,
      entityType: entityType || undefined,
      entityId: entityId || undefined,
    })

    // Upload to Supabase Storage
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `${profile.id}/${timestamp}_${sanitizedName}`

    const supabase = await createClient()
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      Sentry.captureException(uploadError)
      return { data: null, error: 'Failed to upload file to storage' }
    }

    // Create DB record
    const inserted = await db
      .insert(schema.documents)
      .values({
        profileId: profile.id,
        documentType: validated.documentType,
        name: file.name,
        storagePath,
        mimeType: file.type,
        fileSize: file.size,
        entityType: validated.entityType ?? null,
        entityId: validated.entityId ?? null,
      })
      .returning()

    if (!inserted[0]) {
      return { data: null, error: 'Failed to create document record' }
    }

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'document',
      entityId: inserted[0].id,
      action: 'create',
      changes: {
        name: file.name,
        documentType: validated.documentType,
        fileSize: file.size,
      },
    })

    return { data: inserted[0], error: null }
  } catch (error) {
    Sentry.captureException(error)
    if (error instanceof z.ZodError) {
      return {
        data: null,
        error: error.errors.map((e) => e.message).join(', '),
      }
    }
    return { data: null, error: 'Failed to upload document' }
  }
}

// ---------- Get Documents ----------

export async function getDocuments(
  category?: string,
): Promise<{ data: DocumentRecord[]; error: string | null }> {
  try {
    const profile = await getOrCreateProfile()

    if (category && category !== 'all') {
      const parsed = documentCategoryEnum.safeParse(category)
      if (!parsed.success) {
        return { data: [], error: 'Invalid category' }
      }

      const rows = await db
        .select()
        .from(schema.documents)
        .where(
          and(
            eq(schema.documents.profileId, profile.id),
            eq(schema.documents.documentType, parsed.data),
          ),
        )
        .orderBy(desc(schema.documents.createdAt))

      return { data: rows, error: null }
    }

    const rows = await db
      .select()
      .from(schema.documents)
      .where(eq(schema.documents.profileId, profile.id))
      .orderBy(desc(schema.documents.createdAt))

    return { data: rows, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return { data: [], error: 'Failed to load documents' }
  }
}

// ---------- Get Document Signed URL ----------

export async function getDocumentUrl(
  documentId: string,
): Promise<{ data: string | null; error: string | null }> {
  try {
    const profile = await getOrCreateProfile()
    z.string().uuid().parse(documentId)

    const docs = await db
      .select()
      .from(schema.documents)
      .where(
        and(
          eq(schema.documents.id, documentId),
          eq(schema.documents.profileId, profile.id),
        ),
      )
      .limit(1)

    if (docs.length === 0) {
      return { data: null, error: 'Document not found' }
    }

    const doc = docs[0]
    if (!doc.storagePath) {
      return { data: null, error: 'Document has no file' }
    }

    const supabase = await createClient()
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(doc.storagePath, 3600) // 1 hour

    if (error) {
      Sentry.captureException(error)
      return { data: null, error: 'Failed to generate download URL' }
    }

    return { data: data.signedUrl, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return { data: null, error: 'Failed to get document URL' }
  }
}

// ---------- Update Document ----------

export async function updateDocument(
  id: string,
  data: unknown,
): Promise<{ data: DocumentRecord | null; error: string | null }> {
  try {
    const profile = await getOrCreateProfile()
    z.string().uuid().parse(id)

    const existing = await db
      .select()
      .from(schema.documents)
      .where(
        and(
          eq(schema.documents.id, id),
          eq(schema.documents.profileId, profile.id),
        ),
      )
      .limit(1)

    if (existing.length === 0) {
      return { data: null, error: 'Document not found' }
    }

    const validated = documentUpdateSchema.parse(data)

    const updated = await db
      .update(schema.documents)
      .set({
        documentType: validated.documentType ?? existing[0].documentType,
        entityType:
          validated.entityType !== undefined
            ? validated.entityType
            : existing[0].entityType,
        entityId:
          validated.entityId !== undefined
            ? validated.entityId
            : existing[0].entityId,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.documents.id, id),
          eq(schema.documents.profileId, profile.id),
        ),
      )
      .returning()

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'document',
      entityId: id,
      action: 'update',
      changes: validated,
    })

    return { data: updated[0] ?? null, error: null }
  } catch (error) {
    Sentry.captureException(error)
    if (error instanceof z.ZodError) {
      return {
        data: null,
        error: error.errors.map((e) => e.message).join(', '),
      }
    }
    return { data: null, error: 'Failed to update document' }
  }
}

// ---------- Delete Document ----------

export async function deleteDocument(
  id: string,
): Promise<{ error: string | null }> {
  try {
    const profile = await getOrCreateProfile()
    z.string().uuid().parse(id)

    const existing = await db
      .select()
      .from(schema.documents)
      .where(
        and(
          eq(schema.documents.id, id),
          eq(schema.documents.profileId, profile.id),
        ),
      )
      .limit(1)

    if (existing.length === 0) {
      return { error: 'Document not found' }
    }

    // Delete from Storage first
    if (existing[0].storagePath) {
      const supabase = await createClient()
      const { error: storageError } = await supabase.storage
        .from(BUCKET)
        .remove([existing[0].storagePath])

      if (storageError) {
        Sentry.captureException(storageError)
        // Continue to delete DB record even if storage delete fails
      }
    }

    // Delete from DB
    await db
      .delete(schema.documents)
      .where(
        and(
          eq(schema.documents.id, id),
          eq(schema.documents.profileId, profile.id),
        ),
      )

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'document',
      entityId: id,
      action: 'delete',
      changes: { name: existing[0].name },
    })

    return { error: null }
  } catch (error) {
    Sentry.captureException(error)
    return { error: 'Failed to delete document' }
  }
}

// ---------- Get Documents for Entity ----------

export async function getDocumentsForEntity(
  entityType: string,
  entityId: string,
): Promise<{ data: DocumentRecord[]; error: string | null }> {
  try {
    const profile = await getOrCreateProfile()
    z.string().uuid().parse(entityId)

    const rows = await db
      .select()
      .from(schema.documents)
      .where(
        and(
          eq(schema.documents.profileId, profile.id),
          eq(schema.documents.entityType, entityType),
          eq(schema.documents.entityId, entityId),
        ),
      )
      .orderBy(desc(schema.documents.createdAt))

    return { data: rows, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return { data: [], error: 'Failed to load linked documents' }
  }
}
