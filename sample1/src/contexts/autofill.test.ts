import { describe, it, expect } from 'vitest'
import { extractProvidesMap, extractAutofillRules } from './autofill'
import type { AutofillFn, DepStore } from './autofill'

// ---------------------------------------------------------------------------
// extractProvidesMap
// ---------------------------------------------------------------------------

describe('extractProvidesMap', () => {
  it('returns an empty map when no field declares provides', () => {
    expect(extractProvidesMap({ firstName: { 'ui:options': { page: 'p1' } } })).toEqual({})
  })

  it('maps a top-level field', () => {
    expect(extractProvidesMap({
      role: { 'ui:options': { provides: 'userRole' } },
    })).toEqual({ userRole: 'role' })
  })

  it('maps a nested field using a dot-path', () => {
    expect(extractProvidesMap({
      schedule: {
        startDate: { 'ui:options': { provides: 'scheduleStart' } },
      },
    })).toEqual({ scheduleStart: 'schedule.startDate' })
  })

  it('maps multiple provides annotations across different depths', () => {
    expect(extractProvidesMap({
      role: { 'ui:options': { provides: 'userRole' } },
      schedule: {
        startDate: { 'ui:options': { provides: 'scheduleStart' } },
        endDate:   { 'ui:options': { provides: 'scheduleEnd' } },
      },
    })).toEqual({
      userRole:      'role',
      scheduleStart: 'schedule.startDate',
      scheduleEnd:   'schedule.endDate',
    })
  })

  it('does not include ui:* keys in the path', () => {
    expect(extractProvidesMap({
      schedule: {
        'ui:ObjectFieldTemplate': 'SomeTemplate',
        'ui:options': { page: 'scheduling' },
        startDate: { 'ui:options': { provides: 'scheduleStart' } },
      },
    })).toEqual({ scheduleStart: 'schedule.startDate' })
  })

  it('ignores provides at root level where the path would be empty', () => {
    expect(extractProvidesMap({
      'ui:options': { provides: 'root' },
    })).toEqual({})
  })

  it('ignores non-string provides values', () => {
    expect(extractProvidesMap({
      field: { 'ui:options': { provides: 42 } },
    })).toEqual({})
  })
})

// ---------------------------------------------------------------------------
// extractAutofillRules — verifies params and mode round-trip correctly
// ---------------------------------------------------------------------------

describe('extractAutofillRules', () => {
  it('returns an empty array when no field declares autofill', () => {
    expect(extractAutofillRules({ firstName: { 'ui:options': { page: 'p1' } } })).toEqual([])
  })

  it('infers target from the field path when not specified', () => {
    const rules = extractAutofillRules({
      schedule: {
        endDate: {
          'ui:options': {
            autofill: {
              fn: 'addMonthsToField',
              params: { source: 'scheduleStart', months: 1 },
              mode: 'always',
            },
          },
        },
      },
    })
    expect(rules).toHaveLength(1)
    expect(rules[0]).toEqual({
      target: 'schedule.endDate',
      fn: 'addMonthsToField',
      params: { source: 'scheduleStart', months: 1 },
      mode: 'always',
    })
  })

  it('uses an explicit target when provided, overriding the field path', () => {
    const rules = extractAutofillRules({
      a: { 'ui:options': { autofill: { fn: 'fnA', target: 'b' } } },
    })
    expect(rules[0].target).toBe('b')
  })

  it('extracts multiple rules and infers each target from its field path', () => {
    const rules = extractAutofillRules({
      a: { 'ui:options': { autofill: { fn: 'fnA' } } },
      b: { 'ui:options': { autofill: { fn: 'fnB' } } },
    })
    expect(rules).toHaveLength(2)
    expect(rules.map(r => r.fn)).toEqual(['fnA', 'fnB'])
    expect(rules.map(r => r.target)).toEqual(['a', 'b'])
  })
})

// ---------------------------------------------------------------------------
// Autofill computation: addMonthsToField
//
// Tests the fn registered in ContactForm in isolation. UTC arithmetic ensures
// the result is timezone-independent — new Date(isoDateString) always parses
// as UTC midnight, so all month math must stay in UTC.
// ---------------------------------------------------------------------------

describe('addMonthsToField', () => {
  // Same implementation as the registered fn in ContactForm
  const addMonthsToField: AutofillFn = (_formData, depStore, params) => {
    const raw = depStore[params.source as string]
    if (typeof raw !== 'string' || !raw) return undefined
    const [year, month, day] = raw.split('-').map(Number)
    const d = new Date(Date.UTC(year, month - 1 + (params.months as number), day))
    return d.toISOString().split('T')[0]
  }

  const p = (months: number) => ({ source: 'scheduleStart', months })

  it('adds one month mid-month', () => {
    const store: DepStore = { scheduleStart: '2024-03-15' }
    expect(addMonthsToField({}, store, p(1))).toBe('2024-04-15')
  })

  it('rolls over to the next year when adding to December', () => {
    const store: DepStore = { scheduleStart: '2024-12-10' }
    expect(addMonthsToField({}, store, p(1))).toBe('2025-01-10')
  })

  it('handles adding multiple months', () => {
    const store: DepStore = { scheduleStart: '2024-01-15' }
    expect(addMonthsToField({}, store, p(3))).toBe('2024-04-15')
  })

  it('spans a full year', () => {
    const store: DepStore = { scheduleStart: '2024-06-01' }
    expect(addMonthsToField({}, store, p(12))).toBe('2025-06-01')
  })

  it('overflows month-end days via JS date arithmetic (Jan 31 + 1 month → Mar 2)', () => {
    // 2024 is a leap year: Feb has 29 days; day 31 overflows by 2 → Mar 2
    const store: DepStore = { scheduleStart: '2024-01-31' }
    expect(addMonthsToField({}, store, p(1))).toBe('2024-03-02')
  })

  it('returns undefined when the source key is absent from depStore', () => {
    expect(addMonthsToField({}, {}, p(1))).toBeUndefined()
  })

  it('returns undefined when the source value is an empty string', () => {
    const store: DepStore = { scheduleStart: '' }
    expect(addMonthsToField({}, store, p(1))).toBeUndefined()
  })

  it('reads from the named depStore key, not from formData', () => {
    // formData has a different path; fn must use depStore exclusively
    const store: DepStore = { scheduleStart: '2024-05-10' }
    const formData = { schedule: { startDate: '1900-01-01' } }
    expect(addMonthsToField(formData, store, p(2))).toBe('2024-07-10')
  })
})
