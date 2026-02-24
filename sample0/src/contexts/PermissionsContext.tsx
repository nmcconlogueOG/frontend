import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  parsePermissionString,
  type EntityTypeCode,
  type Permission,
  type RoleCode,
} from '../types/permissions';

export interface PermissionsContextValue {
  permissions: Permission[];
  /**
   * True if the user holds the exact role on the given entity.
   * @param entityTypeCode - The entity type code (e.g. ENTITY_TYPE_MAP.PROGRAM.code)
   * @param entityId - The numeric ID of the entity instance
   * @param roleCode - The role code to check (e.g. ROLE_MAP.ADMIN.code)
   */
  hasPermission: (entityTypeCode: EntityTypeCode, entityId: number, roleCode: RoleCode) => boolean;
  /**
   * True if the user holds ANY role on the given entity.
   * @param entityTypeCode - The entity type code
   * @param entityId - The numeric ID of the entity instance
   */
  hasAnyRole: (entityTypeCode: EntityTypeCode, entityId: number) => boolean;
  /**
   * All roles the user holds on the given entity.
   * @param entityTypeCode - The entity type code
   * @param entityId - The numeric ID of the entity instance
   */
  getRoles: (entityTypeCode: EntityTypeCode, entityId: number) => RoleCode[];
  /**
   * Replace all permissions by parsing a fresh array of raw strings
   * (e.g. the array received from the provider service).
   * @param rawPermissions - Raw permission strings in the form "entityType:entityId:role"
   */
  loadPermissions: (rawPermissions: string[]) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const PermissionsContext = createContext<PermissionsContextValue | null>(null);

interface PermissionsProviderProps {
  children: ReactNode;
  /**
   * Raw permission strings from the provider service, each in the form
   * "entityType:entityId:role"  (e.g. ["2:10:22", "1:5:1"]).
   * Re-passing a new array replaces the current permissions.
   */
  permissions?: string[];
}

export function PermissionsProvider({
  children,
  permissions: rawPermissions = [],
}: PermissionsProviderProps) {
  const [permissions, setPermissions] = useState<Permission[]>(() =>
    rawPermissions.map(parsePermissionString),
  );

  // Keep state in sync whenever the caller updates the raw array reference
  useEffect(() => {
    setPermissions(rawPermissions.map(parsePermissionString));
  }, [rawPermissions]);

  const loadPermissions = useCallback((raw: string[]) => {
    setPermissions(raw.map(parsePermissionString));
  }, []);

  const hasPermission = useCallback(
    (entityTypeCode: EntityTypeCode, entityId: number, roleCode: RoleCode) =>
      permissions.some(
        (p) =>
          p.entityTypeCode === entityTypeCode &&
          p.entityId === entityId &&
          p.roleCode === roleCode,
      ),
    [permissions],
  );

  const hasAnyRole = useCallback(
    (entityTypeCode: EntityTypeCode, entityId: number) =>
      permissions.some(
        (p) => p.entityTypeCode === entityTypeCode && p.entityId === entityId,
      ),
    [permissions],
  );

  const getRoles = useCallback(
    (entityTypeCode: EntityTypeCode, entityId: number): RoleCode[] =>
      permissions
        .filter((p) => p.entityTypeCode === entityTypeCode && p.entityId === entityId)
        .map((p) => p.roleCode),
    [permissions],
  );

  const value = useMemo<PermissionsContextValue>(
    () => ({ permissions, hasPermission, hasAnyRole, getRoles, loadPermissions }),
    [permissions, hasPermission, hasAnyRole, getRoles, loadPermissions],
  );

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}
