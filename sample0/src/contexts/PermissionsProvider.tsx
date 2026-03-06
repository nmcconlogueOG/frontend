import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AuthContext } from './AuthContext';
import { PermissionsContext, type PermissionsContextValue } from './PermissionsContext';
import {
  parseGeneralPermission,
  parsePermissionString,
  type Entity,
  type EntityPredicateBuilder,
  type GeneralPermission,
  type Permission,
  type PermissionToken,
} from '../types/permissions';

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

  const filterPermissions = useCallback(
    (predicate: (permission: Permission) => boolean) => permissions.filter(predicate),
    [permissions],
  );

  const hasGeneralPermission = useCallback(
    (permission: GeneralPermission) => generalPermissions.includes(permission),
    [generalPermissions],
  );

  const filterEntities = useCallback(
    <E extends Entity>(entities: E[], builder: EntityPredicateBuilder<E>): E[] =>
      entities.filter(builder(filterPermissions)),
    [filterPermissions],
  );

  const value = useMemo<PermissionsContextValue>(
    () => ({ filterPermissions, hasGeneralPermission, filterEntities, csrfToken }),
    [filterPermissions, hasGeneralPermission, filterEntities, csrfToken],
  );

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}
