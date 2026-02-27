import type { PermissionToken } from '../types/permissions';

/**
 * Fetches the current user's PermissionToken from the backend.
 * Replace this implementation with a real API call (e.g. fetch('/api/auth/token')).
 */
export async function fetchPermissionToken(): Promise<PermissionToken> {
  // Mock: simulate network round-trip
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  return {
    permissions: [
      '2:1:1', // PROGRAM 1 — ADMIN
      '2:2:2', // PROGRAM 2 — MEMBER
      '2:3:3', // PROGRAM 3 — VIEWER
    ],
    generalPermissions: ['EDIT'],
    csrfToken: 'mock-csrf-token',
  };
}
