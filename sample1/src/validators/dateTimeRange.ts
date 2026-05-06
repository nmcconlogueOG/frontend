import { getByPath } from './paths'

export function dateTimeRange(formData: unknown, params: Record<string, unknown>): boolean {
  const { startDate, startTime, endDate, endTime } = params as {
    startDate: string
    startTime?: string
    endDate: string
    endTime?: string
  }
  if (!formData) return true
  const fd = formData as Record<string, unknown>

  const startDateVal = getByPath(fd, startDate)
  const endDateVal   = getByPath(fd, endDate)
  if (typeof startDateVal !== 'string' || !startDateVal) return true
  if (typeof endDateVal   !== 'string' || !endDateVal)   return true

  const startTimeVal = startTime ? getByPath(fd, startTime) : undefined
  const endTimeVal   = endTime   ? getByPath(fd, endTime)   : undefined

  const startStr = typeof startTimeVal === 'string' && startTimeVal
    ? `${startDateVal}T${startTimeVal}`
    : startDateVal
  const endStr = typeof endTimeVal === 'string' && endTimeVal
    ? `${endDateVal}T${endTimeVal}`
    : endDateVal

  return new Date(endStr) > new Date(startStr)
}
