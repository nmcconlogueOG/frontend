import { createContext, useContext, useState, type ReactNode } from 'react'
import { PageContext } from './PageContext'
import { getByPath, setByPath } from '../validators/paths'
import { type FormData, type FormDataValue } from '../types/formData'

export type { FormData, FormDataValue }

// ---------------------------------------------------------------------------
// Dependency store
//
// Advantages over reading formData paths directly inside autofill fns:
//
//   Path decoupling — fns reference a stable name ('scheduleStart') rather
//   than a formData dot-path ('schedule.startDate'). Moving or renaming a
//   field only requires updating the `provides` annotation; no fn changes.
//
//   Cross-page availability — formData holds all pages, but it's owned by
//   RJSF and its shape can change. DepStore is a minimal, stable snapshot of
//   only the values that fields have explicitly published, so page-2 fns can
//   safely read page-1 values without knowing the schema layout.
//
//   Explicit contract — the `provides` / `source` pair declares the
//   dependency relationship in the uiSchema, visible alongside the field
//   definitions, rather than buried inside fn implementations.
//
//   Reusability — because fns are parameterized and read from named keys, a
//   single fn (e.g. addMonthsToField) handles any source field and any month
//   offset without being rewritten per use case.
//
//   Single-render performance — depStore is rebuilt synchronously inside
//   applyAutofill on every setFormData call, before the state commit. No
//   useEffect, no second render, no intermediate stale state shown to the
//   user.
// ---------------------------------------------------------------------------

// depKey → current value, populated from fields that declare `ui:options.provides`
export type DepStore = Record<string, FormDataValue>
// depKey → dot-path in formData, derived once from uiSchema at module init
export type ProvidesMap = Record<string, string>

export type DefaultSetter = (formData: FormData) => Partial<FormData>
export type DefaultsRegistry = Partial<Record<string, DefaultSetter[]>>

export type AutofillFn = (
  formData: FormData,
  depStore: DepStore,
  params: Record<string, unknown>,
) => FormDataValue | undefined
export type AutofillRegistry = Record<string, AutofillFn>
export type AutofillRule = {
  target: string
  fn: string
  params?: Record<string, unknown>
  // 'always' (default): overwrite on every change — good for derived fields
  // 'default-only': skip if target already has a non-empty value
  mode?: 'always' | 'default-only'
}

export function extractAutofillRules(uiSchema: Record<string, unknown>): AutofillRule[] {
  const rules: AutofillRule[] = []
  function walk(node: Record<string, unknown>) {
    const opts = node['ui:options'] as Record<string, unknown> | undefined
    if (opts?.autofill && typeof opts.autofill === 'object') {
      rules.push(opts.autofill as AutofillRule)
    }
    for (const key of Object.keys(node)) {
      if (!key.startsWith('ui:') && node[key] !== null && typeof node[key] === 'object') {
        walk(node[key] as Record<string, unknown>)
      }
    }
  }
  walk(uiSchema)
  return rules
}

// Walks uiSchema tracking the current dot-path so provides annotations map
// to the correct formData location regardless of nesting depth.
export function extractProvidesMap(uiSchema: Record<string, unknown>): ProvidesMap {
  const map: ProvidesMap = {}
  function walk(node: Record<string, unknown>, path: string) {
    const opts = node['ui:options'] as Record<string, unknown> | undefined
    if (opts?.provides && typeof opts.provides === 'string' && path) {
      map[opts.provides] = path
    }
    for (const key of Object.keys(node)) {
      if (!key.startsWith('ui:') && node[key] !== null && typeof node[key] === 'object') {
        walk(node[key] as Record<string, unknown>, path ? `${path}.${key}` : key)
      }
    }
  }
  walk(uiSchema, '')
  return map
}

// Snapshot: reads only the declared dependency paths from formData. Small by
// design — contains just what fns need, not the full form state.
function buildDepStore(formData: FormData, providesMap: ProvidesMap): DepStore {
  const store: DepStore = {}
  for (const [depKey, fieldPath] of Object.entries(providesMap)) {
    const value = getByPath(formData, fieldPath)
    if (value !== undefined) store[depKey] = value
  }
  return store
}

function applyDefaults(current: FormData, defaults: Partial<FormData>): FormData {
  let result = current
  for (const [key, value] of Object.entries(defaults)) {
    if (value !== null && typeof value === 'object') {
      const currentNested = (current[key] as FormData) ?? {}
      const merged = applyDefaults(currentNested, value as Partial<FormData>)
      if (merged !== currentNested) result = { ...result, [key]: merged }
    } else if (current[key] === undefined && value !== undefined) {
      result = { ...result, [key]: value as FormDataValue }
    }
  }
  return result
}

interface FormContextValue {
  formData: FormData
  setFormData: (data: FormData) => void
  pageIndex: number
  currentPage: string
  totalPages: number
  isLastPage: boolean
  nextPage: () => void
  prevPage: () => void
  goToPage: (index: number) => void
  updateField: (path: string, value: FormDataValue) => void
}

const FormContext = createContext<FormContextValue | null>(null)

interface FormProviderProps {
  pages: readonly string[]
  defaultsRegistry?: DefaultsRegistry
  autofillRules?: AutofillRule[]
  autofillRegistry?: AutofillRegistry
  providesMap?: ProvidesMap
  children: ReactNode
}

export function FormProvider({
  pages,
  defaultsRegistry,
  autofillRules = [],
  autofillRegistry = {},
  providesMap = {},
  children,
}: FormProviderProps) {
  const [pageIndex, setPageIndex] = useState(0)
  const [formData, setFormDataRaw] = useState<FormData>({})

  function applyAutofill(data: FormData): FormData {
    const depStore = buildDepStore(data, providesMap)
    let result = data
    for (const rule of autofillRules) {
      const fn = autofillRegistry[rule.fn]
      if (!fn) continue
      if (rule.mode === 'default-only') {
        const existing = getByPath(result, rule.target)
        if (existing !== undefined && existing !== '') continue
      }
      const computed = fn(result, depStore, rule.params ?? {})
      if (computed !== undefined) {
        result = setByPath(result, rule.target, computed) as FormData
      }
    }
    return result
  }

  const value: FormContextValue = {
    formData,
    setFormData: (data) => setFormDataRaw(applyAutofill(data)),
    pageIndex,
    currentPage: pages[pageIndex],
    totalPages: pages.length,
    isLastPage: pageIndex === pages.length - 1,
    nextPage: () => {
      if (pageIndex >= pages.length - 1) return
      const toPage = pages[pageIndex + 1]
      const setters = defaultsRegistry?.[toPage]
      if (setters?.length) {
        setFormDataRaw(current => {
          const withDefaults = setters.reduce((acc, setter) => applyDefaults(acc, setter(current)), current)
          return applyAutofill(withDefaults)
        })
      }
      setPageIndex(i => i + 1)
    },
    prevPage: () => setPageIndex(i => Math.max(i - 1, 0)),
    goToPage: (index) => setPageIndex(Math.max(0, Math.min(index, pages.length - 1))),
    updateField: (path, value) => setFormDataRaw(current => applyAutofill(setByPath(current, path, value) as FormData)),
  }

  return (
    <FormContext.Provider value={value}>
      <PageContext.Provider value={value.currentPage}>
        {children}
      </PageContext.Provider>
    </FormContext.Provider>
  )
}

export function useFormContext(): FormContextValue {
  const ctx = useContext(FormContext)
  if (!ctx) throw new Error('useFormContext must be used within a FormProvider')
  return ctx
}
