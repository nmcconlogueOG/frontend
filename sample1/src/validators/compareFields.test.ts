import { describe, it, expect } from 'vitest'
import { compareFields } from './compareFields'

const lt = (field1: string, field2: string) => ({ field1, field2, type: 'number', op: 'LT' })
const gt = (field1: string, field2: string) => ({ field1, field2, type: 'number', op: 'GT' })

describe('compareFields', () => {
  describe('LT — field1 must be less than field2', () => {
    it('returns true when field1 < field2 (number)', () => {
      expect(compareFields({ a: '1', b: '2' }, lt('a', 'b'))).toBe(true)
    })

    it('returns false when field1 > field2 (number)', () => {
      expect(compareFields({ a: '5', b: '2' }, lt('a', 'b'))).toBe(false)
    })

    it('returns false when field1 === field2', () => {
      expect(compareFields({ a: '5', b: '5' }, lt('a', 'b'))).toBe(false)
    })

    it('returns true for date when end is after start', () => {
      expect(compareFields(
        { start: '2024-01-01', end: '2024-01-02' },
        { field1: 'start', field2: 'end', type: 'date', op: 'LT' },
      )).toBe(true)
    })

    it('returns false for date when end is before start', () => {
      expect(compareFields(
        { start: '2024-01-05', end: '2024-01-01' },
        { field1: 'start', field2: 'end', type: 'date', op: 'LT' },
      )).toBe(false)
    })

    it('returns true for datetime comparison', () => {
      expect(compareFields(
        { from: '2024-01-01T09:00', to: '2024-01-01T10:00' },
        { field1: 'from', field2: 'to', type: 'datetime', op: 'LT' },
      )).toBe(true)
    })

    it('returns true for string lexicographic comparison', () => {
      expect(compareFields({ a: 'apple', b: 'banana' }, { field1: 'a', field2: 'b', type: 'string', op: 'LT' })).toBe(true)
    })

    it('returns false for string lexicographic comparison', () => {
      expect(compareFields({ a: 'zebra', b: 'apple' }, { field1: 'a', field2: 'b', type: 'string', op: 'LT' })).toBe(false)
    })
  })

  describe('GT — field1 must be greater than field2', () => {
    it('returns true when field1 > field2', () => {
      expect(compareFields({ a: '10', b: '5' }, gt('a', 'b'))).toBe(true)
    })

    it('returns false when field1 < field2', () => {
      expect(compareFields({ a: '3', b: '8' }, gt('a', 'b'))).toBe(false)
    })

    it('returns false when field1 === field2', () => {
      expect(compareFields({ a: '5', b: '5' }, gt('a', 'b'))).toBe(false)
    })
  })

  describe('nested dot-path fields', () => {
    it('resolves fields through nested objects', () => {
      expect(compareFields({ group: { a: '5', b: '2' } }, { field1: 'group.a', field2: 'group.b', type: 'number', op: 'LT' })).toBe(false)
    })
  })

  describe('skips validation (returns true)', () => {
    it('when field1 is missing', () => {
      expect(compareFields({ b: '2' }, lt('a', 'b'))).toBe(true)
    })

    it('when field2 is missing', () => {
      expect(compareFields({ a: '5' }, lt('a', 'b'))).toBe(true)
    })

    it('when formData is undefined', () => {
      expect(compareFields(undefined, lt('a', 'b'))).toBe(true)
    })
  })
})
