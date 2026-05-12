import { createContext, useContext, useState, type ReactNode } from 'react'
import { PageContext } from './PageContext'

interface FormContextValue {
  formData: Record<string, unknown>
  setFormData: (data: Record<string, unknown>) => void
  pageIndex: number
  currentPage: string
  totalPages: number
  isLastPage: boolean
  nextPage: () => void
  prevPage: () => void
  goToPage: (index: number) => void
}

const FormContext = createContext<FormContextValue | null>(null)

interface FormProviderProps {
  pages: readonly string[]
  children: ReactNode
}

export function FormProvider({ pages, children }: FormProviderProps) {
  const [pageIndex, setPageIndex] = useState(0)
  const [formData, setFormData] = useState<Record<string, unknown>>({})

  const value: FormContextValue = {
    formData,
    setFormData,
    pageIndex,
    currentPage: pages[pageIndex],
    totalPages: pages.length,
    isLastPage: pageIndex === pages.length - 1,
    nextPage: () => setPageIndex(i => Math.min(i + 1, pages.length - 1)),
    prevPage: () => setPageIndex(i => Math.max(i - 1, 0)),
    goToPage: (index) => setPageIndex(Math.max(0, Math.min(index, pages.length - 1))),
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
