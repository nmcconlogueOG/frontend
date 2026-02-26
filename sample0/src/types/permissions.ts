export interface CodeEntry {
  code: string;
  label: string;
}

/**
 * Maps entity type names to their backend codes.
 * Update codes/labels to match your backend values.
 */
export const ENTITY_TYPE_MAP = {
  ORGANIZATION: { code: '1', label: 'Organization' },
  PROGRAM:      { code: '2', label: 'Program' },
} as const satisfies Record<string, CodeEntry>;

/**
 * Maps role names to their backend codes.
 * Update codes/labels to match your backend values.
 */
export const ROLE_MAP = {
  ADMIN:  { code: '1', label: 'Admin' },
  MEMBER: { code: '2', label: 'Member' },
  VIEWER: { code: '3', label: 'Viewer' },
} as const satisfies Record<string, CodeEntry>;

export type EntityTypeCode = (typeof ENTITY_TYPE_MAP)[keyof typeof ENTITY_TYPE_MAP]['code'];
export type RoleCode       = (typeof ROLE_MAP)[keyof typeof ROLE_MAP]['code'];

/** A single parsed permission entry. */
export interface Permission {
  /** Code identifying the type of entity (e.g. '1' for Organization, '2' for Program). */
  entityTypeCode: EntityTypeCode;
  /** Numeric ID of the specific entity instance. */
  entityId: number;
  /** Code identifying the role the user holds on this entity. */
  roleCode: RoleCode;
}

/**
 * General (entity-less) permissions granted to the user.
 * Update values to match your backend's permission strings.
 */
export const GENERAL_PERMISSIONS = ['VIEW', 'EDIT', 'MANAGE'] as const;
export type GeneralPermission = typeof GENERAL_PERMISSIONS[number];

export interface PermissionToken {
  permissions: string[];            // "entityTypeCode:entityId:roleCode"
  generalPermissions: string[];     // e.g. "VIEW", "EDIT", "MANAGE"
  csrfToken: string;
}

/**
 * Parses a raw "entityType:entityId:role" string from the provider service.
 * Example: "2:10:1" → { entityTypeCode: '2', entityId: 10, roleCode: '1' }
 * @throws {Error} If the string does not contain exactly three colon-separated parts.
 */
export function parsePermissionString(raw: string): Permission {
  const parts = raw.split(':');
  if (parts.length !== 3) {
    throw new Error(`Invalid permission string: "${raw}"`);
  }
  const [entityTypeCode, entityIdStr, roleCode] = parts;
  return {
    entityTypeCode: entityTypeCode as EntityTypeCode,
    entityId: parseInt(entityIdStr),
    roleCode: roleCode as RoleCode,
  };
}

/** Validates and returns a general permission string (e.g. "VIEW", "EDIT"). */
export function parseGeneralPermission(raw: string): GeneralPermission {
  if (!(GENERAL_PERMISSIONS as readonly string[]).includes(raw)) {
    throw new Error(`Unknown general permission: "${raw}"`);
  }
  return raw as GeneralPermission;
}
