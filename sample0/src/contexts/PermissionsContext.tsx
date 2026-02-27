import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AuthContext } from './AuthContext';
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
  /** The CSRF token from the current PermissionToken. */
  csrfToken: string;
}

// eslint-disable-next-line react-refresh/only-export-components
export const PermissionsContext = createContext<PermissionsContextValue | null>(null);

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

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const auth = useContext(AuthContext);
  const token = auth?.token ?? DEFAULT_TOKEN;

  const [state, setState] = useState<ParsedToken>(() => parseToken(token));

  useEffect(() => {
    setState(parseToken(token));
  }, [token]);

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
    () => ({ permissions, hasPermission, hasAnyRole, getRoles, hasGeneralPermission, csrfToken }),
    [permissions, hasPermission, hasAnyRole, getRoles, hasGeneralPermission, csrfToken],
  );

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}
