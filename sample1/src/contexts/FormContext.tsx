import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { PageContext } from './PageContext'
import { setByPath } from '../validators/paths'
import { type FormData, type FormDataValue } from '../types/formData'
import { applyAutofill, type AutofillRegistry, type AutofillRule, type ProvidesMap } from './autofill'

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

  const setFormData = useCallback(
    (data: FormData) => setFormDataRaw(applyAutofill(data, autofillRules, autofillRegistry, providesMap)),
    [autofillRules, autofillRegistry, providesMap],
  )

  const nextPage = useCallback(() => {
    if (pageIndex >= pages.length - 1) return
    const toPage = pages[pageIndex + 1]
    const setters = defaultsRegistry?.[toPage]
    if (setters?.length) {
      setFormDataRaw(current => {
        const withDefaults = setters.reduce((acc, setter) => applyDefaults(acc, setter(current)), current)
        return applyAutofill(withDefaults, autofillRules, autofillRegistry, providesMap)
      })
    }
    setPageIndex(i => i + 1)
  }, [pageIndex, pages, defaultsRegistry, autofillRules, autofillRegistry, providesMap])

  const prevPage = useCallback(
    () => setPageIndex(i => Math.max(i - 1, 0)),
    [],
  )

  const goToPage = useCallback(
    (index: number) => setPageIndex(Math.max(0, Math.min(index, pages.length - 1))),
    [pages.length],
  )

  const updateField = useCallback(
    (path: string, value: FormDataValue) =>
      setFormDataRaw(current => applyAutofill(setByPath(current, path, value) as FormData, autofillRules, autofillRegistry, providesMap)),
    [autofillRules, autofillRegistry, providesMap],
  )

  const value = useMemo<FormContextValue>(() => ({
    formData,
    setFormData,
    pageIndex,
    currentPage: pages[pageIndex],
    totalPages: pages.length,
    isLastPage: pageIndex === pages.length - 1,
    nextPage,
    prevPage,
    goToPage,
    updateField,
  }), [formData, setFormData, pageIndex, pages, nextPage, prevPage, goToPage, updateField])

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
