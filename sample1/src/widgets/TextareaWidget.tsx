import { useContext } from 'react'
import { FormGroup, Label, Textarea } from '@trussworks/react-uswds'
import type { WidgetProps } from '@rjsf/utils'
import { PageContext } from '../contexts/PageContext'

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
  options,
  schema,
}: WidgetProps) {
  const currentPage = useContext(PageContext)
  const fieldPage = options.page as string | undefined
  if (fieldPage !== undefined && fieldPage !== currentPage) return null

  return (
    <FormGroup>
      <Label htmlFor={id} requiredMarker={required}>
        {label}
      </Label>
      {schema.description && <span className="usa-hint">{schema.description}</span>}
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
