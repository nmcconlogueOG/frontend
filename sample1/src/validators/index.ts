import type { CustomValidator, RJSFSchema } from '@rjsf/utils'
import { compareFields } from './compareFields'
import { dateTimeRange } from './dateTimeRange'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ValidatorMethod = (params: Record<string, unknown>) => CustomValidator<any>

export interface SchemaValidation {
  method: string
  params: Record<string, unknown>
}

export type ValidatedSchema = RJSFSchema & {
  'x-validations'?: SchemaValidation[]
}

export const validatorRegistry: Record<string, ValidatorMethod> = {
  compareFields,
  dateTimeRange,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function makeSchemaValidator(
  schema: ValidatedSchema,
  registry: Record<string, ValidatorMethod>,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): CustomValidator<any> {
  const validations = schema['x-validations'] ?? []

  const validators = validations.flatMap(({ method, params }) => {
    const fn = registry[method]
    if (!fn) {
      console.warn(`[makeSchemaValidator] unknown method: "${method}"`)
      return []
    }
    return [fn(params)]
  })

  return (formData, errors, uiSchema) => {
    validators.forEach(v => v(formData, errors, uiSchema))
    return errors
  }
}
