import { FormGroup, Label, Textarea } from '@trussworks/react-uswds'
import type { WidgetProps } from '@rjsf/utils'

export function TextareaWidget({
  id,
  value,
  label,
  required,
  disabled,
  readonly,
  onChange,
  onBlur,
  onFocus,
}: WidgetProps) {
  return (
    <FormGroup>
      <Label htmlFor={id} requiredMarker={required}>
        {label}
      </Label>
      <Textarea
        id={id}
        name={id}
        value={value ?? ''}
        disabled={disabled || readonly}
        onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)}
        onBlur={() => onBlur(id, value)}
        onFocus={() => onFocus(id, value)}
      />
    </FormGroup>
  )
}
