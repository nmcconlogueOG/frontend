import { FormGroup, Label, Select } from '@trussworks/react-uswds'
import type { WidgetProps } from '@rjsf/utils'

export function SelectWidget({
  id,
  value,
  label,
  required,
  disabled,
  readonly,
  onChange,
  onBlur,
  options,
}: WidgetProps) {
  const { enumOptions = [] } = options

  return (
    <FormGroup>
      <Label htmlFor={id} requiredMarker={required}>
        {label}
      </Label>
      <Select
        id={id}
        name={id}
        value={value ?? ''}
        disabled={disabled || readonly}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => onBlur(id, value)}
      >
        <option value="">-- Select --</option>
        {enumOptions.map(({ label, value }) => (
          <option key={String(value)} value={String(value)}>
            {label}
          </option>
        ))}
      </Select>
    </FormGroup>
  )
}
