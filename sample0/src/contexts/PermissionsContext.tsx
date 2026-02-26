import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  parseGeneralPermission,
  parsePermissionString,
  type EntityTypeCode,
  type GeneralPermission,
  type Permission,
  type PermissionToken,
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
   * True if the user has the given general (entity-less) permission.
   * @param permission - The permission to check (e.g. "VIEW", "EDIT", "MANAGE")
   */
  hasGeneralPermission: (permission: GeneralPermission) => boolean;
  /** The CSRF token from the last loaded PermissionToken. */
  csrfToken: string;
  /**
   * Replace all state atomically by loading a fresh PermissionToken
   * (e.g. the object received from the backend).
   */
  loadToken: (token: PermissionToken) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const PermissionsContext = createContext<PermissionsContextValue | null>(null);

interface PermissionsProviderProps {
  children: ReactNode;
  /**
   * Structured token from the backend containing entity-scoped permissions,
   * general role permissions, and a CSRF token.
   * Re-passing a new token replaces all current state.
   */
  token?: PermissionToken;
}

const DEFAULT_TOKEN: PermissionToken = { permissions: [], generalPermissions: [], csrfToken: '' };

interface ParsedToken {
  permissions: Permission[];
  generalPermissions: GeneralPermission[];
  csrfToken: string;
}

function parseToken(token: PermissionToken): ParsedToken {
  return {
    permissions: token.permissions.map(parsePermissionString),
    generalPermissions: token.generalPermissions.map(parseGeneralPermission),
    csrfToken: token.csrfToken,
  };
}

export function PermissionsProvider({
  children,
  token = DEFAULT_TOKEN,
}: PermissionsProviderProps) {
  const [state, setState] = useState<ParsedToken>(() => parseToken(token));

  // Keep state in sync whenever the caller updates the token reference
  useEffect(() => {
    setState(parseToken(token));
  }, [token]);

  const loadToken = useCallback((t: PermissionToken) => {
    setState(parseToken(t));
  }, []);

  const { permissions, generalPermissions, csrfToken } = state;

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

  const hasGeneralPermission = useCallback(
    (permission: GeneralPermission) => generalPermissions.includes(permission),
    [generalPermissions],
  );

  const value = useMemo<PermissionsContextValue>(
    () => ({ permissions, hasPermission, hasAnyRole, getRoles, hasGeneralPermission, csrfToken, loadToken }),
    [permissions, hasPermission, hasAnyRole, getRoles, hasGeneralPermission, csrfToken, loadToken],
  );

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}
