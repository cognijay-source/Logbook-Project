'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

type EntryCardProps = {
  id: string
  entryType: string
  category: string
  amount: string | null
  entryDate: string
  description: string | null
  vendor: string | null
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function EntryCard({
  id,
  entryType,
  category,
  amount,
  entryDate,
  description,
  vendor,
  onEdit,
  onDelete,
}: EntryCardProps) {
  const isExpense = entryType === 'expense'
  const numericAmount = parseFloat(amount ?? '0')

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                isExpense
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {isExpense ? 'Expense' : 'Income'}
            </span>
            <span className="text-muted-foreground text-sm">
              {formatDate(entryDate)}
            </span>
          </div>
          <p className="mt-1 truncate font-medium">{description || category}</p>
          <div className="text-muted-foreground mt-0.5 flex items-center gap-2 text-sm">
            <span>{category}</span>
            {vendor && (
              <>
                <span>&middot;</span>
                <span className="truncate">{vendor}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 pl-4">
          <p
            className={`text-lg font-semibold whitespace-nowrap ${
              isExpense ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {isExpense ? '-' : '+'}
            {formatCurrency(numericAmount)}
          </p>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(id)}
              aria-label="Edit entry"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(id)}
              aria-label="Delete entry"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
