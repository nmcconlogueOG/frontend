# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev        # Start dev server at http://localhost:5173
yarn build      # Type-check (tsc -b) then bundle with Vite
yarn lint       # Run ESLint
yarn preview    # Preview the production build locally
```

No test framework is configured.

## Architecture

React 19 + TypeScript + Vite app. The main non-boilerplate code is a permissions system:

- **`src/types/permissions.ts`** — core types and parsing. Defines `ENTITY_TYPE_MAP` and `ROLE_MAP` (update these to match backend codes), the `Permission` interface, and `parsePermissionString()` which converts raw strings in the form `"entityTypeCode:entityId:roleCode"` (e.g. `"2:10:1"`) into typed objects.

- **`src/contexts/PermissionsContext.tsx`** — `PermissionsProvider` accepts a `permissions?: string[]` prop (raw strings from the backend) and keeps parsed state in sync. Exposes `hasPermission`, `hasAnyRole`, `getRoles`, and `loadPermissions` via context.

- **`src/hooks/usePermissions.ts`** — convenience hook; throws if called outside `PermissionsProvider`.

- **`src/main.tsx`** — entry point; wraps `<App>` in `<PermissionsProvider>`. The `permissions` array here is the seam where real backend data should be injected.

TypeScript is configured with `strict`, `noUnusedLocals`, `noUnusedParameters`, and `erasableSyntaxOnly`.
