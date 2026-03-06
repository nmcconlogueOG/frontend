import { useContext } from 'react';
import { PermissionsContext, type PermissionsContextValue } from '../contexts/PermissionsContext';

export function usePermissions(): PermissionsContextValue {
  return useContext(PermissionsContext);
}
