'use client'

import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { PageTransition } from '@/components/page-transition'
import { ProfileForm } from '@/components/settings/profile-form'
import { PreferencesForm } from '@/components/settings/preferences-form'
import { AccountSection } from '@/components/settings/account-section'
import {
  getProfile,
  updateProfile,
  updatePreferences,
  changePassword,
  deleteAccount,
} from './actions'

export default function SettingsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['settings-profile'],
    queryFn: async () => {
      const result = await getProfile()
      if (result.error) throw new Error(result.error)
      return result.data!
    },
  })

  return (
    <PageTransition>
    <div>
      <h1 className="font-heading text-3xl font-bold">⚙️ Settings</h1>
      <p className="text-muted-foreground mt-2">
        Manage your account, profile, and preferences.
      </p>

      {isLoading && (
        <div className="mt-8 space-y-8">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      )}

      {isError && (
        <div className="text-destructive mt-8 rounded-lg border p-4">
          Could not load settings.
        </div>
      )}

      {data && (
        <div className="mt-8 space-y-8">
          <ProfileForm
            profile={data.profile}
            pilotProfile={data.pilotProfile}
            action={updateProfile}
          />

          <PreferencesForm
            timeFormat={data.profile.timeFormat ?? 'decimal'}
            timezone={data.profile.timezone ?? 'UTC'}
            action={updatePreferences}
          />

          <AccountSection
            changePasswordAction={changePassword}
            deleteAccountAction={deleteAccount}
          />
        </div>
      )}
    </div>
    </PageTransition>
  )
}
