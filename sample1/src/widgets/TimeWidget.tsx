import { ComboBox, FormGroup, Label } from '@trussworks/react-uswds'
import type { ComboBoxOption } from '@trussworks/react-uswds'
import type { WidgetProps } from '@rjsf/utils'

const TIME_STEP = 30

function generateTimeOptions(): ComboBoxOption[] {
  const options: ComboBoxOption[] = []
  for (let minutes = 0; minutes < 24 * 60; minutes += TIME_STEP) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    const hh = String(h).padStart(2, '0')
    const mm = String(m).padStart(2, '0')
    const value = `${hh}:${mm}`
    const period = h < 12 ? 'am' : 'pm'
    const h12 = h % 12 === 0 ? 12 : h % 12
    const label = `${h12}:${mm}${period}`
    options.push({ value, label })
  }
  return options
}

const TIME_OPTIONS = generateTimeOptions()

const DEFAULT_HINT = 'Select a time from the dropdown. Type into the input to filter options.'

export function TimeWidget({
  id,
  value,
  label,
  required,
  disabled,
  readonly,
  onChange,
  schema,
}: WidgetProps) {
  const hint = schema.description ?? DEFAULT_HINT
  return (
    <FormGroup>
      {label && (
        <Label htmlFor={id} requiredMarker={required}>
          {label}
        </Label>
      )}
      <span className="usa-hint">{hint}</span>
      <div style={{ maxWidth: '50%' }}>
        <ComboBox
          key={value ?? ''}
          id={id}
          name={id}
          options={TIME_OPTIONS}
          defaultValue={value ?? undefined}
          disabled={disabled || readonly}
          onChange={(val) => onChange(val ?? undefined)}
        />
      </div>
    </FormGroup>
  )
}
