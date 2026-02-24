# sample0 — Permissions System

React 19 + TypeScript + Vite app demonstrating a backend-driven permissions system.

## Commands

```bash
yarn dev        # Start dev server at http://localhost:5173
yarn build      # Type-check (tsc -b) then bundle with Vite
yarn lint       # Run ESLint
yarn test       # Run Vitest (watch mode)
yarn preview    # Preview the production build locally
```

## Permissions System

The permissions system translates raw backend strings into typed React context,
exposing simple boolean checks to any component in the tree.

### Wire format

The backend sends permissions as an array of colon-separated strings:

```
"entityTypeCode:entityId:roleCode"

"2:10:1"  →  PROGRAM 10, ADMIN
"2:10:2"  →  PROGRAM 10, MEMBER
"1:5:3"   →  ORGANIZATION 5, VIEWER
```

### Code maps (`src/types/permissions.ts`)

Entity types and roles are defined as typed constant maps. Update the codes here
when the backend changes its values — nowhere else.

```ts
export const ENTITY_TYPE_MAP = {
  ORGANIZATION: { code: '1', label: 'Organization' },
  PROGRAM:      { code: '2', label: 'Program' },
} as const;

export const ROLE_MAP = {
  ADMIN:  { code: '1', label: 'Admin' },
  MEMBER: { code: '2', label: 'Member' },
  VIEWER: { code: '3', label: 'Viewer' },
} as const;
```

### Setup (`src/main.tsx`)

Wrap your app in `PermissionsProvider` and pass the raw strings from your backend:

```tsx
import { PermissionsProvider } from './contexts/PermissionsContext'

const permissions = await fetchPermissionsFromBackend() // string[]

<PermissionsProvider permissions={permissions}>
  <App />
</PermissionsProvider>
```

Re-passing a new array (e.g. after login or a role change) automatically replaces
the current permissions. You can also call `loadPermissions(newRawStrings)` from
anywhere inside the tree.

### Usage in components (`src/hooks/usePermissions.ts`)

```tsx
import { usePermissions } from '../hooks/usePermissions'
import { ENTITY_TYPE_MAP, ROLE_MAP } from '../types/permissions'

function MyComponent({ programId }: { programId: number }) {
  const { hasPermission, hasAnyRole, getRoles } = usePermissions()
  const PROGRAM = ENTITY_TYPE_MAP.PROGRAM.code

  // Check for a specific role
  if (!hasPermission(PROGRAM, programId, ROLE_MAP.MEMBER.code)) {
    return <p>Access denied</p>
  }

  return (
    <div>
      <p>Program content</p>
      {hasPermission(PROGRAM, programId, ROLE_MAP.ADMIN.code) && (
        <a href={`/programs/${programId}/manage`}>Manage</a>
      )}
    </div>
  )
}
```

Available methods from `usePermissions()`:

| Method | Returns | Description |
|---|---|---|
| `hasPermission(type, id, role)` | `boolean` | User holds this exact role on the entity |
| `hasAnyRole(type, id)` | `boolean` | User holds any role on the entity |
| `getRoles(type, id)` | `RoleCode[]` | All roles the user holds on the entity |
| `loadPermissions(raw[])` | `void` | Replace all permissions from new raw strings |

### Example component (`src/examples/ProgramNavLinks.tsx`)

`ProgramNavLinks` shows the pattern in action: ADMIN and MEMBER roles grant access
to a program's nav link; only ADMIN gets the "Manage" link; VIEWER is excluded.

```tsx
export function ProgramNavLinks({ programs }: { programs: Program[] }) {
  const { hasPermission } = usePermissions()
  const PROGRAM = ENTITY_TYPE_MAP.PROGRAM.code

  const accessible = programs.filter(p =>
    hasPermission(PROGRAM, p.id, ROLE_MAP.ADMIN.code) ||
    hasPermission(PROGRAM, p.id, ROLE_MAP.MEMBER.code)
  )

  return (
    <nav>
      {accessible.map(p => (
        <div key={p.id}>
          <a href={`/programs/${p.id}`}>{p.name}</a>
          {hasPermission(PROGRAM, p.id, ROLE_MAP.ADMIN.code) && (
            <a href={`/programs/${p.id}/manage`}>Manage</a>
          )}
        </div>
      ))}
    </nav>
  )
}
```

### File map

| File | Purpose |
|---|---|
| `src/types/permissions.ts` | Core types, code maps, `parsePermissionString` |
| `src/contexts/PermissionsContext.tsx` | `PermissionsProvider` — parses and stores permissions |
| `src/hooks/usePermissions.ts` | `usePermissions()` hook |
| `src/examples/ProgramNavLinks.tsx` | Example component |
| `src/types/permissions.test.ts` | Unit tests for `parsePermissionString` |
| `src/examples/ProgramNavLinks.test.tsx` | Component tests for `ProgramNavLinks` |
| `src/hooks/usePermissions.test.tsx` | Hook tests |
