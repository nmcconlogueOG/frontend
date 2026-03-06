import { describe, it, expect } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { AuthProvider } from '../contexts/AuthContext';
import { PermissionsProvider } from '../contexts/PermissionsProvider';
import { usePermissions } from './usePermissions';
import { ENTITY_TYPE_MAP, ROLE_MAP, type PermissionToken } from '../types/permissions';

function DisplayConsumer() {
  const { filterPermissions } = usePermissions();
  const match = filterPermissions(
    p => p.entityTypeCode === ENTITY_TYPE_MAP.PROGRAM.code && p.entityId.progId === 10 && p.roleCode === ROLE_MAP.ADMIN.code
  );
  return <span>{match.length > 0 ? 'yes' : 'no'}</span>;
}

function renderWithToken(token: PermissionToken) {
  return act(async () => {
    render(
      <AuthProvider fetchToken={() => Promise.resolve(token)}>
        <PermissionsProvider>
          <DisplayConsumer />
        </PermissionsProvider>
      </AuthProvider>,
    );
  });
}

describe('usePermissions', () => {
it('returns context value when inside PermissionsProvider', async () => {
    await renderWithToken({ permissions: ['2:10:1'], generalPermissions: [], csrfToken: '' });
    expect(screen.getByText('yes')).toBeInTheDocument();
  });
});
