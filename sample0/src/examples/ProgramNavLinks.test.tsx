import { describe, it, expect } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { PermissionsProvider } from '../contexts/PermissionsContext';
import type { PermissionToken } from '../types/permissions';
import { ProgramNavLinks } from './ProgramNavLinks';

async function renderWithPermissions(ui: ReactNode, permissions: string[]) {
  const token: PermissionToken = { permissions, generalPermissions: [], csrfToken: '' };
  await act(async () => {
    render(
      <AuthProvider fetchToken={() => Promise.resolve(token)}>
        <PermissionsProvider>{ui}</PermissionsProvider>
      </AuthProvider>,
    );
  });
}

const PROGRAMS = [
  { id: 1, name: 'Alpha' },
  { id: 2, name: 'Beta' },
  { id: 3, name: 'Gamma' },
];

describe('ProgramNavLinks', () => {
  it('hides programs the user has no permission for', async () => {
    await renderWithPermissions(<ProgramNavLinks programs={PROGRAMS} />, []);
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
    expect(screen.queryByText('Beta')).not.toBeInTheDocument();
    expect(screen.queryByText('Gamma')).not.toBeInTheDocument();
  });

  it('shows programs where user has MEMBER role', async () => {
    await renderWithPermissions(<ProgramNavLinks programs={PROGRAMS} />, [
      '2:2:2', // Beta — MEMBER
    ]);
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
    expect(screen.queryByText('Gamma')).not.toBeInTheDocument();
  });

  it('shows programs where user has ADMIN role', async () => {
    await renderWithPermissions(<ProgramNavLinks programs={PROGRAMS} />, [
      '2:1:1', // Alpha — ADMIN
    ]);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
  });

  it('shows Manage link only for programs where user is ADMIN', async () => {
    await renderWithPermissions(<ProgramNavLinks programs={PROGRAMS} />, [
      '2:1:1', // Alpha — ADMIN
      '2:2:2', // Beta — MEMBER
    ]);
    // Alpha: both the program link and Manage link
    expect(screen.getByRole('link', { name: 'Alpha' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Manage', hidden: false })).toBeInTheDocument();
    // Beta: program link but no Manage link
    expect(screen.getByRole('link', { name: 'Beta' })).toBeInTheDocument();
    const manageLinks = screen.getAllByRole('link', { name: 'Manage' });
    expect(manageLinks).toHaveLength(1);
    expect(manageLinks[0]).toHaveAttribute('href', '/programs/1/manage');
  });

  it('hides programs where user has only VIEWER role', async () => {
    await renderWithPermissions(<ProgramNavLinks programs={PROGRAMS} />, [
      '2:3:3', // Gamma — VIEWER
    ]);
    expect(screen.queryByText('Gamma')).not.toBeInTheDocument();
  });

  it('handles mixed permissions across multiple programs correctly', async () => {
    await renderWithPermissions(<ProgramNavLinks programs={PROGRAMS} />, [
      '2:1:1', // Alpha — ADMIN
      '2:2:2', // Beta — MEMBER
      '2:3:3', // Gamma — VIEWER (excluded)
    ]);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.queryByText('Gamma')).not.toBeInTheDocument();

    const manageLinks = screen.getAllByRole('link', { name: 'Manage' });
    expect(manageLinks).toHaveLength(1);
    expect(manageLinks[0]).toHaveAttribute('href', '/programs/1/manage');
  });
});
