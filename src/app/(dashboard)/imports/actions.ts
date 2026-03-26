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
  aiParsedFlightSchema,
  type AiParsedFlight,
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

// ---------- AI Photo Parsing ----------

const AI_SYSTEM_PROMPT = `You are extracting flight data from a pilot logbook page. For each flight entry visible, extract:
- date (YYYY-MM-DD format)
- aircraft_type (make and model)
- aircraft_ident (tail number / registration)
- route_from (departure airport ICAO/IATA code)
- route_to (destination airport ICAO/IATA code)
- route_via (intermediate stops, if any)
- total_time (decimal hours)
- pic_time (decimal hours)
- sic_time (decimal hours)
- dual_received (decimal hours)
- cross_country (decimal hours)
- night_time (decimal hours)
- instrument_actual (decimal hours)
- instrument_simulated (decimal hours)
- day_landings (integer)
- night_landings (integer)
- remarks

Return a JSON array of flight objects. If you cannot read a field clearly, set it to null. Do not guess — only extract what you can read with confidence.

Respond with ONLY the JSON array, no other text.`

export async function parseLogbookImages(
  formData: FormData,
): Promise<{
  data: { batchId: string; flights: AiParsedFlight[]; imageUrls: string[] } | null
  error: string | null
}> {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return {
        data: null,
        error:
          'AI parsing requires an Anthropic API key. Add ANTHROPIC_API_KEY to your environment variables.',
      }
    }

    const profile = await getOrCreateProfile()
    const files = formData.getAll('images') as File[]

    if (files.length === 0) {
      return { data: null, error: 'No images provided' }
    }

    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif']
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return {
          data: null,
          error: `Unsupported file type: ${file.name}. Accepts JPG, PNG, and HEIC.`,
        }
      }
    }

    // Create import batch
    const inserted = await db
      .insert(schema.importBatches)
      .values({
        profileId: profile.id,
        sourceType: 'ai_parse',
        fileName: files.map((f) => f.name).join(', '),
        status: 'pending',
        totalRows: 0,
      })
      .returning()

    if (!inserted[0]) {
      return { data: null, error: 'Failed to create import batch' }
    }

    const batchId = inserted[0].id

    // Upload images to Supabase Storage and collect URLs
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const imageUrls: string[] = []
    const storagePaths: string[] = []

    for (const file of files) {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const storagePath = `ai-imports/${profile.id}/${batchId}/${crypto.randomUUID()}.${ext}`
      const buffer = Buffer.from(await file.arrayBuffer())

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        Sentry.captureException(uploadError)
        return { data: null, error: `Failed to upload ${file.name}: ${uploadError.message}` }
      }

      storagePaths.push(storagePath)

      // Save document record linked to import batch
      await db.insert(schema.documents).values({
        profileId: profile.id,
        documentType: 'logbook_photo',
        name: file.name,
        storagePath,
        mimeType: file.type,
        fileSize: file.size,
        entityType: 'importBatch',
        entityId: batchId,
      })

      imageUrls.push(storagePath)
    }

    // Call Anthropic API for each image and aggregate results
    const allFlights: AiParsedFlight[] = []

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const base64 = buffer.toString('base64')
      const mediaType =
        file.type === 'image/heic' || file.type === 'image/heif'
          ? 'image/jpeg'
          : (file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp')

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          system: AI_SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: mediaType,
                    data: base64,
                  },
                },
                {
                  type: 'text',
                  text: 'Extract all flight entries from this logbook page.',
                },
              ],
            },
          ],
        }),
      })

      if (!response.ok) {
        const errorBody = await response.text()
        Sentry.captureException(new Error(`Anthropic API error: ${response.status} ${errorBody}`))
        return {
          data: null,
          error: `AI parsing failed (${response.status}). Please try again.`,
        }
      }

      const result = (await response.json()) as {
        content: Array<{ type: string; text?: string }>
      }

      const textContent = result.content.find((c) => c.type === 'text')
      if (!textContent?.text) {
        continue
      }

      // Parse JSON from the response — handle markdown code blocks
      let jsonText = textContent.text.trim()
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
      }

      let parsed: unknown[]
      try {
        parsed = JSON.parse(jsonText) as unknown[]
      } catch {
        Sentry.captureException(
          new Error(`Failed to parse AI response as JSON: ${jsonText.slice(0, 200)}`),
        )
        continue
      }

      if (!Array.isArray(parsed)) {
        continue
      }

      for (const rawFlight of parsed) {
        const result = aiParsedFlightSchema.safeParse(rawFlight)
        if (result.success) {
          allFlights.push(result.data)
        }
      }
    }

    // Update batch with total rows
    await db
      .update(schema.importBatches)
      .set({ totalRows: allFlights.length, updatedAt: new Date() })
      .where(eq(schema.importBatches.id, batchId))

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'importBatch',
      entityId: batchId,
      action: 'create',
      changes: { sourceType: 'ai_parse', totalRows: allFlights.length },
      metadata: { imageCount: files.length },
    })

    return { data: { batchId, flights: allFlights, imageUrls }, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return { data: null, error: 'Failed to parse logbook images' }
  }
}

// ---------- Confirm AI Import ----------

const confirmAiImportSchema = z.object({
  batchId: z.string().uuid(),
  flights: z.array(
    z.object({
      date: z.string().nullable(),
      aircraft_type: z.string().nullable(),
      aircraft_ident: z.string().nullable(),
      route_from: z.string().nullable(),
      route_to: z.string().nullable(),
      route_via: z.string().nullable(),
      total_time: z.number().nullable(),
      pic_time: z.number().nullable(),
      sic_time: z.number().nullable(),
      dual_received: z.number().nullable(),
      cross_country: z.number().nullable(),
      night_time: z.number().nullable(),
      instrument_actual: z.number().nullable(),
      instrument_simulated: z.number().nullable(),
      day_landings: z.number().int().nullable(),
      night_landings: z.number().int().nullable(),
      remarks: z.string().nullable(),
    }),
  ),
})

export async function confirmAiImport(
  data: unknown,
): Promise<{
  data: { imported: number; needsReview: number; batchId: string } | null
  error: string | null
}> {
  try {
    const profile = await getOrCreateProfile()
    const validated = confirmAiImportSchema.parse(data)
    const { batchId, flights } = validated

    // Verify batch ownership
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

    // Load existing aircraft
    const existingAircraft = await db
      .select({ id: schema.aircraft.id, tailNumber: schema.aircraft.tailNumber })
      .from(schema.aircraft)
      .where(eq(schema.aircraft.profileId, profile.id))

    const aircraftByTail = new Map(
      existingAircraft.map((a) => [a.tailNumber.toUpperCase(), a.id]),
    )

    const toStr = (v: number | null | undefined) =>
      v !== undefined && v !== null ? String(v) : undefined

    let imported = 0
    let needsReview = 0

    for (let i = 0; i < flights.length; i++) {
      const flight = flights[i]

      // Skip flights without a date — they need manual entry
      if (!flight.date || !/^\d{4}-\d{2}-\d{2}$/.test(flight.date)) {
        // Store as errored import row
        await db.insert(schema.importRows).values({
          batchId,
          rowNumber: i + 1,
          rawData: flight,
          status: 'errored',
          errors: [{ path: 'date', message: 'Missing or invalid date' }],
        })
        needsReview++
        continue
      }

      // Resolve aircraft
      let aircraftId: string | null = null
      if (flight.aircraft_ident) {
        const tailUpper = flight.aircraft_ident.toUpperCase()
        aircraftId = aircraftByTail.get(tailUpper) ?? null

        if (!aircraftId) {
          const newAircraft = await db
            .insert(schema.aircraft)
            .values({
              profileId: profile.id,
              tailNumber: tailUpper,
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
              metadata: { source: 'ai-import', batchId },
            })
          }
        }
      }

      // Build route string
      const routeParts = [flight.route_from, flight.route_via, flight.route_to].filter(Boolean)
      const route = routeParts.length > 1 ? routeParts.join(' - ') : undefined

      const insertedFlight = await db
        .insert(schema.flights)
        .values({
          profileId: profile.id,
          aircraftId,
          flightDate: flight.date,
          departureAirport: flight.route_from,
          arrivalAirport: flight.route_to,
          route,
          totalTime: toStr(flight.total_time),
          pic: toStr(flight.pic_time),
          sic: toStr(flight.sic_time),
          dualReceived: toStr(flight.dual_received),
          crossCountry: toStr(flight.cross_country),
          night: toStr(flight.night_time),
          actualInstrument: toStr(flight.instrument_actual),
          simulatedInstrument: toStr(flight.instrument_simulated),
          dayLandings: flight.day_landings ?? 0,
          nightLandings: flight.night_landings ?? 0,
          remarks: flight.remarks,
          status: 'draft',
          sourceType: 'import',
          importBatchId: batchId,
        })
        .returning({ id: schema.flights.id })

      if (insertedFlight[0]) {
        await db.insert(schema.importRows).values({
          batchId,
          rowNumber: i + 1,
          rawData: flight,
          normalizedData: flight,
          status: 'processed',
          flightId: insertedFlight[0].id,
          isReviewed: true,
        })
        imported++
      }
    }

    // Update batch
    await db
      .update(schema.importBatches)
      .set({
        status: needsReview > 0 && imported === 0 ? 'failed' : 'completed',
        totalRows: flights.length,
        processedRows: imported,
        errorRows: needsReview,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.importBatches.id, batchId))

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'importBatch',
      entityId: batchId,
      action: 'update',
      changes: { imported, needsReview },
      metadata: { action: 'confirmAiImport' },
    })

    return { data: { imported, needsReview, batchId }, error: null }
  } catch (error) {
    Sentry.captureException(error)
    if (error instanceof z.ZodError) {
      return { data: null, error: error.errors.map((e) => e.message).join(', ') }
    }
    return { data: null, error: 'Failed to import flights' }
  }
}
