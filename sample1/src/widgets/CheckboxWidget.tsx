import { useContext } from 'react'
import { Checkbox, FormGroup } from '@trussworks/react-uswds'
import type { WidgetProps } from '@rjsf/utils'
import { PageContext } from '../contexts/PageContext'

export function CheckboxWidget({
  id,
  value,
  label,
  disabled,
  readonly,
  options,
  onChange,
}: WidgetProps) {
  const currentPage = useContext(PageContext)
  const fieldPage = options.page as string | undefined
  if (fieldPage !== undefined && fieldPage !== currentPage) return null

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
