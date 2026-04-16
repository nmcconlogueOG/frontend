import type { ObjectFieldTemplateProps } from '@rjsf/utils'

export function SideBySideObjectTemplate({
  title,
  description,
  properties,
}: ObjectFieldTemplateProps) {
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
