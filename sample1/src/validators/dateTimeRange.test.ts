import { describe, it, expect } from 'vitest'
import { dateTimeRange } from './dateTimeRange'

const PARAMS = {
  startDate: 'schedule.startDate',
  startTime: 'schedule.startTime',
  endDate:   'schedule.endDate',
  endTime:   'schedule.endTime',
}

function formData(startDate: string, startTime: string, endDate: string, endTime: string) {
  return { schedule: { startDate, startTime, endDate, endTime } }
}

describe('dateTimeRange', () => {
  describe('with date and time fields', () => {
    it('returns true when end is after start on the same day', () => {
      expect(dateTimeRange(formData('2024-01-01', '09:00', '2024-01-01', '10:00'), PARAMS)).toBe(true)
    })

    it('returns false when end time is before start time on the same day', () => {
      expect(dateTimeRange(formData('2024-01-01', '10:00', '2024-01-01', '09:00'), PARAMS)).toBe(false)
    })

    it('returns false when end equals start', () => {
      expect(dateTimeRange(formData('2024-01-01', '09:00', '2024-01-01', '09:00'), PARAMS)).toBe(false)
    })

    it('returns true when end date is after start date regardless of times', () => {
      expect(dateTimeRange(formData('2024-01-01', '22:00', '2024-01-02', '06:00'), PARAMS)).toBe(true)
    })

    it('returns false when end date is before start date', () => {
      expect(dateTimeRange(formData('2024-01-05', '09:00', '2024-01-01', '10:00'), PARAMS)).toBe(false)
    })
  })

  describe('date-only (no time fields in params)', () => {
    const DATE_ONLY_PARAMS = {
      startDate: 'schedule.startDate',
      endDate:   'schedule.endDate',
    }

    it('returns true when end date is after start date', () => {
      expect(dateTimeRange({ schedule: { startDate: '2024-01-01', endDate: '2024-01-05' } }, DATE_ONLY_PARAMS)).toBe(true)
    })

    it('returns false when end date is before start date', () => {
      expect(dateTimeRange({ schedule: { startDate: '2024-01-05', endDate: '2024-01-01' } }, DATE_ONLY_PARAMS)).toBe(false)
    })
  })

  describe('skips validation (returns true)', () => {
    it('when startDate is missing', () => {
      expect(dateTimeRange(formData('', '09:00', '2024-01-01', '10:00'), PARAMS)).toBe(true)
    })

    it('when endDate is missing', () => {
      expect(dateTimeRange(formData('2024-01-01', '09:00', '', '10:00'), PARAMS)).toBe(true)
    })

    it('when formData is undefined', () => {
      expect(dateTimeRange(undefined, PARAMS)).toBe(true)
    })
  })
})
