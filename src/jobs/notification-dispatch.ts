import { task } from '@trigger.dev/sdk/v3'

export const notificationDispatchTask = task({
  id: 'notification-dispatch',
  run: async (payload: {
    type: string
    profileId: string
    title: string
    message: string
  }) => {
    const { type, profileId, title, message } = payload

    // Placeholder — real delivery comes later when the notifications table exists
    console.log(
      `[notification-dispatch] type=${type} profile=${profileId} title="${title}" message="${message}"`,
    )

    return { success: true, type, profileId }
  },
})
