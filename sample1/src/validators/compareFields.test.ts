import { describe, it, expect } from 'vitest'
import { compareFields } from './compareFields'
import { makeErrorsMock, getErrors } from './testUtils'

describe('compareFields', () => {
  describe('LT — field1 must be less than field2', () => {
    it('passes when field1 < field2 (number)', () => {
      const errors = makeErrorsMock()
      compareFields({ field1: 'a', field2: 'b', errorPath: 'b', type: 'number', op: 'LT' })({ a: '1', b: '2' }, errors)
      expect(getErrors(errors, 'b')).toHaveLength(0)
    })

    it('fails when field1 > field2 (number)', () => {
      const errors = makeErrorsMock()
      compareFields({ field1: 'a', field2: 'b', errorPath: 'b', type: 'number', op: 'LT' })({ a: '5', b: '2' }, errors)
      expect(getErrors(errors, 'b')).toHaveLength(1)
    })

    it('fails when field1 === field2 (equal is not strictly less than)', () => {
      const errors = makeErrorsMock()
      compareFields({ field1: 'a', field2: 'b', errorPath: 'b', type: 'number', op: 'LT' })({ a: '5', b: '5' }, errors)
      expect(getErrors(errors, 'b')).toHaveLength(1)
    })

    it('passes for date comparison when end is after start', () => {
      const errors = makeErrorsMock()
      compareFields({ field1: 'start', field2: 'end', errorPath: 'end', type: 'date', op: 'LT' })
        ({ start: '2024-01-01', end: '2024-01-02' }, errors)
      expect(getErrors(errors, 'end')).toHaveLength(0)
    })

    it('fails for date comparison when end is before start', () => {
      const errors = makeErrorsMock()
      compareFields({ field1: 'start', field2: 'end', errorPath: 'end', type: 'date', op: 'LT' })
        ({ start: '2024-01-05', end: '2024-01-01' }, errors)
      expect(getErrors(errors, 'end')).toHaveLength(1)
    })

    it('passes for datetime comparison', () => {
      const errors = makeErrorsMock()
      compareFields({ field1: 'from', field2: 'to', errorPath: 'to', type: 'datetime', op: 'LT' })
        ({ from: '2024-01-01T09:00', to: '2024-01-01T10:00' }, errors)
      expect(getErrors(errors, 'to')).toHaveLength(0)
    })

    it('passes for string lexicographic comparison', () => {
      const errors = makeErrorsMock()
      compareFields({ field1: 'a', field2: 'b', errorPath: 'b', type: 'string', op: 'LT' })
        ({ a: 'apple', b: 'banana' }, errors)
      expect(getErrors(errors, 'b')).toHaveLength(0)
    })

    it('fails for string lexicographic comparison', () => {
      const errors = makeErrorsMock()
      compareFields({ field1: 'a', field2: 'b', errorPath: 'b', type: 'string', op: 'LT' })
        ({ a: 'zebra', b: 'apple' }, errors)
      expect(getErrors(errors, 'b')).toHaveLength(1)
    })
  })

  describe('GT — field1 must be greater than field2', () => {
    it('passes when field1 > field2 (number)', () => {
      const errors = makeErrorsMock()
      compareFields({ field1: 'a', field2: 'b', errorPath: 'b', type: 'number', op: 'GT' })({ a: '10', b: '5' }, errors)
      expect(getErrors(errors, 'b')).toHaveLength(0)
    })

    it('fails when field1 < field2 (number)', () => {
      const errors = makeErrorsMock()
      compareFields({ field1: 'a', field2: 'b', errorPath: 'b', type: 'number', op: 'GT' })({ a: '3', b: '8' }, errors)
      expect(getErrors(errors, 'b')).toHaveLength(1)
    })

    it('fails when field1 === field2', () => {
      const errors = makeErrorsMock()
      compareFields({ field1: 'a', field2: 'b', errorPath: 'b', type: 'number', op: 'GT' })({ a: '5', b: '5' }, errors)
      expect(getErrors(errors, 'b')).toHaveLength(1)
    })
  })

  describe('error attachment', () => {
    it('attaches the error to errorPath, not field1', () => {
      const errors = makeErrorsMock()
      compareFields({ field1: 'a', field2: 'b', errorPath: 'b', type: 'number', op: 'LT' })({ a: '5', b: '2' }, errors)
      expect(getErrors(errors, 'a')).toHaveLength(0)
      expect(getErrors(errors, 'b')).toHaveLength(1)
    })

    it('errorPath can differ from field2', () => {
      const errors = makeErrorsMock()
      compareFields({ field1: 'a', field2: 'b', errorPath: 'summary', type: 'number', op: 'LT' })
        ({ a: '5', b: '2' }, errors)
      expect(getErrors(errors, 'summary')).toHaveLength(1)
      expect(getErrors(errors, 'b')).toHaveLength(0)
    })

    it('uses a custom message', () => {
      const errors = makeErrorsMock()
      compareFields({ field1: 'a', field2: 'b', errorPath: 'b', type: 'number', op: 'LT', message: 'Custom!' })
        ({ a: '5', b: '2' }, errors)
      expect(getErrors(errors, 'b')).toContain('Custom!')
    })

    it('resolves nested dot-path errorPath', () => {
      const errors = makeErrorsMock()
      compareFields({ field1: 'group.a', field2: 'group.b', errorPath: 'group.b', type: 'number', op: 'LT' })
        ({ group: { a: '5', b: '2' } }, errors)
      expect(getErrors(errors, 'group.b')).toHaveLength(1)
    })
  })

  describe('skips validation', () => {
    it('when field1 is missing', () => {
      const errors = makeErrorsMock()
      compareFields({ field1: 'a', field2: 'b', errorPath: 'b', type: 'number', op: 'LT' })({ b: '2' }, errors)
      expect(getErrors(errors, 'b')).toHaveLength(0)
    })

    it('when field2 is missing', () => {
      const errors = makeErrorsMock()
      compareFields({ field1: 'a', field2: 'b', errorPath: 'b', type: 'number', op: 'LT' })({ a: '5' }, errors)
      expect(getErrors(errors, 'b')).toHaveLength(0)
    })

    it('when formData is undefined', () => {
      const errors = makeErrorsMock()
      compareFields({ field1: 'a', field2: 'b', errorPath: 'b', type: 'number', op: 'LT' })(undefined, errors)
      expect(getErrors(errors, 'b')).toHaveLength(0)
    })
  })
})
