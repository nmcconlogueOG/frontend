import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PermissionsProvider } from '../contexts/PermissionsContext';
import { usePermissions } from './usePermissions';

function ThrowingConsumer() {
  usePermissions();
  return null;
}

function DisplayConsumer() {
  const { hasPermission } = usePermissions();
  return <span>{hasPermission('2', 10, '1') ? 'yes' : 'no'}</span>;
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

  it('returns context value when inside PermissionsProvider', () => {
    render(
      <PermissionsProvider permissions={['2:10:1']}>
        <DisplayConsumer />
      </PermissionsProvider>,
    );
    expect(screen.getByText('yes')).toBeInTheDocument();
  });
});
