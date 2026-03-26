import { task } from '@trigger.dev/sdk/v3'
import { getGoalProgress } from '@/lib/services/goal-progress'
import { notificationDispatchTask } from './notification-dispatch'

export const goalProgressRefreshTask = task({
  id: 'goal-progress-refresh',
  run: async (payload: { profileId: string }) => {
    const { profileId } = payload

    console.log(
      `[goal-progress-refresh] Refreshing goal progress for profile ${profileId}`,
    )

    const progress = await getGoalProgress(profileId)

    if (!progress) {
      console.log(`[goal-progress-refresh] No active goal for profile ${profileId}`)
      return { success: true, profileId, hasGoal: false }
    }

    // Check for newly completed requirements (100% progress)
    const completedRequirements = progress.requirements.filter(
      (r) => r.percentage >= 100,
    )

    for (const req of completedRequirements) {
      console.log(
        `[goal-progress-refresh] Requirement met: ${req.label} (${req.current}/${req.required})`,
      )
    }

    // Check if all requirements are met
    const allMet = progress.requirements.every((r) => r.percentage >= 100)

    if (allMet) {
      console.log(
        `[goal-progress-refresh] All requirements met for goal: ${progress.goalProfile.name}`,
      )

      await notificationDispatchTask.triggerAndWait({
        type: 'goal_completed',
        profileId,
        title: 'Goal Complete!',
        message: `You have met all requirements for: ${progress.goalProfile.name}`,
      })
    } else if (completedRequirements.length > 0) {
      await notificationDispatchTask.triggerAndWait({
        type: 'goal_progress',
        profileId,
        title: 'Goal Progress',
        message: `${completedRequirements.length} of ${progress.requirements.length} requirements met for ${progress.goalProfile.name}`,
      })
    }

    return {
      success: true,
      profileId,
      goalName: progress.goalProfile.name,
      totalRequirements: progress.requirements.length,
      completedRequirements: completedRequirements.length,
      allMet,
    }
  },
})
