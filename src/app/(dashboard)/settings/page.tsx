'use client'

import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { ProfileForm } from '@/components/settings/profile-form'
import { PreferencesForm } from '@/components/settings/preferences-form'
import { AccountSection } from '@/components/settings/account-section'
import { motion } from 'framer-motion'
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">⚙️ Settings</h1>
      <p className="mt-2 text-[var(--text-secondary)]">
        Manage your account, profile, and preferences.
      </p>

      {isLoading && (
        <div className="mt-8 space-y-8">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      )}

      {isError && (
        <div className="mt-8 card-elevated border-[var(--status-expired)]/20 bg-[var(--status-expired)]/5 p-4 text-center text-sm text-[var(--status-expired)]">
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
    </motion.div>
  )
}
