import { task } from '@trigger.dev/sdk/v3'

export const goalProgressRefreshTask = task({
  id: 'goal-progress-refresh',
  run: async (payload: { profileId: string }) => {
    // TODO: Import and call getGoalProgress
    // Then cache or update any derived progress data
    console.log(
      `[goal-progress-refresh] Refreshing goal progress for profile ${payload.profileId}`,
    )
    return { success: true, profileId: payload.profileId }
  },
})
