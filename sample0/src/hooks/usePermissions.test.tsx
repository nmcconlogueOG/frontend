import { describe, it, expect } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { AuthProvider } from '../contexts/AuthContext';
import { PermissionsProvider } from '../contexts/PermissionsContext';
import { usePermissions } from './usePermissions';
import { ENTITY_TYPE_MAP, ROLE_MAP, type PermissionToken } from '../types/permissions';

function ThrowingConsumer() {
  usePermissions();
  return null;
}

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
  it('throws when used outside PermissionsProvider', () => {
    // Suppress the React error boundary console output during this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<ThrowingConsumer />)).toThrow(
      'usePermissions must be used within a PermissionsProvider',
    );
    spy.mockRestore();
  });

  it('returns context value when inside PermissionsProvider', async () => {
    await renderWithToken({ permissions: ['2:10:1'], generalPermissions: [], csrfToken: '' });
    expect(screen.getByText('yes')).toBeInTheDocument();
  });
});
