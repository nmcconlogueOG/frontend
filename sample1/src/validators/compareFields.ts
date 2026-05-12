import { getByPath } from './paths'
import { type FormData } from '../types/formData'

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

export function compareFields(formData: FormData, params: Record<string, unknown>): boolean {
  const { field1, field2, type, op } = params as {
    field1: string
    field2: string
    type: FieldType
    op: CompareOp
  }
  const val1 = getByPath(formData, field1)
  const val2 = getByPath(formData, field2)
  if (typeof val1 !== 'string' || !val1 || typeof val2 !== 'string' || !val2) return true

  return op === 'LT' ? coerce(val1, type) < coerce(val2, type)
                     : coerce(val1, type) > coerce(val2, type)
}
