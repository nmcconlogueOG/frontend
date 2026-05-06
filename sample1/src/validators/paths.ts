export function getByPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((curr, key) => {
    if (curr !== null && typeof curr === 'object') {
      return (curr as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getErrorNode(errors: any, path: string): any {
  return path.split('.').reduce((node: any, key: string) => node[key], errors)
}
