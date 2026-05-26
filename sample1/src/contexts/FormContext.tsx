import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { PageContext } from './PageContext'
import { setByPath } from '../validators/paths'
import { type FormData, type FormDataValue } from '../types/formData'
import {
  applyAutofill, buildDepStore, buildReverseProvides,
  type AutofillRegistry, type AutofillRule, type DepStore, type ProvidesMap,
} from './autofill'

export type { FormData, FormDataValue }

export type DefaultSetter = (formData: FormData) => Partial<FormData>
export type DefaultsRegistry = Partial<Record<string, DefaultSetter[]>>

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
  depStore: DepStore
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
  const [depStore, setDepStore] = useState<DepStore>({})

  // Lets nextPage read the current formData without a functional updater, so
  // setDepStore can be called in the same synchronous pass.
  const formDataRef = useRef(formData)
  formDataRef.current = formData

  const reverseProvides = useMemo(() => buildReverseProvides(providesMap), [providesMap])

  // Full rebuild — RJSF onChange delivers the complete new formData so we
  // don't know which field changed.
  const setFormData = useCallback((data: FormData) => {
    const newDepStore = buildDepStore(data, providesMap)
    setDepStore(newDepStore)
    setFormDataRaw(applyAutofill(data, autofillRules, autofillRegistry, newDepStore))
  }, [providesMap, autofillRules, autofillRegistry])

  // Single-entry update — path is known, so only touch the one depStore key
  // that this field provides (if any).
  const updateField = useCallback((path: string, value: FormDataValue) => {
    const depKey = reverseProvides[path]
    const newDepStore = depKey !== undefined ? { ...depStore, [depKey]: value } : depStore
    if (depKey !== undefined) setDepStore(newDepStore)
    setFormDataRaw(current =>
      applyAutofill(setByPath(current, path, value) as FormData, autofillRules, autofillRegistry, newDepStore)
    )
  }, [reverseProvides, depStore, autofillRules, autofillRegistry])

  const nextPage = useCallback(() => {
    if (pageIndex >= pages.length - 1) return
    const toPage = pages[pageIndex + 1]
    const setters = defaultsRegistry?.[toPage]
    if (setters?.length) {
      const withDefaults = setters.reduce(
        (acc, setter) => applyDefaults(acc, setter(formDataRef.current)),
        formDataRef.current,
      )
      const newDepStore = buildDepStore(withDefaults, providesMap)
      setDepStore(newDepStore)
      setFormDataRaw(applyAutofill(withDefaults, autofillRules, autofillRegistry, newDepStore))
    }
    setPageIndex(i => i + 1)
  }, [pageIndex, pages, defaultsRegistry, providesMap, autofillRules, autofillRegistry])

  const prevPage = useCallback(
    () => setPageIndex(i => Math.max(i - 1, 0)),
    [],
  )

  const goToPage = useCallback(
    (index: number) => setPageIndex(Math.max(0, Math.min(index, pages.length - 1))),
    [pages.length],
  )

  const value = useMemo<FormContextValue>(() => ({
    formData,
    depStore,
    setFormData,
    pageIndex,
    currentPage: pages[pageIndex],
    totalPages: pages.length,
    isLastPage: pageIndex === pages.length - 1,
    nextPage,
    prevPage,
    goToPage,
    updateField,
  }), [formData, depStore, setFormData, pageIndex, pages, nextPage, prevPage, goToPage, updateField])

  return (
    <FormContext.Provider value={value}>
      <PageContext.Provider value={value.currentPage}>
        {children}
      </PageContext.Provider>
    </FormContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFormContext(): FormContextValue {
  const ctx = useContext(FormContext)
  if (!ctx) throw new Error('useFormContext must be used within a FormProvider')
  return ctx
}
