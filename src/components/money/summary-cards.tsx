'use client'

import { ArrowDownRight, ArrowUpRight, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

type SummaryCardsProps = {
  totalExpenses: number
  totalIncome: number
  netAmount: number
  isLoading?: boolean
}

export function SummaryCards({
  totalExpenses,
  totalIncome,
  netAmount,
  isLoading,
}: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card className="border-l-4 border-l-red-400">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            Expenses
          </CardTitle>
          <ArrowDownRight className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-600 tabular-nums dark:text-red-400">
            {formatCurrency(totalExpenses)}
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-green-400">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            Income
          </CardTitle>
          <ArrowUpRight className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-600 tabular-nums dark:text-green-400">
            {formatCurrency(totalIncome)}
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-sky-400">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            Net
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-sky-500" />
        </CardHeader>
        <CardContent>
          <p
            className={`text-2xl font-bold tabular-nums ${
              netAmount >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {formatCurrency(netAmount)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
