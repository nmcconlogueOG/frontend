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
      {properties.map((prop) => (
        <div key={prop.name}>
          {prop.content}
        </div>
      ))}
    </div>
  )
}
