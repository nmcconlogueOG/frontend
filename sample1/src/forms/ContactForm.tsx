import Form from '@rjsf/core'
import type { RJSFSchema, UiSchema, SubmitButtonProps } from '@rjsf/utils'
import validator from '@rjsf/validator-ajv8'
import { Button } from '@trussworks/react-uswds'
import { useState } from 'react'
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

const schema: RJSFSchema = {
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
      enumNames: ['Admin', 'Member', 'Viewer'],
    },
    dateOfBirth: { type: 'string', title: 'Date of birth', format: 'date' },
    appointment: {
      type: 'object',
      title: 'Appointment',
      properties: {
        date: { type: 'string', title: 'Date', format: 'date' },
        time: { type: 'string', title: 'Time' },
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
        startDate: { type: 'string', title: 'Start Date', format: 'date' },
        startTime: { type: 'string', title: 'Start Time' },
        endDate:   { type: 'string', title: 'End Date', format: 'date' },
        endTime:   { type: 'string', title: 'End Time' },
      },
    },
    subscribeToUpdates: { type: 'boolean', title: 'Subscribe to updates' },
    comments: { type: 'string', title: 'Comments' },
  },
}

const uiSchema: UiSchema = {
  'ui:globalOptions': { label: false },
  comments:    { 'ui:widget': 'textarea' },
  role:        { 'ui:widget': 'select' },
  appointment: {
    'ui:ObjectFieldTemplate': SideBySideObjectTemplate,
    time: { 'ui:widget': 'TimeWidget' },
  },
  schedule: {
    'ui:ObjectFieldTemplate': SectionObjectTemplate,
    startTime: { 'ui:widget': 'TimeWidget' },
    endTime:   { 'ui:widget': 'TimeWidget' },
  },
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

function SubmitButton(_: SubmitButtonProps) {
  return (
    <Button type="submit" className="margin-top-2">
      Submit
    </Button>
  )
}

export function ContactForm() {
  const [submitted, setSubmitted] = useState<object | null>(null)

  return (
    <>
      <Form
        schema={schema}
        uiSchema={uiSchema}
        widgets={widgets}
        validator={validator}
        templates={{ ButtonTemplates: { SubmitButton } }}
        onSubmit={({ formData }) => setSubmitted(formData as object)}
      />
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
