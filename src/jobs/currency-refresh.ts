import { task, schedules } from '@trigger.dev/sdk/v3'
import { eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { evaluateCurrency } from '@/lib/services/currency-evaluator'
import { notificationDispatchTask } from './notification-dispatch'

export const currencyRefreshTask = task({
  id: 'currency-refresh',
  run: async (payload: { profileId: string }) => {
    const { profileId } = payload

    console.log(
      `[currency-refresh] Refreshing currency for profile ${profileId}`,
    )

    const results = await evaluateCurrency(profileId)

    // Persist results to user_currency_status table
    for (const result of results) {
      // Upsert: check if a row exists for this profile + rule
      const existingForRule = await db
        .select({ id: schema.userCurrencyStatus.id })
        .from(schema.userCurrencyStatus)
        .where(
          sql`${schema.userCurrencyStatus.profileId} = ${profileId} AND ${schema.userCurrencyStatus.ruleDefinitionId} = ${result.rule.id}`,
        )
        .limit(1)

      if (existingForRule.length > 0) {
        await db
          .update(schema.userCurrencyStatus)
          .set({
            isCurrent: result.isCurrent ?? false,
            expiresAt: result.expiresAt,
            lastEvaluatedAt: new Date(),
            details: result.details,
            updatedAt: new Date(),
          })
          .where(eq(schema.userCurrencyStatus.id, existingForRule[0].id))
      } else {
        await db.insert(schema.userCurrencyStatus).values({
          profileId,
          ruleDefinitionId: result.rule.id,
          isCurrent: result.isCurrent ?? false,
          expiresAt: result.expiresAt,
          lastEvaluatedAt: new Date(),
          details: result.details,
        })
      }

      // Flag currencies expiring within 30 days
      if (result.status === 'expiring') {
        console.log(
          `[currency-refresh] Currency expiring soon: ${result.rule.name} (expires ${result.expiresAt})`,
        )

        await notificationDispatchTask.triggerAndWait({
          type: 'currency_expiring',
          profileId,
          title: 'Currency Expiring Soon',
          message:
            `${result.rule.name} expires ${result.expiresAt}. ${result.needed ?? ''}`.trim(),
        })
      }
    }

    const currentCount = results.filter((r) => r.status === 'current').length
    const expiringCount = results.filter((r) => r.status === 'expiring').length
    const expiredCount = results.filter((r) => r.status === 'expired').length

    console.log(
      `[currency-refresh] Done — ${currentCount} current, ${expiringCount} expiring, ${expiredCount} expired`,
    )

    return {
      success: true,
      profileId,
      current: currentCount,
      expiring: expiringCount,
      expired: expiredCount,
    }
  },
})

/**
 * Scheduled daily currency refresh for all active profiles.
 * Runs at 06:00 UTC every day.
 */
export const dailyCurrencyRefreshTask = schedules.task({
  id: 'daily-currency-refresh',
  run: async () => {
    console.log('[daily-currency-refresh] Starting daily currency refresh')

    // Get all profiles that have at least one final flight (active users)
    const activeProfiles = await db
      .select({ profileId: schema.flights.profileId })
      .from(schema.flights)
      .where(eq(schema.flights.status, 'final'))
      .groupBy(schema.flights.profileId)

    console.log(
      `[daily-currency-refresh] Found ${activeProfiles.length} active profiles`,
    )

    for (const { profileId } of activeProfiles) {
      await currencyRefreshTask.trigger({ profileId })
    }

    console.log('[daily-currency-refresh] All refresh tasks triggered')

    return {
      success: true,
      profilesProcessed: activeProfiles.length,
    }
  },
})
