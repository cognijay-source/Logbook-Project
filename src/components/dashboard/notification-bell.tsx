'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getUnreadCount } from '@/app/(dashboard)/notifications/actions'

export function NotificationBell() {
  const { data: count } = useQuery({
    queryKey: ['notification-unread-count'],
    queryFn: async () => {
      const result = await getUnreadCount()
      if (result.error) return 0
      return result.data
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  })

  return (
    <Button variant="ghost" size="icon" className="relative rounded-full" asChild>
      <Link href="/notifications" aria-label="Notifications">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0f0f3] transition-colors duration-200 hover:bg-[#e8e8ed]">
          <Bell className="h-4 w-4 text-[#6b6b7b]" />
        </div>
        {(count ?? 0) > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#10B981] px-1 text-[10px] font-bold text-white">
            {count! > 99 ? '99+' : count}
          </span>
        )}
      </Link>
    </Button>
  )
}
