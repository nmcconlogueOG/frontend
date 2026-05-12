import { describe, it, expect } from 'vitest'
import { getByPath, setByPath, getErrorNode } from './paths'
import { makeErrorsMock, getErrors } from './testUtils'

describe('getByPath', () => {
  it('returns a top-level value', () => {
    expect(getByPath({ foo: 'bar' }, 'foo')).toBe('bar')
  })

  it('returns a nested value', () => {
    expect(getByPath({ a: { b: { c: 'deep' } } }, 'a.b.c')).toBe('deep')
  })

  it('returns undefined for a missing top-level key', () => {
    expect(getByPath({ a: '1' }, 'b')).toBeUndefined()
  })

  it('returns undefined when an intermediate key is missing', () => {
    expect(getByPath({ a: { b: 'x' } }, 'a.c.d')).toBeUndefined()
  })

  it('returns undefined when the path passes through a non-object', () => {
    expect(getByPath({ a: 'string' }, 'a.b')).toBeUndefined()
  })
})

describe('setByPath', () => {
  it('sets a top-level key', () => {
    expect(setByPath({}, 'foo', 'bar')).toEqual({ foo: 'bar' })
  })

  it('sets a nested key', () => {
    expect(setByPath({}, 'a.b.c', 'deep')).toEqual({ a: { b: { c: 'deep' } } })
  })

  it('merges with existing top-level keys', () => {
    expect(setByPath({ x: 1 }, 'y', 2)).toEqual({ x: 1, y: 2 })
  })

  it('merges with existing nested keys', () => {
    expect(setByPath({ a: { b: 1, c: 2 } }, 'a.b', 99)).toEqual({ a: { b: 99, c: 2 } })
  })

  it('creates intermediate objects when missing', () => {
    expect(setByPath({ a: {} }, 'a.b.c', 'val')).toEqual({ a: { b: { c: 'val' } } })
  })

  it('does not mutate the original object', () => {
    const original = { a: { b: 1 } }
    setByPath(original, 'a.b', 2)
    expect(original.a.b).toBe(1)
  })
})

describe('getErrorNode', () => {
  it('traverses to a nested error node and supports addError', () => {
    const errors = makeErrorsMock()
    getErrorNode(errors, 'schedule.endTime').addError('test error')
    expect(getErrors(errors, 'schedule.endTime')).toContain('test error')
  })

  it('returns the root node for a single-segment path', () => {
    const errors = makeErrorsMock()
    getErrorNode(errors, 'fieldName').addError('root level')
    expect(getErrors(errors, 'fieldName')).toContain('root level')
  })
})
