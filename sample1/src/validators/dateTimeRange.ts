import { getByPath } from './paths'
import { type FormData } from '../types/formData'

export function dateTimeRange(formData: FormData, params: Record<string, unknown>): boolean {
  const { startDate, startTime, endDate, endTime } = params as {
    startDate: string
    startTime?: string
    endDate: string
    endTime?: string
  }

  const startDateVal = getByPath(formData, startDate)
  const endDateVal   = getByPath(formData, endDate)
  if (typeof startDateVal !== 'string' || !startDateVal) return true
  if (typeof endDateVal   !== 'string' || !endDateVal)   return true

  const startTimeVal = startTime ? getByPath(formData, startTime) : undefined
  const endTimeVal   = endTime   ? getByPath(formData, endTime)   : undefined

  const startStr = typeof startTimeVal === 'string' && startTimeVal
    ? `${startDateVal}T${startTimeVal}`
    : startDateVal
  const endStr = typeof endTimeVal === 'string' && endTimeVal
    ? `${endDateVal}T${endTimeVal}`
    : endDateVal

  return new Date(endStr) > new Date(startStr)
}
