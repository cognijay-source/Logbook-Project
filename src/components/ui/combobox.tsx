'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ComboboxOption {
  value: string
  label: string
  sublabel?: string
}

interface ComboboxProps {
  value: string
  onChange: (value: string) => void
  onSearch: (query: string) => ComboboxOption[]
  placeholder?: string
  className?: string
  /** Allow free-text input (not just items from the list) */
  allowFreeText?: boolean
  /** Render footer action (e.g. "Create new...") */
  footerAction?: React.ReactNode
}

export function Combobox({
  value,
  onChange,
  onSearch,
  placeholder,
  className,
  allowFreeText = true,
  footerAction,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState(value)
  const [options, setOptions] = React.useState<ComboboxOption[]>([])
  const [highlightIndex, setHighlightIndex] = React.useState(-1)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Sync external value changes
  React.useEffect(() => {
    setQuery(value)
  }, [value])

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setQuery(q)
    const results = onSearch(q)
    setOptions(results)
    setHighlightIndex(-1)
    setOpen(results.length > 0 || !!footerAction)
    if (allowFreeText) {
      onChange(q)
    }
  }

  function selectOption(opt: ComboboxOption) {
    setQuery(opt.value)
    onChange(opt.value)
    setOpen(false)
    inputRef.current?.blur()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return
    const totalItems = options.length + (footerAction ? 1 : 0)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex((i) => (i + 1) % totalItems)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex((i) => (i - 1 + totalItems) % totalItems)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightIndex >= 0 && highlightIndex < options.length) {
        selectOption(options[highlightIndex])
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  function handleBlur(e: React.FocusEvent) {
    // Don't close if clicking inside the dropdown
    if (containerRef.current?.contains(e.relatedTarget as Node)) return
    // Short delay to allow click events on options
    setTimeout(() => setOpen(false), 150)
  }

  function handleFocus() {
    const results = onSearch(query)
    setOptions(results)
    if (results.length > 0 || footerAction) setOpen(true)
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={cn(
          'border-input bg-background h-9 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-[#10B981]/30',
          className,
        )}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
      />

      {open && (
        <div
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white shadow-lg dark:bg-zinc-900"
          role="listbox"
        >
          {options.map((opt, i) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={highlightIndex === i}
              className={cn(
                'flex w-full flex-col px-3 py-2 text-left text-sm',
                highlightIndex === i
                  ? 'bg-[#10B981]/10 text-[#059669]'
                  : 'hover:bg-gray-50 dark:hover:bg-zinc-800',
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selectOption(opt)}
              onMouseEnter={() => setHighlightIndex(i)}
            >
              <span className="font-medium">{opt.label}</span>
              {opt.sublabel && (
                <span className="text-muted-foreground text-xs">
                  {opt.sublabel}
                </span>
              )}
            </button>
          ))}
          {footerAction && (
            <div
              className={cn(
                'border-t px-3 py-2',
                highlightIndex === options.length
                  ? 'bg-[#10B981]/10'
                  : '',
              )}
            >
              {footerAction}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
