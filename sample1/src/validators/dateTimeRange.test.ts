import { describe, it, expect } from 'vitest'
import { dateTimeRange } from './dateTimeRange'
import { makeErrorsMock, getErrors } from './testUtils'

const PARAMS = {
  startDate: 'schedule.startDate',
  startTime: 'schedule.startTime',
  endDate:   'schedule.endDate',
  endTime:   'schedule.endTime',
  errorPath: 'schedule.endTime',
}

function formData(
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string,
) {
  return { schedule: { startDate, startTime, endDate, endTime } }
}

describe('dateTimeRange', () => {
  describe('with date and time fields', () => {
    it('passes when end is after start on the same day', () => {
      const errors = makeErrorsMock()
      dateTimeRange(PARAMS)(formData('2024-01-01', '09:00', '2024-01-01', '10:00'), errors)
      expect(getErrors(errors, 'schedule.endTime')).toHaveLength(0)
    })

    it('fails when end time is before start time on the same day', () => {
      const errors = makeErrorsMock()
      dateTimeRange(PARAMS)(formData('2024-01-01', '10:00', '2024-01-01', '09:00'), errors)
      expect(getErrors(errors, 'schedule.endTime')).toHaveLength(1)
    })

    it('fails when end equals start', () => {
      const errors = makeErrorsMock()
      dateTimeRange(PARAMS)(formData('2024-01-01', '09:00', '2024-01-01', '09:00'), errors)
      expect(getErrors(errors, 'schedule.endTime')).toHaveLength(1)
    })

    it('passes when end date is after start date regardless of times', () => {
      const errors = makeErrorsMock()
      dateTimeRange(PARAMS)(formData('2024-01-01', '22:00', '2024-01-02', '06:00'), errors)
      expect(getErrors(errors, 'schedule.endTime')).toHaveLength(0)
    })

    it('fails when end date is before start date', () => {
      const errors = makeErrorsMock()
      dateTimeRange(PARAMS)(formData('2024-01-05', '09:00', '2024-01-01', '10:00'), errors)
      expect(getErrors(errors, 'schedule.endTime')).toHaveLength(1)
    })

    it('attaches the error to errorPath', () => {
      const errors = makeErrorsMock()
      dateTimeRange(PARAMS)(formData('2024-01-01', '10:00', '2024-01-01', '09:00'), errors)
      expect(getErrors(errors, 'schedule.endTime')).toHaveLength(1)
      expect(getErrors(errors, 'schedule.endDate')).toHaveLength(0)
    })

    it('errorPath can point anywhere', () => {
      const errors = makeErrorsMock()
      dateTimeRange({ ...PARAMS, errorPath: 'schedule.endDate' })(
        formData('2024-01-01', '10:00', '2024-01-01', '09:00'),
        errors,
      )
      expect(getErrors(errors, 'schedule.endDate')).toHaveLength(1)
      expect(getErrors(errors, 'schedule.endTime')).toHaveLength(0)
    })

    it('uses a custom message', () => {
      const errors = makeErrorsMock()
      dateTimeRange({ ...PARAMS, message: 'Custom!' })(
        formData('2024-01-01', '10:00', '2024-01-01', '09:00'),
        errors,
      )
      expect(getErrors(errors, 'schedule.endTime')).toContain('Custom!')
    })
  })

  describe('date-only (no time fields in params)', () => {
    const DATE_ONLY_PARAMS = {
      startDate: 'schedule.startDate',
      endDate:   'schedule.endDate',
      errorPath: 'schedule.endDate',
    }

    it('passes when end date is after start date', () => {
      const errors = makeErrorsMock()
      dateTimeRange(DATE_ONLY_PARAMS)(
        { schedule: { startDate: '2024-01-01', endDate: '2024-01-05' } },
        errors,
      )
      expect(getErrors(errors, 'schedule.endDate')).toHaveLength(0)
    })

    it('fails when end date is before start date', () => {
      const errors = makeErrorsMock()
      dateTimeRange(DATE_ONLY_PARAMS)(
        { schedule: { startDate: '2024-01-05', endDate: '2024-01-01' } },
        errors,
      )
      expect(getErrors(errors, 'schedule.endDate')).toHaveLength(1)
    })
  })

  describe('skips validation', () => {
    it('when startDate is missing', () => {
      const errors = makeErrorsMock()
      dateTimeRange(PARAMS)(formData('', '09:00', '2024-01-01', '10:00'), errors)
      expect(getErrors(errors, 'schedule.endTime')).toHaveLength(0)
    })

    it('when endDate is missing', () => {
      const errors = makeErrorsMock()
      dateTimeRange(PARAMS)(formData('2024-01-01', '09:00', '', '10:00'), errors)
      expect(getErrors(errors, 'schedule.endTime')).toHaveLength(0)
    })

    it('when formData is undefined', () => {
      const errors = makeErrorsMock()
      dateTimeRange(PARAMS)(undefined, errors)
      expect(getErrors(errors, 'schedule.endTime')).toHaveLength(0)
    })
  })
})
