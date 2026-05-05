import type { CustomValidator } from '@rjsf/utils'

function findField(
  obj: Record<string, unknown>,
  fieldName: string,
  parentPath: string[] = []
): { value: string; parentPath: string[] } | undefined {
  if (fieldName in obj) {
    const val = obj[fieldName]
    if (typeof val === 'string' && val.length > 0) {
      return { value: val, parentPath }
    }
  }
  for (const key of Object.keys(obj)) {
    const child = obj[key]
    if (child !== null && typeof child === 'object' && !Array.isArray(child)) {
      const result = findField(child as Record<string, unknown>, fieldName, [...parentPath, key])
      if (result) return result
    }
  }
  return undefined
}

export function makeDateTimeRangeValidator(
  startName: string,
  endName: string,
  message = 'End must be after start'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): CustomValidator<any> {
  return (formData, errors) => {
    if (!formData) return errors

    const startDateResult = findField(formData, `${startName}Date`)
    const endDateResult = findField(formData, `${endName}Date`)

    if (!startDateResult || !endDateResult) return errors

    const startTimeResult = findField(formData, `${startName}Time`)
    const endTimeResult = findField(formData, `${endName}Time`)

    const startStr = startTimeResult
      ? `${startDateResult.value}T${startTimeResult.value}`
      : startDateResult.value
    const endStr = endTimeResult
      ? `${endDateResult.value}T${endTimeResult.value}`
      : endDateResult.value

    if (new Date(endStr) <= new Date(startStr)) {
      const errorFieldName = endTimeResult ? `${endName}Time` : `${endName}Date`
      const errorParentPath = (endTimeResult ?? endDateResult).parentPath
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorNode = errorParentPath.reduce((node: any, key) => node[key], errors)
      errorNode[errorFieldName].addError(message)
    }

    return errors
  }
}
