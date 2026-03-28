import { task } from '@trigger.dev/sdk/v3'
import * as Sentry from '@sentry/nextjs'
import { eq, and, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { importRowSchema } from '@/lib/validators/import'
import { createAuditEvent } from '@/lib/services/audit'
import type { ColumnMapping } from '@/lib/validators/import'

const CHUNK_SIZE = 50

/**
 * Normalize a date string from various CSV formats into YYYY-MM-DD.
 */
function normalizeDateString(raw: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw

  const slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (slashMatch) {
    const [, m, d, y] = slashMatch
    return `${y}-${m!.padStart(2, '0')}-${d!.padStart(2, '0')}`
  }

  const dashMatch = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/)
  if (dashMatch) {
    const [, d, m, y] = dashMatch
    return `${y}-${m}-${d}`
  }

  const parsed = new Date(raw)
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0]
  }

  return raw
}

const toStr = (v: number | undefined) =>
  v !== undefined ? String(v) : undefined

export const importProcessingTask = task({
  id: 'import-processing',
  run: async (payload: {
    batchId: string
    profileId: string
    columnMapping: ColumnMapping
  }) => {
    const { batchId, profileId, columnMapping } = payload

    console.log(
      `[import-processing] Processing batch ${batchId} for profile ${profileId}`,
    )

    // Mark batch as processing
    await db
      .update(schema.importBatches)
      .set({
        status: 'processing',
        startedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.importBatches.id, batchId))

    // Load user's existing aircraft for tail number matching
    const existingAircraft = await db
      .select({
        id: schema.aircraft.id,
        tailNumber: schema.aircraft.tailNumber,
      })
      .from(schema.aircraft)
      .where(eq(schema.aircraft.profileId, profileId))

    const aircraftByTail = new Map(
      existingAircraft.map((a) => [a.tailNumber.toUpperCase(), a.id]),
    )

    // Load all pending rows for this batch
    const allRows = await db
      .select()
      .from(schema.importRows)
      .where(
        and(
          eq(schema.importRows.batchId, batchId),
          eq(schema.importRows.status, 'pending'),
        ),
      )
      .orderBy(schema.importRows.rowNumber)

    let totalProcessed = 0
    let totalErrored = 0
    let totalSkippedDuplicates = 0

    // Process in chunks of CHUNK_SIZE
    for (let i = 0; i < allRows.length; i += CHUNK_SIZE) {
      const chunk = allRows.slice(i, i + CHUNK_SIZE)

      for (const row of chunk) {
        try {
          const rawData = row.rawData as Record<string, string>

          // Apply column mapping to build normalized row
          const mapped: Record<string, string> = {}
          for (const [csvCol, ccField] of Object.entries(columnMapping)) {
            if (ccField && rawData[csvCol] !== undefined) {
              mapped[ccField] = rawData[csvCol]
            }
          }

          // Normalize the date
          if (mapped.flightDate) {
            mapped.flightDate = normalizeDateString(mapped.flightDate)
          }

          // Validate against import row schema
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
              .set({
                normalizedData: mapped,
                status: 'errored',
                errors,
                updatedAt: new Date(),
              })
              .where(eq(schema.importRows.id, row.id))

            totalErrored++
            continue
          }

          const validRow = result.data

          // Resolve aircraft by tail number
          let aircraftId: string | null = null
          if (validRow.tailNumber) {
            const tailUpper = validRow.tailNumber.toUpperCase()
            aircraftId = aircraftByTail.get(tailUpper) ?? null

            // Auto-create aircraft if not found
            if (!aircraftId) {
              const newAircraft = await db
                .insert(schema.aircraft)
                .values({
                  profileId,
                  tailNumber: validRow.tailNumber.toUpperCase(),
                })
                .returning({ id: schema.aircraft.id })

              if (newAircraft[0]) {
                aircraftId = newAircraft[0].id
                aircraftByTail.set(tailUpper, aircraftId)

                await createAuditEvent({
                  profileId,
                  entityType: 'aircraft',
                  entityId: aircraftId,
                  action: 'create',
                  metadata: { source: 'csv-import', batchId },
                })
              }
            }
          }

          // Check for duplicate flight
          const existingFlight = await db
            .select({ id: schema.flights.id })
            .from(schema.flights)
            .where(
              and(
                eq(schema.flights.profileId, profileId),
                eq(schema.flights.flightDate, validRow.flightDate),
                sql`${schema.flights.departureAirport} IS NOT DISTINCT FROM ${validRow.departureAirport ?? null}`,
                sql`${schema.flights.arrivalAirport} IS NOT DISTINCT FROM ${validRow.arrivalAirport ?? null}`,
                sql`${schema.flights.totalTime}::numeric IS NOT DISTINCT FROM ${validRow.totalTime !== undefined ? String(validRow.totalTime) : null}::numeric`,
              ),
            )
            .limit(1)

          if (existingFlight.length > 0) {
            await db
              .update(schema.importRows)
              .set({
                normalizedData: mapped,
                status: 'errored',
                errors: [
                  {
                    path: 'duplicate',
                    message: 'Duplicate flight — skipped',
                  },
                ],
                updatedAt: new Date(),
              })
              .where(eq(schema.importRows.id, row.id))

            totalSkippedDuplicates++
            continue
          }

          // Insert flight
          const insertedFlight = await db
            .insert(schema.flights)
            .values({
              profileId,
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
              // Conservative assumption: if the import source doesn't distinguish
              // full-stop from touch-and-go night landings, treat all night
              // landings as full-stop. This matches ForeFlight behavior where
              // "Night Landings" typically means full-stop per § 61.57(b).
              nightLandingsFullStop: validRow.nightLandings ?? 0,
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
                normalizedData: mapped,
                status: 'processed',
                flightId: insertedFlight[0].id,
                updatedAt: new Date(),
              })
              .where(eq(schema.importRows.id, row.id))

            totalProcessed++
          }
        } catch (rowError) {
          Sentry.captureException(rowError)

          await db
            .update(schema.importRows)
            .set({
              status: 'errored',
              errors: [
                { path: 'unknown', message: 'Unexpected error processing row' },
              ],
              updatedAt: new Date(),
            })
            .where(eq(schema.importRows.id, row.id))

          totalErrored++
        }
      }

      // Update batch progress after each chunk
      await db
        .update(schema.importBatches)
        .set({
          processedRows: totalProcessed,
          errorRows: totalErrored,
          updatedAt: new Date(),
        })
        .where(eq(schema.importBatches.id, batchId))

      console.log(
        `[import-processing] Chunk complete — ${totalProcessed} processed, ${totalErrored} errored so far`,
      )
    }

    // Final batch status update
    const totalErrors = totalErrored + totalSkippedDuplicates
    await db
      .update(schema.importBatches)
      .set({
        status:
          totalErrors > 0 && totalProcessed === 0 ? 'failed' : 'completed',
        processedRows: totalProcessed,
        errorRows: totalErrors,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.importBatches.id, batchId))

    await createAuditEvent({
      profileId,
      entityType: 'importBatch',
      entityId: batchId,
      action: 'update',
      changes: {
        processed: totalProcessed,
        errored: totalErrored,
        skippedDuplicates: totalSkippedDuplicates,
      },
      metadata: { action: 'importProcessingTask' },
    })

    console.log(
      `[import-processing] Done — ${totalProcessed} processed, ${totalErrored} errored, ${totalSkippedDuplicates} skipped (duplicate)`,
    )

    return {
      success: true,
      batchId,
      processed: totalProcessed,
      errored: totalErrored,
      skippedDuplicates: totalSkippedDuplicates,
    }
  },
})
