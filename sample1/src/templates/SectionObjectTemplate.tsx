import { useContext } from 'react'
import type { ObjectFieldTemplateProps } from '@rjsf/utils'
import { PageContext } from '../contexts/PageContext'

export function SectionObjectTemplate({
  title,
  schema,
  description,
  properties,
  uiSchema,
}: ObjectFieldTemplateProps) {
  const currentPage = useContext(PageContext)
  const fieldPage = (uiSchema?.['ui:options'] as Record<string, unknown> | undefined)?.page as string | undefined
  if (fieldPage !== undefined && fieldPage !== currentPage) return null

  const heading = schema.title ?? title
  return (
    <div className="margin-top-3">
      {heading && <h2 className="font-heading-lg text-bold margin-bottom-1">{heading}</h2>}
      <div className="padding-left-2 border-left-05 border-base-light">
        {description && <p className="usa-hint">{description}</p>}
        <div className="grid-row grid-gap">
        {properties.map((prop) => (
          <div key={prop.name} className="grid-col-6">
            {prop.content}
          </div>
        ))}
        </div>
      </div>
    </div>
  )
}
