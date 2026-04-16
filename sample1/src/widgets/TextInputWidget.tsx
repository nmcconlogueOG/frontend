import { FormGroup, Label, TextInput } from '@trussworks/react-uswds'
import type { WidgetProps } from '@rjsf/utils'

export function TextInputWidget({
  id,
  value,
  label,
  required,
  disabled,
  readonly,
  onChange,
  onBlur,
  onFocus,
  schema,
}: WidgetProps) {
  const inputType =
    schema.format === 'email' ? 'email'
    : schema.format === 'uri' ? 'url'
    : 'text'

  return (
    <FormGroup>
      <Label htmlFor={id} requiredMarker={required}>
        {label}
      </Label>
      <TextInput
        id={id}
        name={id}
        type={inputType}
        value={value ?? ''}
        disabled={disabled || readonly}
        onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)}
        onBlur={() => onBlur(id, value)}
        onFocus={() => onFocus(id, value)}
      />
    </FormGroup>
  )
}
