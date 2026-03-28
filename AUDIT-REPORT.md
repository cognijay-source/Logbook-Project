# CrossCheck Master Audit Report

**Conducted:** 2026-03-28
**Audit Panel:** FAA Examiner, DPE, Senior Legacy Captain, Chief Pilot, Gold Seal CFI, Senior Pilot Recruiter
**Scope:** Part 61/91 digital logbook — all functions, services, validators, components, and database logic

---

## SECTION 1: CRITICAL — Regulatory Compliance Failures

### RED-1: Night Passenger Currency Does Not Distinguish Full-Stop from Touch-and-Go Landings

**Regulation:** 14 CFR 61.57(b)
**Files:** `src/lib/services/currency-evaluator.ts:273-301`, `src/lib/db/schema/flights.ts`

**Finding:** 61.57(b) requires **3 full-stop landings** at night. Touch-and-go landings do **not** satisfy night passenger currency. The database stores only a single `nightLandings` integer field with no distinction between full-stop and touch-and-go. The evaluator at line 281 simply sums all `nightLandings`:

```typescript
const total = flights.reduce((sum, f) => sum + (f.nightLandings ?? 0), 0)
```

**Risk:** A pilot logs 3 night touch-and-go landings. The system shows them as night current. They carry passengers at night. This is an FAR violation.

**Impact:** Direct. A pilot could unknowingly fly passengers at night when not legally current.

---

### RED-2: Currency Evaluator Does Not Filter by Aircraft Category/Class/Type

**Regulation:** 14 CFR 61.57(a) and (b)
**File:** `src/lib/services/currency-evaluator.ts:59-75`

**Finding:** 61.57(a) and (b) both require landings in **the same category, class, and type (if a type rating is required)**. The evaluator queries `flights` with only three filters: `profileId`, `status = 'final'`, and `flightDate >= ninetyDayCutoff`. There is no join to the `aircraft` table and no filter on category, class, or type.

The code comment at line 235-237 correctly states the regulation but the implementation ignores this requirement entirely.

**Risk:** A helicopter pilot with 3 recent helicopter landings could appear "current" for carrying passengers in a fixed-wing airplane (and vice versa). A multi-engine pilot with only single-engine landings could appear current for multi-engine passenger flight.

---

### RED-3: Instrument Currency Does Not Track Intercepting and Tracking Courses

**Regulation:** 14 CFR 61.57(c)(1)(ii)
**Files:** `src/lib/services/currency-evaluator.ts:310-372`, `src/lib/db/schema/flights.ts`

**Finding:** 61.57(c) requires within the preceding 6 calendar months: 6 instrument approaches, holding procedures, **and intercepting and tracking courses through the use of navigational electronic systems**. The evaluator checks only approaches and holds. There is no database field for tracking/intercepting and no evaluator logic for it.

**Risk:** A pilot who has completed 6 approaches and 1 hold but has not intercepted/tracked courses is shown as instrument current when they are not. In practice, most pilots accomplish tracking as part of approaches, but the system should either track it separately or document why it is assumed.

---

### AMBER-1: Instrument Currency Grace Period Missing Explicit Expiration Date

**Regulation:** 14 CFR 61.57(d)
**File:** `src/lib/services/currency-evaluator.ts:325-361`

**Finding:** When in the grace period, `expiresAt` is `null` (line 334 only sets it when `isCurrent`). The UI shows "Expiring Soon" with no date. A pilot in the grace period cannot determine when the grace period ends and an IPC becomes mandatory.

**Risk:** A pilot in the grace period may not realize they are approaching the hard 12-month cutoff requiring an IPC.

---

### AMBER-2: Flight Review Does Not Account for All Qualifying Events per 61.56(d)/(e)

**Regulation:** 14 CFR 61.56(d) and (e)
**File:** `src/lib/services/currency-evaluator.ts:380-442`

**Finding:** The evaluator checks three sources: `pilotProfiles.flightReviewDate`, flights with `isCheckride = true`, and training entries with `entryType = 'flight_review'`. Per 61.56(d), the following also satisfy the flight review requirement:
- Completing a proficiency check under Part 61, 91, 121, 125, or 135
- Completing a Wings (WINGS) phase of the FAA Pilot Proficiency Program

Per 61.56(e), completing a practical test for a certificate or rating also counts. The `isCheckride` flag covers practical tests, but there is no mechanism to log a proficiency check or WINGS phase completion as a flight review equivalent.

**Risk:** A pilot who completed WINGS or a proficiency check may be shown as having an expired flight review when they are actually current.

---

### AMBER-3: Day Passenger Currency Does Not Separately Require Takeoffs

**Regulation:** 14 CFR 61.57(a)
**File:** `src/lib/services/currency-evaluator.ts:239-267`

**Finding:** 61.57(a) requires "3 takeoffs **and** 3 landings." The system only tracks `dayLandings` and `nightLandings`. There is no takeoff tracking. In normal operations takeoffs and landings are 1:1, but technically the requirement is not fully modeled.

**Risk:** Low in practice but technically incomplete per the regulation.

---

### AMBER-4: Instrument Rating Goal Only Counts Actual Instrument Time

**Regulation:** 14 CFR 61.65(d), 61.57(c)(1)
**File:** `src/lib/db/seed.ts:345-350`

**Finding:** The instrument rating goal tracks `actual_instrument` only. 61.65(d) requires 40 hours of instrument time including both actual **and** simulated. 61.57(c) allows currency approaches in actual, simulated, or ATD/FTD/FFS. The goal tracker understates progress by excluding simulated instrument time.

**Risk:** Pilots see understated progress toward instrument rating because simulated instrument time is not included.

---

## SECTION 2: Functionality Bugs and Logic Errors

### BUG-1: PDF Reports Include Draft and Archived Flights

**File:** `src/app/(dashboard)/reports/actions.ts:125-167`

The `fetchFlightsInRange` function filters only by `profileId` and date range. There is **no filter on `status = 'final'`**. Draft and archived flights are included in all PDF reports.

Currency calculations correctly filter by `status = 'final'` (currency-evaluator.ts:71), but reports do not. The insurance report all-time query (line 300) also lacks a status filter.

**Impact:** A pilot's 8710 time summary or insurance report could include incomplete draft entries or deliberately archived/voided flights, overstating experience.

---

### BUG-2: Single-Engine Time Calculation Is Naive

**File:** `src/app/(dashboard)/reports/actions.ts:246-249`

```typescript
const tt = num(r.totalTime)
const me = num(r.multiEngine)
totals.singleEngine += tt - me
```

Single-engine time is calculated as `totalTime - multiEngine`. Non-airplane time (helicopter, glider, etc.) would incorrectly appear as "single-engine."

---

### BUG-3: 8710 Report Splits Only by Multi-Engine Boolean

**File:** `src/app/(dashboard)/reports/actions.ts:271-284`

The actual FAA Form 8710-1 requires time broken out by **category and class**: ASEL, AMEL, ASES, AMES, Helicopter, Gyroplane, Glider, etc. The report only shows ASEL and AMEL based on a boolean `isMultiEngine` flag. Non-airplane time is lumped into ASEL.

---

### BUG-4: Currency Refresh Is Asynchronous — UI May Show Stale Data

**File:** `src/app/(dashboard)/flights/actions.ts:352-355`

After flight CRUD, currency refresh triggers as fire-and-forget background job. The currency page uses 5-minute `staleTime` (currency/page.tsx:103). Users may see stale currency data until the background job completes and the cache expires.

---

## SECTION 3: Missing Disclaimers

### DISCLAIMER-1: Currency Dashboard

**Location:** `src/app/(dashboard)/currency/page.tsx`
**Current state:** No disclaimer present.

**Recommended:**
> *CrossCheck Currency is an advisory tool based on the flight data you have entered. The pilot in command is solely responsible for verifying their own currency and compliance with all applicable regulations before acting as PIC. CrossCheck does not guarantee the accuracy or completeness of currency calculations.*

---

### DISCLAIMER-2: 8710 Time Summary Report

**Location:** `src/app/(dashboard)/reports/actions.ts:522-563`
**Current state:** No disclaimer on the PDF.

**Recommended (every page footer):**
> *This document is generated by CrossCheck for personal reference only. It is NOT FAA Form 8710-1 (Application for Airman Certificate and/or Rating) and should not be submitted to the FAA as such. Verify all time totals against your official logbook records before completing the actual FAA form.*

---

### DISCLAIMER-3: Goal/Milestone Tracker

**Location:** `src/app/(dashboard)/progress/page.tsx`, `src/app/(dashboard)/journey/page.tsx`
**Current state:** No disclaimer present.

**Recommended:**
> *Progress indicators reflect aggregate flight time totals only. Meeting these minimums does not constitute eligibility for a practical test. Applicants must verify all aeronautical experience requirements with their instructor and designated examiner, including specific flight requirements (cross-country distances, solo requirements, etc.) that may not be captured by aggregate totals.*

---

### DISCLAIMER-4: AI Logbook Parser

**Location:** `src/components/imports/ai-import-section.tsx`
**Current state:** No accuracy warning.

**Recommended:**
> *AI-extracted flight data may contain errors. Handwriting recognition is not perfect — numbers, letters, and decimal points may be misread. You must carefully review and verify every field against your original logbook before confirming this import. CrossCheck is not responsible for data entry errors introduced by AI parsing.*

---

### DISCLAIMER-5: All PDF Reports

**Location:** `src/app/(dashboard)/reports/actions.ts:637-649`
**Current state:** Footer contains only page numbers.

**Recommended (every PDF, every page):**
> *Generated by CrossCheck for personal reference. This is not official FAA documentation. Verify all data against original logbook records.*

---

### DISCLAIMER-6: General Application

**Location:** Marketing/about pages or persistent footer
**Current state:** No general disclaimer exists in the application.

**Recommended:**
> *CrossCheck is a digital record-keeping tool for personal pilot use. It does not generate endorsements, signoffs, or legally binding documents. It does not interface with IACRA or any FAA system. CrossCheck is not a substitute for regulatory knowledge, and the pilot in command bears full responsibility for the accuracy of their records and compliance with all applicable Federal Aviation Regulations.*

---

## SECTION 4: Data Integrity and Validation Gaps

### VAL-1: No Cross-Field Validation on Flight Entry (CRITICAL)

**File:** `src/lib/validators/flight.ts:30-73`

The Zod schema validates individual field types but performs **zero cross-field validation**:

| Scenario | Should Be Prevented? |
|----------|---------------------|
| `dualReceived: 5, solo: 5` simultaneously | **YES** — impossible by definition |
| `pic: 10, totalTime: 5` (PIC > total) | **YES** |
| `night: 8, totalTime: 5` (night > total) | **YES** |
| `actualInstrument: 3, simulatedInstrument: 3, totalTime: 5` | **YES** |
| `crossCountry: 10, totalTime: 5` | **YES** |
| `totalTime: 0` with nonzero subcategories | **YES** |
| `dualReceived: 5, dualGiven: 5` simultaneously | **Warning** — unusual but possible |

---

### VAL-2: No Duplicate Detection on CSV Import

**File:** `src/jobs/import-processing.ts`

No deduplication logic exists. Re-importing the same CSV creates duplicate flights, doubling logged hours. No check for existing flights matching date + aircraft + departure + arrival.

---

### VAL-3: No Night Landing Full-Stop/Touch-and-Go Distinction in Database

**File:** `src/lib/db/schema/flights.ts`

The `nightLandings` field is a single integer. The database cannot distinguish between full-stop and touch-and-go. This is the root cause of RED-1.

**Needed:** Add `nightLandingsFullStop` field (or split into `nightLandingsFullStop` and `nightLandingsTouchAndGo`).

---

### VAL-4: Cross-Country Is Manual-Only with No Validation

**File:** `src/lib/validators/flight.ts:48`

Cross-country time is manually entered. No validation against route, no distance calculation, no awareness of different XC definitions across certificate levels:
- **General (61.1):** Landing at a point other than departure
- **Private (61.1(b)(3)(ii)):** Landing at a point >50nm from departure
- **Commercial (61.1(b)(3)(iv)):** Landing at a point >50nm from departure

---

### VAL-5: Future Dates Allowed Without Warning

**File:** `src/lib/validators/flight.ts:37-39`

No restriction on future flight dates. A user can enter any date with no warning.

---

### VAL-6: Blank Fields Handled Inconsistently

**File:** `src/lib/validators/flight.ts:8-17`

Blank string inputs become `undefined`/`NULL` for time fields, but `dayLandings`/`nightLandings`/`holds` default to `0` in the schema. Null time fields display as empty strings on the form. Totals use `coalesce(sum(...), 0)` so aggregation is correct, but display is inconsistent.

---

## SECTION 5: Professional Credibility Issues

### CRED-1: 8710 Report Missing Critical Categories

**File:** `src/app/(dashboard)/reports/actions.ts:522-563`

Categories on the actual FAA Form 8710-1 **missing** from the report:

| 8710-1 Category | CrossCheck Status |
|-----------------|-------------------|
| Instruction Received | **MISSING** |
| Solo | **MISSING** |
| ASES, AMES (sea categories) | **MISSING** |
| Rotorcraft Helicopter | **MISSING** — lumped into ASEL |
| Powered Lift | **MISSING** |
| Glider | **MISSING** |
| Lighter Than Air | **MISSING** |
| Simulator/FTD/ATD | **MISSING** |

---

### CRED-2: Goal Tracker Missing Critical Sub-Requirements

**File:** `src/lib/db/seed.ts:271-553`

Every certificate goal tracks only aggregate hour totals. Specific flight requirements missing:

**Private Pilot (61.109) missing:**
- 5 hours solo cross-country
- Solo XC >150nm with 3 landings, one segment >50nm
- 3 solo takeoffs/landings at towered airport
- Night XC >100nm (within 3 hrs night dual)
- 3 hours test prep within preceding 2 calendar months

**Instrument Rating (61.65) missing:**
- 50 hours PIC cross-country (not just any XC)
- 15 hours instrument from CFII
- IFR XC >250nm with 3 different approach types

**Commercial (61.129) missing:**
- 10 hours complex/TAA time
- Specific dual XC requirements (day/night with distance)
- Solo/PIC-with-instructor requirements
- 3 hours test prep within preceding 2 calendar months

---

### CRED-3: Insurance Report Missing Make/Model-Specific Recency

**File:** `src/app/(dashboard)/reports/actions.ts:566-603`

Insurance companies request make/model-specific recency (e.g., hours in C172 in the last 90 days). The report shows all-time totals by make/model and overall recent activity but does not cross-reference them.

---

### CRED-4: Flight Summary Report Missing Solo and Dual Given

**File:** `src/app/(dashboard)/reports/actions.ts:451-519`

The report omits `solo` and `dualGiven` (CFI time). For a CFI building hours, dual given is critical. Solo time is essential for Part 61 training records.

---

## SECTION 6: Recommendations (Prioritized)

### Must Fix — Required before the app should be trusted for currency tracking

1. **Add `nightLandingsFullStop` field** to flights schema and update the night currency evaluator to count only full-stop landings. Update flight form, CSV import mappings, and AI parser. (RED-1)

2. **Add aircraft category/class/type filtering to currency evaluator.** Join to aircraft table, require same category/class for landings to count. (RED-2)

3. **Add currency dashboard disclaimer** stating the pilot is responsible for verifying their own currency. (DISCLAIMER-1)

4. **Add `status = 'final'` filter to all report queries.** (BUG-1)

5. **Add cross-field validation** to flight entry: prevent `dual + solo` simultaneously and `subcategory > totalTime`. (VAL-1)

6. **Add duplicate detection to CSV import.** (VAL-2)

### Should Fix — Strongly recommended for credibility and user safety

7. **Add tracking/intercepting field** to flights schema, or document in the instrument currency card that tracking is assumed when approaches are logged. (RED-3)

8. **Add instrument currency grace period expiration date** calculation and display. (AMBER-1)

9. **Add 8710 report disclaimer** stating this is not the official FAA form. (DISCLAIMER-2)

10. **Add goal tracker disclaimer** about aggregate totals. (DISCLAIMER-3)

11. **Add AI parser accuracy warning** before photo upload. (DISCLAIMER-4)

12. **Add reference-only footer** to all PDF reports. (DISCLAIMER-5)

13. **Add sub-requirements to goal profiles.** (CRED-2)

14. **Add WINGS and proficiency check** as flight review equivalents. (AMBER-2)

15. **Expand 8710 report** to include Instruction Received, Solo, simulator time, and additional aircraft categories. (CRED-1)

16. **Combine actual + simulated instrument time** for the instrument rating goal. (AMBER-4)

### Nice to Have — Quality-of-life improvements

17. **Add future-date warning** on flight entry. (VAL-5)

18. **Add make/model-specific recency** to insurance report. (CRED-3)

19. **Add solo and dual given** to flight summary report. (CRED-4)

20. **Show user-facing edit history** for flight entries (audit table exists but not exposed).

21. **Add general terms/disclaimer page.** (DISCLAIMER-6)

22. **Fix single-engine time calculation** to filter by aircraft category. (BUG-2)

23. **Display "0.0" instead of blank** for null time fields on the flight form. (VAL-6)

---

## SECTION 7: What CrossCheck Gets Right

### Currency Evaluator Architecture
The evaluator uses a prefetch + evaluate pattern (`currency-evaluator.ts:44-172`) running 7 parallel database queries in `Promise.all`, then evaluating all rules against cached data. Efficient, avoids N+1 problems, ensures consistent point-in-time evaluation.

### Flight Review Multi-Source Lookup
Correctly checks three sources (profile date, checkride flag, training entries) and uses the most recent. The `isCheckride` flag correctly implements 61.56(d) for practical tests resetting the flight review clock.

### Instrument Currency Grace Period
The 6-to-12 month grace period logic is correctly implemented. Distinguishes current (6 months), grace period (6-12 months, safety pilot or IPC), and expired (>12 months, IPC required). Many competing products get this wrong.

### Calendar Month Calculations
`subtractCalendarMonths` and `endOfCalendarMonth` correctly implement calendar month arithmetic per FAA interpretation. Flight review expiration at line 425 correctly adds 24 calendar months and returns the last day of that month.

### Cascade Delete on Account Deletion
All foreign keys use `ON DELETE cascade`. Complete data removal on account deletion. Audit event properly logged before deletion.

### Financial Data Isolation
Financial entries are completely separate from flight records. No report query touches financial data. Zero risk of financial data leaking into reports shared with DPEs, examiners, or recruiters.

### Sentry Integration
Every `catch` block captures to Sentry. Consistent across all server actions, services, and background jobs. No errors silently swallowed.

### Server Action Security
Every server action retrieves the authenticated user's profile and includes `profileId` in WHERE clauses. Delete operations require both record ID and profile ID. Prevents cross-user data access.

### AI Parser Mandatory Review Step
AI-parsed flights are created as draft status with editable review table. AI prompt instructs extraction with confidence only, returns null for unreadable fields. UI highlights uncertain fields. Responsible implementation.

### Empty State Handling
Every dashboard page handles zero-flights gracefully with clear messaging and CTAs.

### Zod Validation at Every Boundary
All user input passes through Zod validation. Negative numbers rejected. Types enforced.

### Part 141 Correctly Not Implemented
No Part 141 setting exists in the codebase. Having no toggle is better than a non-functional one that could mislead users.

### Background Job Architecture
Trigger.dev jobs for currency, milestones, and goals follow consistent fire-and-forget pattern with daily scheduled sweep as safety net. Daily 06:00 UTC refresh catches missed updates.
