import { describe, it, expect, vi } from 'vitest'
import { makeSchemaValidator, validatorRegistry, type ValidatedSchema, type ValidatorMethod } from './index'
import { makeErrorsMock, getErrors } from './testUtils'

describe('makeSchemaValidator', () => {
  describe('when x-validations is absent or empty', () => {
    it('returns a no-op when x-validations is absent', () => {
      const errors = makeErrorsMock()
      makeSchemaValidator({} as ValidatedSchema, {})({}, errors)
      expect(errors.__errors).toHaveLength(0)
    })

    it('returns a no-op when x-validations is empty', () => {
      const errors = makeErrorsMock()
      makeSchemaValidator({ 'x-validations': [] } as ValidatedSchema, {})({}, errors)
      expect(errors.__errors).toHaveLength(0)
    })
  })

  describe('method dispatch', () => {
    it('calls the named method factory with its params', () => {
      const mockMethod: ValidatorMethod = vi.fn(() => (_fd: unknown, err: unknown) => err)
      makeSchemaValidator(
        { 'x-validations': [{ method: 'testMethod', params: { foo: 'bar' } }] } as ValidatedSchema,
        { testMethod: mockMethod },
      )({}, makeErrorsMock())
      expect(mockMethod).toHaveBeenCalledWith({ foo: 'bar' })
    })

    it('runs all validators in order', () => {
      const calls: string[] = []
      const registry = {
        first:  (): ValidatorMethod => (_fd: unknown, err: unknown) => { calls.push('first');  return err },
        second: (): ValidatorMethod => (_fd: unknown, err: unknown) => { calls.push('second'); return err },
      }
      makeSchemaValidator(
        { 'x-validations': [{ method: 'first', params: {} }, { method: 'second', params: {} }] } as ValidatedSchema,
        registry as unknown as Record<string, ValidatorMethod>,
      )({}, makeErrorsMock())
      expect(calls).toEqual(['first', 'second'])
    })

    it('warns and skips an unknown method', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      makeSchemaValidator(
        { 'x-validations': [{ method: 'doesNotExist', params: {} }] } as ValidatedSchema,
        {},
      )({}, makeErrorsMock())
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('doesNotExist'))
      spy.mockRestore()
    })

    it('still runs valid methods when an unknown method is in the list', () => {
      const ran: boolean[] = []
      const registry: Record<string, ValidatorMethod> = {
        real: () => (_fd, err) => { ran.push(true); return err },
      }
      vi.spyOn(console, 'warn').mockImplementation(() => {})
      makeSchemaValidator(
        {
          'x-validations': [
            { method: 'unknown', params: {} },
            { method: 'real',    params: {} },
          ],
        } as ValidatedSchema,
        registry,
      )({}, makeErrorsMock())
      expect(ran).toHaveLength(1)
      vi.restoreAllMocks()
    })
  })

  describe('integration with real validators', () => {
    it('dateTimeRange: adds an error when end is before start', () => {
      const errors = makeErrorsMock()
      const schema: ValidatedSchema = {
        'x-validations': [
          {
            method: 'dateTimeRange',
            params: {
              startDate: 'schedule.startDate',
              startTime: 'schedule.startTime',
              endDate:   'schedule.endDate',
              endTime:   'schedule.endTime',
            },
          },
        ],
      }
      makeSchemaValidator(schema, validatorRegistry)(
        { schedule: { startDate: '2024-01-01', startTime: '10:00', endDate: '2024-01-01', endTime: '09:00' } },
        errors,
      )
      expect(getErrors(errors, 'schedule.endTime')).toHaveLength(1)
    })

    it('dateTimeRange: no error when end is after start', () => {
      const errors = makeErrorsMock()
      const schema: ValidatedSchema = {
        'x-validations': [
          {
            method: 'dateTimeRange',
            params: {
              startDate: 'schedule.startDate',
              startTime: 'schedule.startTime',
              endDate:   'schedule.endDate',
              endTime:   'schedule.endTime',
            },
          },
        ],
      }
      makeSchemaValidator(schema, validatorRegistry)(
        { schedule: { startDate: '2024-01-01', startTime: '09:00', endDate: '2024-01-01', endTime: '10:00' } },
        errors,
      )
      expect(getErrors(errors, 'schedule.endTime')).toHaveLength(0)
    })

    it('compareFields: adds an error when field2 is not greater (LT)', () => {
      const errors = makeErrorsMock()
      const schema: ValidatedSchema = {
        'x-validations': [
          {
            method: 'compareFields',
            params: { field1: 'min', field2: 'max', type: 'number', op: 'LT' },
          },
        ],
      }
      makeSchemaValidator(schema, validatorRegistry)({ min: '10', max: '5' }, errors)
      expect(getErrors(errors, 'max')).toHaveLength(1)
    })
  })
})
