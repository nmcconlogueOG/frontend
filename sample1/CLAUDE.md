# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev        # Start dev server at http://localhost:5173
yarn build      # Type-check (tsc -b) then bundle with Vite
yarn lint       # Run ESLint
yarn test       # Run Vitest (watch mode)
```

To run a single test file:
```bash
yarn test src/path/to/file.test.ts
```

## Architecture

React 18 + TypeScript + Vite app focused on dynamic form generation using [React JSON Schema Form (RJSF)](https://rjsf-team.github.io/react-jsonschema-form/).

RJSF renders forms from a JSON Schema definition plus an optional UI schema that controls layout and widget choices. The form validates against the JSON Schema on submit.

### Key RJSF concepts

- **schema** — standard JSON Schema describing the data shape and validation rules
- **uiSchema** — display hints (widget type, ordering, labels, help text) separate from the data schema
- **formData** — controlled state holding current field values
- **onSubmit / onChange** — callbacks for handling validated submission and live field changes

### Dependencies

```bash
yarn add @rjsf/core @rjsf/utils @rjsf/validator-ajv8
yarn add @trussworks/react-uswds
```

`@trussworks/react-uswds` is the Trussworks React implementation of USWDS components. RJSF does not ship an official USWDS theme, so custom widget and field components are built using `@trussworks/react-uswds` primitives and registered via the RJSF `widgets` / `fields` props or a custom `templates` object.

USWDS also requires its CSS to be imported once at the app entry point:

```ts
import '@trussworks/react-uswds/lib/uswds.css'
```
