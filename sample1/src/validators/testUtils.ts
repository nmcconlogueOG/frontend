// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createNode(): any {
  const node: Record<string, unknown> = { __errors: [] as string[] }
  node['addError'] = (msg: string) => (node['__errors'] as string[]).push(msg)
  return new Proxy(node, {
    get(target, prop) {
      const key = prop as string
      if (key in target) return target[key]
      target[key] = createNode()
      return target[key]
    },
  })
}

/** Creates a minimal mock of RJSF's FormValidation errors object. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function makeErrorsMock(): any {
  return createNode()
}

/** Reads back the errors added at a dot-path within the mock. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getErrors(errors: any, path: string): string[] {
  return path.split('.').reduce((node: any, key: string) => node[key], errors).__errors as string[]
}
