import { task } from '@trigger.dev/sdk/v3'

export const importProcessingTask = task({
  id: 'import-processing',
  run: async (payload: { batchId: string; profileId: string }) => {
    // TODO: Read import_rows for the batch
    // Validate each row against importRowSchema
    // Create flight drafts for valid rows
    // Mark rows as processed/errored
    console.log(
      `[import-processing] Processing batch ${payload.batchId} for profile ${payload.profileId}`,
    )
    return { success: true, batchId: payload.batchId }
  },
})
