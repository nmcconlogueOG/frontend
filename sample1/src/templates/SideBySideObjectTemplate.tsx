import { useContext } from 'react'
import type { ObjectFieldTemplateProps } from '@rjsf/utils'
import { PageContext } from '../contexts/PageContext'

export function SideBySideObjectTemplate({
  title,
  description,
  properties,
  uiSchema,
}: ObjectFieldTemplateProps) {
  const currentPage = useContext(PageContext)
  const fieldPage = (uiSchema?.['ui:options'] as Record<string, unknown> | undefined)?.page as string | undefined
  if (fieldPage !== undefined && fieldPage !== currentPage) return null

  return (
    <fieldset className="usa-fieldset">
      {title && <legend className="usa-legend">{title}</legend>}
      {description && <p className="usa-hint">{description}</p>}
      <div className="grid-row grid-gap">
        {properties.map((prop) => (
          <div key={prop.name} className="grid-col">
            {prop.content}
          </div>
        ))}
      </div>
    </fieldset>
  )
}
