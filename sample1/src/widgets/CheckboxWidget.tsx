import { Checkbox, FormGroup } from '@trussworks/react-uswds'
import type { WidgetProps } from '@rjsf/utils'

export function CheckboxWidget({
  id,
  value,
  label,
  disabled,
  readonly,
  onChange,
}: WidgetProps) {
  return (
    <FormGroup>
      <Checkbox
        id={id}
        name={id}
        label={label}
        checked={!!value}
        disabled={disabled || readonly}
        onChange={(e) => onChange(e.target.checked)}
      />
    </FormGroup>
  )
}
