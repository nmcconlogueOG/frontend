import { describe, it, expect, vi } from 'vitest'
import { makeSchemaValidator, validatorRegistry, type ValidatedSchema, type ValidatorPredicate } from './index'
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

  describe('predicate dispatch', () => {
    it('calls the predicate with formData and params', () => {
      const predicate: ValidatorPredicate = vi.fn(() => true)
      const formData = { a: '1' }
      makeSchemaValidator(
        { 'x-validations': [{ method: 'test', params: { foo: 'bar' }, errorPath: 'a' }] } as ValidatedSchema,
        { test: predicate },
      )(formData, makeErrorsMock())
      expect(predicate).toHaveBeenCalledWith(formData, { foo: 'bar' })
    })

    it('adds no error when the predicate returns true', () => {
      const errors = makeErrorsMock()
      makeSchemaValidator(
        { 'x-validations': [{ method: 'test', params: {}, errorPath: 'field' }] } as ValidatedSchema,
        { test: () => true },
      )({}, errors)
      expect(getErrors(errors, 'field')).toHaveLength(0)
    })

    it('adds an error at errorPath when the predicate returns false', () => {
      const errors = makeErrorsMock()
      makeSchemaValidator(
        { 'x-validations': [{ method: 'test', params: {}, errorPath: 'field', message: 'Bad value' }] } as ValidatedSchema,
        { test: () => false },
      )({}, errors)
      expect(getErrors(errors, 'field')).toContain('Bad value')
    })

    it('uses a default message when none is provided', () => {
      const errors = makeErrorsMock()
      makeSchemaValidator(
        { 'x-validations': [{ method: 'test', params: {}, errorPath: 'field' }] } as ValidatedSchema,
        { test: () => false },
      )({}, errors)
      expect(getErrors(errors, 'field')).toHaveLength(1)
    })

    it('runs all predicates in order', () => {
      const calls: string[] = []
      const registry: Record<string, ValidatorPredicate> = {
        first:  () => { calls.push('first');  return true },
        second: () => { calls.push('second'); return true },
      }
      makeSchemaValidator(
        {
          'x-validations': [
            { method: 'first',  params: {}, errorPath: 'a' },
            { method: 'second', params: {}, errorPath: 'b' },
          ],
        } as ValidatedSchema,
        registry,
      )({}, makeErrorsMock())
      expect(calls).toEqual(['first', 'second'])
    })

    it('warns and skips an unknown method', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      makeSchemaValidator(
        { 'x-validations': [{ method: 'doesNotExist', params: {}, errorPath: 'field' }] } as ValidatedSchema,
        {},
      )({}, makeErrorsMock())
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('doesNotExist'))
      spy.mockRestore()
    })

    it('continues running valid methods after an unknown one', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {})
      const ran: boolean[] = []
      makeSchemaValidator(
        {
          'x-validations': [
            { method: 'unknown', params: {}, errorPath: 'a' },
            { method: 'real',    params: {}, errorPath: 'b' },
          ],
        } as ValidatedSchema,
        { real: () => { ran.push(true); return true } },
      )({}, makeErrorsMock())
      expect(ran).toHaveLength(1)
      vi.restoreAllMocks()
    })
  })

  describe('integration with real validators', () => {
    it('dateTimeRange: adds error when end is before start', () => {
      const errors = makeErrorsMock()
      makeSchemaValidator(
        {
          'x-validations': [{
            method: 'dateTimeRange',
            params: { startDate: 'schedule.startDate', startTime: 'schedule.startTime', endDate: 'schedule.endDate', endTime: 'schedule.endTime' },
            errorPath: 'schedule.endTime',
            message: 'End must be after start',
          }],
        } as ValidatedSchema,
        validatorRegistry,
      )(
        { schedule: { startDate: '2024-01-01', startTime: '10:00', endDate: '2024-01-01', endTime: '09:00' } },
        errors,
      )
      expect(getErrors(errors, 'schedule.endTime')).toContain('End must be after start')
    })

    it('dateTimeRange: no error when end is after start', () => {
      const errors = makeErrorsMock()
      makeSchemaValidator(
        {
          'x-validations': [{
            method: 'dateTimeRange',
            params: { startDate: 'schedule.startDate', startTime: 'schedule.startTime', endDate: 'schedule.endDate', endTime: 'schedule.endTime' },
            errorPath: 'schedule.endTime',
          }],
        } as ValidatedSchema,
        validatorRegistry,
      )(
        { schedule: { startDate: '2024-01-01', startTime: '09:00', endDate: '2024-01-01', endTime: '10:00' } },
        errors,
      )
      expect(getErrors(errors, 'schedule.endTime')).toHaveLength(0)
    })

    it('compareFields: adds error when constraint fails', () => {
      const errors = makeErrorsMock()
      makeSchemaValidator(
        {
          'x-validations': [{
            method: 'compareFields',
            params: { field1: 'min', field2: 'max', type: 'number', op: 'LT' },
            errorPath: 'max',
          }],
        } as ValidatedSchema,
        validatorRegistry,
      )({ min: '10', max: '5' }, errors)
      expect(getErrors(errors, 'max')).toHaveLength(1)
    })
  })
})
