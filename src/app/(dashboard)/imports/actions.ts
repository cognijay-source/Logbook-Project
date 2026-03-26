'use server'

import * as Sentry from '@sentry/nextjs'
import { eq, and, desc } from 'drizzle-orm'
import Papa from 'papaparse'
import { z } from 'zod'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { getOrCreateProfile } from '@/lib/services/profile'
import { createAuditEvent } from '@/lib/services/audit'
import {
  importRowSchema,
  processImportSchema,
  retryImportSchema,
} from '@/lib/validators/import'
import { importProcessingTask } from '@/jobs/import-processing'

// ---------- Types ----------

export type ImportBatchRow = typeof schema.importBatches.$inferSelect
export type ImportRowRecord = typeof schema.importRows.$inferSelect

// ---------- Upload CSV ----------

const uploadSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  csvContent: z.string().min(1, 'CSV content is required'),
  sourceType: z.string().default('csv'),
})

export async function uploadCsv(
  data: unknown,
): Promise<{
  data: { batchId: string; headers: string[]; preview: Record<string, string>[] } | null
  error: string | null
}> {
  try {
    const profile = await getOrCreateProfile()
    const validated = uploadSchema.parse(data)

    const parsed = Papa.parse<Record<string, string>>(validated.csvContent, {
      header: true,
      skipEmptyLines: true,
    })

    if (parsed.errors.length > 0 && parsed.data.length === 0) {
      return { data: null, error: 'Failed to parse CSV: ' + parsed.errors[0].message }
    }

    const headers = parsed.meta.fields ?? []
    if (headers.length === 0) {
      return { data: null, error: 'CSV has no columns' }
    }

    const totalRows = parsed.data.length
    if (totalRows === 0) {
      return { data: null, error: 'CSV has no data rows' }
    }

    // Create import batch
    const inserted = await db
      .insert(schema.importBatches)
      .values({
        profileId: profile.id,
        sourceType: validated.sourceType,
        fileName: validated.fileName,
        status: 'pending',
        totalRows,
      })
      .returning()

    if (!inserted[0]) {
      return { data: null, error: 'Failed to create import batch' }
    }

    const batchId = inserted[0].id

    // Insert all rows as pending (process in chunks of 100)
    const chunkSize = 100
    for (let i = 0; i < parsed.data.length; i += chunkSize) {
      const chunk = parsed.data.slice(i, i + chunkSize)
      await db.insert(schema.importRows).values(
        chunk.map((row, idx) => ({
          batchId,
          rowNumber: i + idx + 1,
          rawData: row,
          status: 'pending',
        })),
      )
    }

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'importBatch',
      entityId: batchId,
      action: 'create',
      changes: { fileName: validated.fileName, totalRows },
    })

    // Return first 10 rows as preview
    const preview = parsed.data.slice(0, 10)

    return { data: { batchId, headers, preview }, error: null }
  } catch (error) {
    Sentry.captureException(error)
    if (error instanceof z.ZodError) {
      return { data: null, error: error.errors.map((e) => e.message).join(', ') }
    }
    return { data: null, error: 'Failed to upload CSV' }
  }
}

// ---------- Get Import Batches ----------

export async function getImportBatches(): Promise<{
  data: ImportBatchRow[]
  error: string | null
}> {
  try {
    const profile = await getOrCreateProfile()

    const rows = await db
      .select()
      .from(schema.importBatches)
      .where(eq(schema.importBatches.profileId, profile.id))
      .orderBy(desc(schema.importBatches.createdAt))

    return { data: rows, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return { data: [], error: 'Failed to load import history' }
  }
}

// ---------- Get Batch Details ----------

export async function getImportBatchDetails(batchId: string): Promise<{
  data: { batch: ImportBatchRow; rows: ImportRowRecord[] } | null
  error: string | null
}> {
  try {
    const profile = await getOrCreateProfile()
    const idSchema = z.string().uuid()
    idSchema.parse(batchId)

    const batches = await db
      .select()
      .from(schema.importBatches)
      .where(
        and(
          eq(schema.importBatches.id, batchId),
          eq(schema.importBatches.profileId, profile.id),
        ),
      )
      .limit(1)

    if (batches.length === 0) {
      return { data: null, error: 'Import batch not found' }
    }

    const rows = await db
      .select()
      .from(schema.importRows)
      .where(eq(schema.importRows.batchId, batchId))
      .orderBy(schema.importRows.rowNumber)

    return { data: { batch: batches[0], rows }, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return { data: null, error: 'Failed to load batch details' }
  }
}

// ---------- Process Import Batch ----------

export async function processImportBatch(
  data: unknown,
): Promise<{
  data: { batchId: string } | null
  error: string | null
}> {
  try {
    const profile = await getOrCreateProfile()
    const validated = processImportSchema.parse(data)
    const { batchId, columnMapping } = validated

    // Verify batch ownership and status
    const batches = await db
      .select()
      .from(schema.importBatches)
      .where(
        and(
          eq(schema.importBatches.id, batchId),
          eq(schema.importBatches.profileId, profile.id),
        ),
      )
      .limit(1)

    if (batches.length === 0) {
      return { data: null, error: 'Import batch not found' }
    }

    if (batches[0].status === 'processing') {
      return { data: null, error: 'Import is already processing' }
    }

    // Trigger background job — fire-and-forget
    importProcessingTask
      .trigger({
        batchId,
        profileId: profile.id,
        columnMapping,
      })
      .catch(() => {})

    return { data: { batchId }, error: null }
  } catch (error) {
    Sentry.captureException(error)
    if (error instanceof z.ZodError) {
      return { data: null, error: error.errors.map((e) => e.message).join(', ') }
    }
    return { data: null, error: 'Failed to start import processing' }
  }
}

// ---------- Retry Failed Rows ----------

export async function retryFailedRows(
  data: unknown,
): Promise<{
  data: { processed: number; errored: number } | null
  error: string | null
}> {
  try {
    const profile = await getOrCreateProfile()
    const validated = retryImportSchema.parse(data)
    const { batchId } = validated

    // Verify ownership
    const batches = await db
      .select()
      .from(schema.importBatches)
      .where(
        and(
          eq(schema.importBatches.id, batchId),
          eq(schema.importBatches.profileId, profile.id),
        ),
      )
      .limit(1)

    if (batches.length === 0) {
      return { data: null, error: 'Import batch not found' }
    }

    // Reset errored rows to pending
    await db
      .update(schema.importRows)
      .set({ status: 'pending', errors: null, updatedAt: new Date() })
      .where(
        and(
          eq(schema.importRows.batchId, batchId),
          eq(schema.importRows.status, 'errored'),
        ),
      )

    // Get the original column mapping from the batch's processed rows to rebuild mapping
    // For retry, we re-process with the normalizedData that was already mapped
    const rows = await db
      .select()
      .from(schema.importRows)
      .where(
        and(
          eq(schema.importRows.batchId, batchId),
          eq(schema.importRows.status, 'pending'),
        ),
      )
      .orderBy(schema.importRows.rowNumber)

    // Load aircraft
    const existingAircraft = await db
      .select({ id: schema.aircraft.id, tailNumber: schema.aircraft.tailNumber })
      .from(schema.aircraft)
      .where(eq(schema.aircraft.profileId, profile.id))

    const aircraftByTail = new Map(
      existingAircraft.map((a) => [a.tailNumber.toUpperCase(), a.id]),
    )

    let processed = 0
    let errored = 0

    const toStr = (v: number | undefined) =>
      v !== undefined ? String(v) : undefined

    for (const row of rows) {
      try {
        // Use normalizedData if available, otherwise rawData
        const mapped = (row.normalizedData ?? row.rawData) as Record<string, string>

        const result = importRowSchema.safeParse({
          ...mapped,
          status: 'draft',
          isSoloFlight: false,
          isCheckride: false,
        })

        if (!result.success) {
          const errors = result.error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          }))
          await db
            .update(schema.importRows)
            .set({ status: 'errored', errors, updatedAt: new Date() })
            .where(eq(schema.importRows.id, row.id))
          errored++
          continue
        }

        const validRow = result.data

        let aircraftId: string | null = null
        if (validRow.tailNumber) {
          const tailUpper = validRow.tailNumber.toUpperCase()
          aircraftId = aircraftByTail.get(tailUpper) ?? null

          if (!aircraftId) {
            const newAircraft = await db
              .insert(schema.aircraft)
              .values({
                profileId: profile.id,
                tailNumber: validRow.tailNumber.toUpperCase(),
              })
              .returning({ id: schema.aircraft.id })

            if (newAircraft[0]) {
              aircraftId = newAircraft[0].id
              aircraftByTail.set(tailUpper, aircraftId)

              await createAuditEvent({
                profileId: profile.id,
                entityType: 'aircraft',
                entityId: aircraftId,
                action: 'create',
                metadata: { source: 'csv-import-retry', batchId },
              })
            }
          }
        }

        const insertedFlight = await db
          .insert(schema.flights)
          .values({
            profileId: profile.id,
            aircraftId,
            flightDate: validRow.flightDate,
            departureAirport: validRow.departureAirport,
            arrivalAirport: validRow.arrivalAirport,
            route: validRow.route,
            totalTime: toStr(validRow.totalTime),
            pic: toStr(validRow.pic),
            sic: toStr(validRow.sic),
            crossCountry: toStr(validRow.crossCountry),
            night: toStr(validRow.night),
            actualInstrument: toStr(validRow.actualInstrument),
            simulatedInstrument: toStr(validRow.simulatedInstrument),
            dualReceived: toStr(validRow.dualReceived),
            dualGiven: toStr(validRow.dualGiven),
            solo: toStr(validRow.solo),
            multiEngine: toStr(validRow.multiEngine),
            turbine: toStr(validRow.turbine),
            dayLandings: validRow.dayLandings ?? 0,
            nightLandings: validRow.nightLandings ?? 0,
            holds: validRow.holds ?? 0,
            remarks: validRow.remarks,
            status: 'draft',
            sourceType: 'import',
            importBatchId: batchId,
          })
          .returning({ id: schema.flights.id })

        if (insertedFlight[0]) {
          await db
            .update(schema.importRows)
            .set({
              status: 'processed',
              flightId: insertedFlight[0].id,
              errors: null,
              updatedAt: new Date(),
            })
            .where(eq(schema.importRows.id, row.id))
          processed++
        }
      } catch (rowError) {
        Sentry.captureException(rowError)
        await db
          .update(schema.importRows)
          .set({
            status: 'errored',
            errors: [{ path: 'unknown', message: 'Unexpected error processing row' }],
            updatedAt: new Date(),
          })
          .where(eq(schema.importRows.id, row.id))
        errored++
      }
    }

    // Update batch counts
    const batch = batches[0]
    const newProcessed = (batch.processedRows ?? 0) + processed
    const newErrored = errored

    await db
      .update(schema.importBatches)
      .set({
        status: newErrored > 0 && newProcessed === 0 ? 'failed' : 'completed',
        processedRows: newProcessed,
        errorRows: newErrored,
        updatedAt: new Date(),
      })
      .where(eq(schema.importBatches.id, batchId))

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'importBatch',
      entityId: batchId,
      action: 'update',
      changes: { processed, errored },
      metadata: { action: 'retryFailedRows' },
    })

    return { data: { processed, errored }, error: null }
  } catch (error) {
    Sentry.captureException(error)
    if (error instanceof z.ZodError) {
      return { data: null, error: error.errors.map((e) => e.message).join(', ') }
    }
    return { data: null, error: 'Failed to retry import' }
  }
}
