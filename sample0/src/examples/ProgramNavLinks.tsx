import { usePermissions } from '../hooks/usePermissions';
import { ENTITY_TYPE_MAP, ROLE_MAP } from '../types/permissions';

interface Program {
  id: number;
  name: string;
}

/**
 * Renders navigation links for programs the user can access.
 * Only ADMIN and MEMBER roles grant access — VIEWER is excluded.
 * An additional "Manage" link is shown for programs where the user is ADMIN.
 */
export function ProgramNavLinks({ programs }: { programs: Program[] }) {
  const { hasPermission } = usePermissions();
  const PROGRAM = ENTITY_TYPE_MAP.PROGRAM.code;

  // Only ADMIN and MEMBER can see the program — VIEWER is excluded
  const accessible = programs.filter(
    (p) =>
      hasPermission(PROGRAM, p.id, ROLE_MAP.ADMIN.code) ||
      hasPermission(PROGRAM, p.id, ROLE_MAP.MEMBER.code),
  );

  return (
    <nav>
      {accessible.map((p) => (
        <div key={p.id}>
          <a href={`/programs/${p.id}`}>{p.name}</a>
          {hasPermission(PROGRAM, p.id, ROLE_MAP.ADMIN.code) && (
            <a href={`/programs/${p.id}/manage`}>Manage</a>
          )}
        </div>
      ))}
    </nav>
  );
}
