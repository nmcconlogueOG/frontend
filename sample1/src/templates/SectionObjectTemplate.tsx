import type { ObjectFieldTemplateProps } from '@rjsf/utils'

export function SectionObjectTemplate({
  title,
  schema,
  description,
  properties,
}: ObjectFieldTemplateProps) {
  const heading = schema.title ?? title
  return (
    <div className="margin-top-3">
      {heading && <h2 className="font-heading-lg text-bold margin-bottom-0">{heading}</h2>}
      <hr className="margin-y-1" />
      {description && <p className="usa-hint">{description}</p>}
      <div className="grid-row grid-gap">
        {properties.map((prop) => (
          <div key={prop.name} className="grid-col-6">
            {prop.content}
          </div>
        ))}
      </div>
    </div>
  )
}
