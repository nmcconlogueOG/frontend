import { useRef, useState } from 'react'
import Form from '@rjsf/core'
import type { UiSchema } from '@rjsf/utils'
import { makeSchemaValidator, validatorRegistry, type ValidatedSchema } from '../validators'
import validator from '@rjsf/validator-ajv8'
import { Button } from '@trussworks/react-uswds'
import {
  CheckboxWidget,
  DateWidget,
  SelectWidget,
  TextareaWidget,
  TextInputWidget,
  TimeWidget,
} from '../widgets'
import { SideBySideObjectTemplate } from '../templates/SideBySideObjectTemplate'
import { SectionObjectTemplate } from '../templates/SectionObjectTemplate'
import {
  FormProvider, useFormContext, type FormData, type DefaultsRegistry,
  type AutofillRegistry, extractAutofillRules, extractProvidesMap,
} from '../contexts/FormContext'

const schema: ValidatedSchema = {
  title: 'Contact Information',
  type: 'object',
  required: ['firstName', 'lastName', 'email'],
  properties: {
    firstName: { type: 'string', title: 'First name' },
    lastName:  { type: 'string', title: 'Last name' },
    email:     { type: 'string', title: 'Email address', format: 'email' },
    phone:     { type: 'string', title: 'Phone number' },
    organization: { type: 'string', title: 'Organization' },
    role: {
      type: 'string',
      title: 'Role',
      enum: ['admin', 'member', 'viewer'],
     },
    dateOfBirth: { type: 'string', title: 'Date of birth', format: 'date' },
    appointment: {
      type: 'object',
      title: 'Appointment',
      properties: {
        date: { type: 'string', title: 'Date', format: 'date' },
        time: { type: 'string', title: 'Time', format: 'time' },
      },
      if: {
        anyOf: [
          { properties: { date: { type: 'string', minLength: 1 } } },
          { properties: { time: { type: 'string', minLength: 1 } } },
        ],
      },
      then: {
        required: ['date', 'time'],
        properties: {
          date: { minLength: 1 },
          time: { minLength: 1 },
        },
      },
    },
    schedule: {
      type: 'object',
      title: 'Schedule',
      properties: {
        startDate: { type: 'string', title: 'Start Date', format: 'date',description:'hint goes here' },
        startTime: { type: 'string', title: 'Start Time', format: 'time', description:'hint goes here' },
        endDate:   { type: 'string', title: 'End Date', format: 'date',description:'hint goes here' },
        endTime:   { type: 'string', title: 'End Time', format: 'time',description:'hint goes here' },
      },
    },
    subscribeToUpdates: { type: 'boolean', title: 'Subscribe to updates' },
    comments: { type: 'string', title: 'Comments' },
  },
  'x-validations': [
    {
      method: 'dateTimeRange',
      params: {
        startDate: 'schedule.startDate',
        startTime: 'schedule.startTime',
        endDate:   'schedule.endDate',
        endTime:   'schedule.endTime',
      },
      errorPath: 'schedule.endTime',
    },
  ],
}

const uiSchema: UiSchema = {
  'ui:globalOptions': { label: false },
  firstName:          { 'ui:options': { page: 'personal' } },
  lastName:           { 'ui:options': { page: 'personal' } },
  email:              { 'ui:options': { page: 'personal' } },
  phone:              { 'ui:options': { page: 'personal' } },
  organization:       { 'ui:options': { page: 'professional' } },
  role:               { 'ui:widget': 'select', 'ui:options': { page: 'professional' } },
  dateOfBirth:        { 'ui:options': { page: 'professional' } },
  appointment:        { 'ui:ObjectFieldTemplate': SideBySideObjectTemplate, 'ui:options': { page: 'scheduling' } },
  schedule: {
    'ui:ObjectFieldTemplate': SectionObjectTemplate,
    'ui:options': { page: 'scheduling' },
    startDate: { 'ui:options': { provides: 'scheduleStart' } },
    endDate: {
      'ui:options': {
        autofill: {
          target: 'schedule.endDate',
          fn: 'addMonthsToField',
          params: { source: 'scheduleStart', months: 1 },
          mode: 'always',
        },
      },
    },
  },
  subscribeToUpdates: { 'ui:options': { page: 'preferences' } },
  comments:           { 'ui:widget': 'textarea', 'ui:options': { page: 'preferences' } },
}

const widgets = {
  TextWidget:     TextInputWidget,
  EmailWidget:    TextInputWidget,
  SelectWidget:   SelectWidget,
  TextareaWidget: TextareaWidget,
  CheckboxWidget: CheckboxWidget,
  DateWidget:     DateWidget,
  TimeWidget:     TimeWidget,
}

const customValidate = makeSchemaValidator(schema, validatorRegistry)

const PAGES = ['personal', 'professional', 'scheduling', 'preferences'] as const
type Page = typeof PAGES[number]

const autofillRegistry: AutofillRegistry = {
  // Reads a date from depStore[params.source], adds params.months, returns yyyy-MM-dd
  addMonthsToField: (_formData, depStore, params) => {
    const raw = depStore[params.source as string]
    if (typeof raw !== 'string' || !raw) return undefined
    const d = new Date(raw)
    d.setMonth(d.getMonth() + (params.months as number))
    return d.toISOString().split('T')[0]
  },
}

const autofillRules = extractAutofillRules(uiSchema)
const providesMap   = extractProvidesMap(uiSchema)

const defaultsRegistry: DefaultsRegistry = {
  preferences: [
    (data) => data.role === 'admin' ? { subscribeToUpdates: true } : {},
  ],
}

const PAGE_LABELS: Record<Page, string> = {
  personal:     'Personal',
  professional: 'Professional',
  scheduling:   'Scheduling',
  preferences:  'Preferences',
}

function ContactFormBody() {
  const [submitted, setSubmitted] = useState<FormData | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formRef = useRef<any>(null)

  const { formData, setFormData, pageIndex, currentPage, totalPages, isLastPage, nextPage, prevPage } = useFormContext()

  return (
    <>
      <div className="margin-bottom-1 text-base">
        {PAGE_LABELS[currentPage as Page]} — step {pageIndex + 1} of {totalPages}
      </div>
      <Form
        ref={formRef}
        schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        widgets={widgets}
        validator={validator}
        customValidate={customValidate}
        noHtml5Validate
        templates={{
          ButtonTemplates: { SubmitButton: () => null },
          DescriptionFieldTemplate: () => null,
        }}
        onChange={({ formData }) => setFormData((formData as FormData) ?? {})}
        onSubmit={({ formData }) => setSubmitted(formData as FormData)}
      />
      <div className="display-flex flex-gap-2 margin-top-2">
        {pageIndex > 0 && (
          <Button type="button" outline onClick={prevPage}>
            Back
          </Button>
        )}
        {isLastPage ? (
          <Button type="button" onClick={() => formRef.current?.submit()}>
            Submit
          </Button>
        ) : (
          <Button type="button" onClick={nextPage}>
            Next
          </Button>
        )}
      </div>
      {submitted && (
        <div className="margin-top-4">
          <h3>Submitted data</h3>
          <pre className="bg-base-lightest padding-2 font-mono-sm">
            {JSON.stringify(submitted, null, 2)}
          </pre>
        </div>
      )}
    </>
  )
}

export function ContactForm() {
  return (
    <FormProvider
      pages={PAGES}
      defaultsRegistry={defaultsRegistry}
      autofillRules={autofillRules}
      autofillRegistry={autofillRegistry}
      providesMap={providesMap}
    >
      <ContactFormBody />
    </FormProvider>
  )
}
