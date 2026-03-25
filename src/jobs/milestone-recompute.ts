import { task } from '@trigger.dev/sdk/v3'

export const milestoneRecomputeTask = task({
  id: 'milestone-recompute',
  run: async (payload: { profileId: string }) => {
    // TODO: Import and call evaluateMilestones
    // Then persist newly achieved milestones to user_milestones table
    console.log(
      `[milestone-recompute] Evaluating milestones for profile ${payload.profileId}`,
    )
    return { success: true, profileId: payload.profileId }
  },
})
