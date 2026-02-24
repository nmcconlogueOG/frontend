import { useContext } from 'react';
import { PermissionsContext, type PermissionsContextValue } from '../contexts/PermissionsContext';

export function usePermissions(): PermissionsContextValue {
  const ctx = useContext(PermissionsContext);
  if (!ctx) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return ctx;
}
