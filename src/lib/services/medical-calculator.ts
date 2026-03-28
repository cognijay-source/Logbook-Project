export type MedicalClass = '1st' | '2nd' | '3rd' | 'basicmed' | 'none'

export type MedicalStatus = 'current' | 'expiring' | 'expired' | 'basicmed' | 'none'

export type MedicalInfo = {
  status: MedicalStatus
  medicalClass: MedicalClass
  issueDate: string | null
  expiryDate: string | null
  daysUntilExpiry: number | null
  message: string
}

/**
 * Calculate medical certificate expiration per 14 CFR § 61.23(d).
 *
 * Medical expires at the END of the calendar month, N months after issue.
 */
export function calculateMedicalExpiry(
  medicalClass: MedicalClass,
  issueDate: Date,
  pilotDateOfBirth: Date,
): Date {
  // Determine age at issue date
  let age = issueDate.getFullYear() - pilotDateOfBirth.getFullYear()
  const monthDiff = issueDate.getMonth() - pilotDateOfBirth.getMonth()
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && issueDate.getDate() < pilotDateOfBirth.getDate())
  ) {
    age--
  }

  const isOver40 = age >= 40

  let months: number
  switch (medicalClass) {
    case '1st':
      months = isOver40 ? 6 : 12
      break
    case '2nd':
      months = 12
      break
    case '3rd':
      months = isOver40 ? 24 : 60
      break
    default:
      months = 12
  }

  // End of calendar month, N months after issue
  return endOfCalendarMonth(addCalendarMonths(issueDate, months))
}

/**
 * Evaluate the current medical certificate status.
 */
export function evaluateMedical(
  medicalClass: MedicalClass | string | null,
  issueDate: string | null,
  expiryDate: string | null,
  dateOfBirth: string | null,
): MedicalInfo {
  if (!medicalClass || medicalClass === 'none') {
    return {
      status: 'none',
      medicalClass: 'none',
      issueDate: null,
      expiryDate: null,
      daysUntilExpiry: null,
      message: 'No medical certificate on file',
    }
  }

  // Map from settings form values to our type
  const classMap: Record<string, MedicalClass> = {
    First: '1st',
    Second: '2nd',
    Third: '3rd',
    BasicMed: 'basicmed',
    '1st': '1st',
    '2nd': '2nd',
    '3rd': '3rd',
    basicmed: 'basicmed',
  }

  const normalizedClass = classMap[medicalClass] ?? 'none'

  if (normalizedClass === 'basicmed') {
    return {
      status: 'basicmed',
      medicalClass: 'basicmed',
      issueDate: null,
      expiryDate: null,
      daysUntilExpiry: null,
      message: 'BasicMed — verify compliance with § 68 requirements',
    }
  }

  // Try to auto-calculate expiry if we have issue date and DOB
  let effectiveExpiry = expiryDate
  if (issueDate && dateOfBirth && normalizedClass !== 'none') {
    const calculated = calculateMedicalExpiry(
      normalizedClass,
      new Date(issueDate),
      new Date(dateOfBirth),
    )
    effectiveExpiry = calculated.toISOString().split('T')[0]
  } else if (expiryDate) {
    effectiveExpiry = new Date(expiryDate).toISOString().split('T')[0]
  }

  if (!effectiveExpiry) {
    return {
      status: 'none',
      medicalClass: normalizedClass,
      issueDate,
      expiryDate: null,
      daysUntilExpiry: null,
      message: 'Medical certificate issue date and date of birth needed to calculate expiration',
    }
  }

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const expiry = new Date(effectiveExpiry)
  expiry.setHours(0, 0, 0, 0)

  const daysUntilExpiry = Math.ceil(
    (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  )

  const classLabel =
    normalizedClass === '1st'
      ? 'First'
      : normalizedClass === '2nd'
        ? 'Second'
        : 'Third'

  if (daysUntilExpiry < 0) {
    return {
      status: 'expired',
      medicalClass: normalizedClass,
      issueDate,
      expiryDate: effectiveExpiry,
      daysUntilExpiry,
      message: `Your ${classLabel} Class medical expired on ${effectiveExpiry}. You cannot act as PIC without a valid medical.`,
    }
  }

  if (daysUntilExpiry <= 30) {
    return {
      status: 'expiring',
      medicalClass: normalizedClass,
      issueDate,
      expiryDate: effectiveExpiry,
      daysUntilExpiry,
      message: `Your ${classLabel} Class medical expires on ${effectiveExpiry}. Schedule your AME appointment.`,
    }
  }

  return {
    status: 'current',
    medicalClass: normalizedClass,
    issueDate,
    expiryDate: effectiveExpiry,
    daysUntilExpiry,
    message: `${classLabel} Class medical current through ${effectiveExpiry}`,
  }
}

function addCalendarMonths(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

function endOfCalendarMonth(date: Date): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + 1)
  d.setDate(0) // last day of previous month
  return d
}
