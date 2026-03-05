import { createContext } from 'react';
import type {
  EntityPredicateBuilder,
  PermissionChecker,
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
