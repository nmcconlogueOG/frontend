import { FormGroup, TimePicker } from '@trussworks/react-uswds'
import type { WidgetProps } from '@rjsf/utils'

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
  return (
    <FormGroup>
      <TimePicker
        key={value ?? ''}
        id={id}
        name={id}
        label={label}
        hint={schema.description}
        defaultValue={value ?? undefined}
        required={required}
        disabled={disabled || readonly}
        onChange={(val) => onChange(val ?? undefined)}
      />
    </FormGroup>
  )
}
