'use client'

import { useCallback } from 'react'
import { Combobox, type ComboboxOption } from '@/components/ui/combobox'
import { searchAirports } from '@/lib/data/airports'

interface AirportComboboxProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function AirportCombobox({
  value,
  onChange,
  placeholder = 'ICAO/IATA',
}: AirportComboboxProps) {
  const handleSearch = useCallback((query: string): ComboboxOption[] => {
    const results = searchAirports(query, 8)
    return results.map((a) => ({
      value: a.icao,
      label: `${a.icao} / ${a.iata}`,
      sublabel: `${a.name} — ${a.city}, ${a.state}`,
    }))
  }, [])

  return (
    <Combobox
      value={value}
      onChange={(v) => onChange(v.toUpperCase())}
      onSearch={handleSearch}
      placeholder={placeholder}
      className="uppercase"
      allowFreeText
    />
  )
}
