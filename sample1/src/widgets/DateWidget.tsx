import { DatePicker, FormGroup, Label } from '@trussworks/react-uswds'
import type { WidgetProps } from '@rjsf/utils'

export function DateWidget({
  id,
  value,
  label,
  required,
  disabled,
  readonly,
  onChange,
  onBlur,
}: WidgetProps) {
  return (
    <FormGroup>
      <Label htmlFor={id} requiredMarker={required}>
        {label}
      </Label>
      <DatePicker
        key={value ?? ''}
        id={id}
        name={id}
        dateFormat="YYYY-MM-DD"
        defaultValue={value ?? undefined}
        disabled={disabled || readonly}
        required={required}
        onChange={(val) => onChange(val ?? undefined)}
        onBlur={() => onBlur(id, value)}
      />
    </FormGroup>
  )
}
