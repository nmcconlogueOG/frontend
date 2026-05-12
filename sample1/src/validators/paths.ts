import { type FormData, type FormDataValue } from '../types/formData'

export function getByPath(obj: FormData, path: string): FormDataValue | undefined {
  return path.split('.').reduce<FormDataValue | undefined>((curr, key) => {
    if (curr !== null && typeof curr === 'object') {
      return (curr as FormData)[key]
    }
    return undefined
  }, obj)
}

export function setByPath(obj: FormData, path: string, value: FormDataValue): FormData {
  const [head, ...rest] = path.split('.')
  if (rest.length === 0) {
    return { ...obj, [head]: value }
  }
  const nested = (obj[head] as FormData) ?? {}
  return { ...obj, [head]: setByPath(nested, rest.join('.'), value) }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getErrorNode(errors: any, path: string): any {
  return path.split('.').reduce((node: any, key: string) => node[key], errors)
}
