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

export interface EntityId {
  orgId: number;
  progId: number;
  subOrgId: number;
}

export const DEFAULT_ENTITY_ID: EntityId = { orgId: 0, progId: 0, subOrgId: 0 };

/** A single parsed permission entry. */
export interface Permission {
  /** Code identifying the type of entity (e.g. '1' for Organization, '2' for Program). */
  entityTypeCode: EntityTypeCode;
  /** Numeric ID of the specific entity instance. */
  entityId: EntityId;
  /** Code identifying the role the user holds on this entity. */
  roleCode: RoleCode;
}

/**
 * Maps general (entity-less) permission codes to their display labels.
 * Update keys/values to match your backend's permission strings.
 */
export const GENERAL_PERMISSION_MAP = {
  VIEW:   'View',
  EDIT:   'Edit',
  MANAGE: 'Manage',
} as const;

export type GeneralPermission = keyof typeof GENERAL_PERMISSION_MAP;

/** A predicate that tests a single Permission entry. */
export type PermissionPredicate = (permission: Permission) => boolean;

/** Filters the permission list by a predicate. */
export type FilterPermissions = (predicate: PermissionPredicate) => Permission[];

/** True if two EntityId structs refer to the same entity instance. */
export function entityIdMatches(a: EntityId, b: EntityId): boolean {
  return a.orgId === b.orgId && a.progId === b.progId && a.subOrgId === b.subOrgId;
}

/** Domain entity that can provide its own EntityId for permission matching. */
export interface Entity {
  entityId(): EntityId;
}

/** A predicate that tests a domain entity object. */
export type EntityPredicate<E extends Entity> = (entity: E) => boolean;

/**
 * A builder that receives filterPermissions and returns an EntityPredicate.
 * The entity's entityId() method provides the EntityId for matching.
 * Define these outside components for reusability and testability.
 *
 * @example
 * interface Program extends Entity {
 *   programId: number;
 *   name: string;
 *   entityId(): EntityId; // returns { orgId: 0, progId: this.programId, subOrgId: 0 }
 * }
 *
 * const canAccessProgram: EntityPredicateBuilder<Program> = (filterPermissions) => (program) =>
 *   filterPermissions(p =>
 *     p.entityTypeCode === ENTITY_TYPE_MAP.PROGRAM.code &&
 *     entityIdMatches(p.entityId, program.entityId()) &&
 *     (p.roleCode === ROLE_MAP.ADMIN.code || p.roleCode === ROLE_MAP.MEMBER.code)
 *   ).length > 0;
 *
 * // In a component:
 * const { filterEntities } = usePermissions();
 * const accessible = filterEntities(programs, canAccessProgram);
 */
export type EntityPredicateBuilder<E extends Entity> = (filterPermissions: FilterPermissions) => EntityPredicate<E>;

export interface PermissionToken {
  permissions: string[];            // "entityTypeCode:entityId:roleCode"
  generalPermissions: string[];     // e.g. "VIEW", "EDIT", "MANAGE"
  csrfToken: string;
}

/**
 * Parses a raw "entityType:entityId:role" string from the provider service.
 * Example: "2:10:1" → { entityTypeCode: '2', entityId: { orgId: 0, progId: 10, subOrgId: 0 }, roleCode: '1' }
 * @throws {Error} If the string does not contain exactly three colon-separated parts, or the entity type is unknown.
 */
export function parsePermissionString(raw: string): Permission {
  const parts = raw.split(':');
  if (parts.length !== 3) {
    throw new Error(`Invalid permission string: "${raw}"`);
  }
  const [entityTypeCode, entityIdStr, roleCode] = parts;
  const id = parseInt(entityIdStr, 10);

  let entityId: Permission['entityId'];
  switch (entityTypeCode as EntityTypeCode) {
    case ENTITY_TYPE_MAP.ORGANIZATION.code:
      entityId = { orgId: id, progId: 0, subOrgId: 0 };
      break;
    case ENTITY_TYPE_MAP.PROGRAM.code:
      entityId = { orgId: 0, progId: id, subOrgId: 0 };
      break;
    default:
      throw new Error(`Unknown entity type code: "${entityTypeCode}"`);
  }

  return {
    entityTypeCode: entityTypeCode as EntityTypeCode,
    entityId,
    roleCode: roleCode as RoleCode,
  };
}

/** Combines predicates so all must match. */
export const and = (...predicates: PermissionPredicate[]): PermissionPredicate =>
  (p) => predicates.every((fn) => fn(p));

/** Combines predicates so at least one must match. */
export const or = (...predicates: PermissionPredicate[]): PermissionPredicate =>
  (p) => predicates.some((fn) => fn(p));

/** Inverts a predicate. */
export const not = (predicate: PermissionPredicate): PermissionPredicate =>
  (p) => !predicate(p);

/** Example predicate: matches any permission where the user is an Admin on a Program. */
export const isAdminOnProgram: PermissionPredicate = (p) =>
  p.entityTypeCode === ENTITY_TYPE_MAP.PROGRAM.code && p.roleCode === ROLE_MAP.ADMIN.code;

/** Validates and returns a general permission string (e.g. "VIEW", "EDIT"). */
export function parseGeneralPermission(raw: string): GeneralPermission {
  if (!(raw in GENERAL_PERMISSION_MAP)) {
    throw new Error(`Unknown general permission: "${raw}"`);
  }
  return raw as GeneralPermission;
}
