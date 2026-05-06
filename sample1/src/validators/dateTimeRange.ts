import type { CustomValidator } from '@rjsf/utils'
import { getByPath, getErrorNode } from './paths'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dateTimeRange(params: Record<string, unknown>): CustomValidator<any> {
  const { startDate, startTime, endDate, endTime, message } = params as {
    startDate: string
    startTime?: string
    endDate: string
    endTime?: string
    message?: string
  }
  return (formData, errors) => {
    if (!formData) return errors
    const fd = formData as Record<string, unknown>

    const startDateVal = getByPath(fd, startDate)
    const endDateVal   = getByPath(fd, endDate)
    if (typeof startDateVal !== 'string' || !startDateVal) return errors
    if (typeof endDateVal   !== 'string' || !endDateVal)   return errors

    const startTimeVal = startTime ? getByPath(fd, startTime) : undefined
    const endTimeVal   = endTime   ? getByPath(fd, endTime)   : undefined

    const startStr = typeof startTimeVal === 'string' && startTimeVal
      ? `${startDateVal}T${startTimeVal}`
      : startDateVal
    const endStr = typeof endTimeVal === 'string' && endTimeVal
      ? `${endDateVal}T${endTimeVal}`
      : endDateVal

    if (new Date(endStr) <= new Date(startStr)) {
      const errorPath = typeof endTimeVal === 'string' && endTimeVal ? endTime! : endDate
      getErrorNode(errors, errorPath).addError(message ?? 'End must be after start')
    }
    return errors
  }
}
