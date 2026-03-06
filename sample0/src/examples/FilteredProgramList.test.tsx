import { describe, it, expect } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { PermissionsProvider } from '../contexts/PermissionsProvider';
import type { PermissionToken } from '../types/permissions';
import { FilteredProgramList } from './FilteredProgramList';

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
  { programId: 1, name: 'Alpha' },
  { programId: 2, name: 'Beta' },
  { programId: 3, name: 'Gamma' },
];

describe('FilteredProgramList', () => {
  it('shows no programs when user has no permissions', async () => {
    await renderWithPermissions(<FilteredProgramList programs={PROGRAMS} />, []);
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
    expect(screen.queryByText('Beta')).not.toBeInTheDocument();
    expect(screen.queryByText('Gamma')).not.toBeInTheDocument();
  });

  it('shows programs where user has ADMIN role', async () => {
    await renderWithPermissions(<FilteredProgramList programs={PROGRAMS} />, [
      '2:1:1', // Alpha — ADMIN
    ]);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.queryByText('Beta')).not.toBeInTheDocument();
    expect(screen.queryByText('Gamma')).not.toBeInTheDocument();
  });

  it('shows programs where user has MEMBER role', async () => {
    await renderWithPermissions(<FilteredProgramList programs={PROGRAMS} />, [
      '2:2:2', // Beta — MEMBER
    ]);
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
    expect(screen.queryByText('Gamma')).not.toBeInTheDocument();
  });

  it('excludes programs where user has only VIEWER role', async () => {
    await renderWithPermissions(<FilteredProgramList programs={PROGRAMS} />, [
      '2:3:3', // Gamma — VIEWER
    ]);
    expect(screen.queryByText('Gamma')).not.toBeInTheDocument();
  });

  it('handles mixed permissions across multiple programs', async () => {
    await renderWithPermissions(<FilteredProgramList programs={PROGRAMS} />, [
      '2:1:1', // Alpha — ADMIN
      '2:2:2', // Beta — MEMBER
      '2:3:3', // Gamma — VIEWER (excluded)
    ]);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.queryByText('Gamma')).not.toBeInTheDocument();
  });
});
