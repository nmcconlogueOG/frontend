import type { CustomValidator } from '@rjsf/utils'
import { getByPath, getErrorNode } from './paths'

export type FieldType = 'string' | 'number' | 'date' | 'datetime'
export type CompareOp = 'LT' | 'GT'

function coerce(value: string, type: FieldType): number | string {
  switch (type) {
    case 'number':   return Number(value)
    case 'date':
    case 'datetime': return new Date(value).getTime()
    case 'string':   return value
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function compareFields(params: Record<string, unknown>): CustomValidator<any> {
  const { field1, field2, errorPath, type, op, message } = params as {
    field1: string
    field2: string
    errorPath: string
    type: FieldType
    op: CompareOp
    message?: string
  }
  return (formData, errors) => {
    if (!formData) return errors
    const fd = formData as Record<string, unknown>
    const val1 = getByPath(fd, field1)
    const val2 = getByPath(fd, field2)
    if (typeof val1 !== 'string' || !val1 || typeof val2 !== 'string' || !val2) return errors

    const a = coerce(val1, type)
    const b = coerce(val2, type)
    const valid = op === 'LT' ? a < b : a > b

    if (!valid) {
      getErrorNode(errors, errorPath).addError(
        message ?? `Must be ${op === 'LT' ? 'after' : 'before'} ${field1}`
      )
    }
    return errors
  }
}
