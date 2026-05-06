import { describe, it, expect } from 'vitest'
import { getByPath, getErrorNode } from './paths'
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
