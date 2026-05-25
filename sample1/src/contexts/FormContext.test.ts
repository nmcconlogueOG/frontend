import { describe, it } from 'vitest'

// Pure autofill/depstore logic is tested in autofill.test.ts.
// FormProvider behaviour (apply-on-setFormData, defaults-on-nextPage) requires
// rendering — add integration tests here when a React testing setup is in place.
describe('FormProvider', () => {
  it.todo('applies autofill on setFormData')
  it.todo('applies page defaults on nextPage')
  it.todo('prevPage decrements pageIndex')
})
