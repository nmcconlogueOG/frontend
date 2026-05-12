import type { CustomValidator, RJSFSchema } from '@rjsf/utils'
import { getErrorNode } from './paths'
import { compareFields } from './compareFields'
import { dateTimeRange } from './dateTimeRange'
import { type FormData } from '../types/formData'

export type ValidatorPredicate = (formData: FormData, params: Record<string, unknown>) => boolean

export interface SchemaValidation {
  method: string
  params: Record<string, unknown>
  errorPath: string
  message?: string
}

export type ValidatedSchema = RJSFSchema & {
  'x-validations'?: SchemaValidation[]
}

export const validatorRegistry: Record<string, ValidatorPredicate> = {
  compareFields,
  dateTimeRange,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function makeSchemaValidator(
  schema: ValidatedSchema,
  registry: Record<string, ValidatorPredicate>,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): CustomValidator<any> {
  const validations = schema['x-validations'] ?? []

  return (formData, errors) => {
    for (const { method, params, errorPath, message } of validations) {
      const predicate = registry[method]
      if (!predicate) {
        console.warn(`[makeSchemaValidator] unknown method: "${method}"`)
        continue
      }
      if (!predicate(formData, params)) {
        getErrorNode(errors, errorPath).addError(message ?? 'Validation failed')
      }
    }
    return errors
  }
}
