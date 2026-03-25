import { task } from '@trigger.dev/sdk/v3'

export const currencyRefreshTask = task({
  id: 'currency-refresh',
  run: async (payload: { profileId: string }) => {
    // TODO: Import and call evaluateCurrency
    // Then update user_currency_status table
    console.log(
      `[currency-refresh] Refreshing currency for profile ${payload.profileId}`,
    )
    return { success: true, profileId: payload.profileId }
  },
})
