import { task } from '@trigger.dev/sdk/v3'
import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { evaluateMilestones } from '@/lib/services/milestone-engine'
import { notificationDispatchTask } from './notification-dispatch'

export const milestoneRecomputeTask = task({
  id: 'milestone-recompute',
  run: async (payload: { profileId: string }) => {
    const { profileId } = payload

    console.log(
      `[milestone-recompute] Evaluating milestones for profile ${profileId}`,
    )

    const evaluation = await evaluateMilestones(profileId)

    // Persist newly achieved milestones to user_milestones table
    let newlyAchieved = 0

    for (const result of evaluation.achieved) {
      if (!result.isAchieved) continue

      // Check if already recorded
      const existing = await db
        .select({ id: schema.userMilestones.id })
        .from(schema.userMilestones)
        .where(
          and(
            eq(schema.userMilestones.profileId, profileId),
            eq(
              schema.userMilestones.milestoneDefinitionId,
              result.definition.id,
            ),
          ),
        )
        .limit(1)

      if (existing.length > 0) continue

      // Insert new milestone achievement
      await db.insert(schema.userMilestones).values({
        profileId,
        milestoneDefinitionId: result.definition.id,
        name: result.definition.name,
        description: result.definition.description,
        category: result.definition.category,
        achievedAt: result.achievedDate ?? new Date().toISOString().split('T')[0],
        isManual: false,
      })

      newlyAchieved++

      console.log(
        `[milestone-recompute] New milestone achieved: ${result.definition.name}`,
      )

      // Fire notification for the new milestone
      await notificationDispatchTask.triggerAndWait({
        type: 'milestone_achieved',
        profileId,
        title: 'Milestone Achieved!',
        message: `Congratulations! You reached: ${result.definition.name}`,
      })
    }

    console.log(
      `[milestone-recompute] Done — ${evaluation.achieved.length} total achieved, ${newlyAchieved} newly recorded`,
    )

    return {
      success: true,
      profileId,
      totalAchieved: evaluation.achieved.length,
      newlyAchieved,
      pending: evaluation.pending.length,
    }
  },
})
