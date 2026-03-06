import { createContext } from 'react';
import type {
  Entity,
  EntityPredicateBuilder,
  FilterPermissions,
  GeneralPermission,
} from '../types/permissions';

export interface PermissionsContextValue {
  filterPermissions: FilterPermissions;
  hasGeneralPermission: (permission: GeneralPermission) => boolean;
  /**
   * Filters a list of domain entity objects using an EntityPredicateBuilder.
   * @param entities - The list of domain objects to filter.
   * @param builder - A predicate builder that receives filterPermissions and returns a predicate.
   */
  filterEntities: <E extends Entity>(entities: E[], builder: EntityPredicateBuilder<E>) => E[];
  /** The CSRF token from the current PermissionToken. */
  csrfToken: string;
}

// eslint-disable-next-line react-refresh/only-export-components
export const PermissionsContext = createContext<PermissionsContextValue | null>(null);
