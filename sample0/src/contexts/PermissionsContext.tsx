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
  type EntityPredicateBuilder,
  type GeneralPermission,
  type Permission,
  type PermissionChecker,
  type PermissionToken,
} from '../types/permissions';

export interface PermissionsContextValue extends PermissionChecker {
  /**
   * Filters a list of domain entity objects using an EntityPredicateBuilder.
   * @param entities - The list of domain objects to filter.
   * @param builder - A predicate builder that receives a PermissionChecker and returns a predicate.
   */
  filterEntities: <T>(entities: T[], builder: EntityPredicateBuilder<T>) => T[];
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

  const filterPermissions = useCallback(
    (predicate: (permission: Permission) => boolean) => permissions.filter(predicate),
    [permissions],
  );

  const hasGeneralPermission = useCallback(
    (permission: GeneralPermission) => generalPermissions.includes(permission),
    [generalPermissions],
  );

  const filterEntities = useCallback(
    <T,>(entities: T[], builder: EntityPredicateBuilder<T>): T[] => {
      const checker: PermissionChecker = { filterPermissions, hasGeneralPermission };
      return entities.filter(builder(checker));
    },
    [filterPermissions, hasGeneralPermission],
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
