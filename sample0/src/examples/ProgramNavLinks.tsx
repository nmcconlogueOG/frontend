import { usePermissions } from '../hooks/usePermissions';
import {
  and,
  isAdminOnProgram,
  not,
  or,
  ENTITY_TYPE_MAP,
  ROLE_MAP,
  type PermissionPredicate,
} from '../types/permissions';

interface Program {
  id: number;
  name: string;
}

// Predicate factory — narrows any predicate to a specific program ID.
const forProgram = (id: number): PermissionPredicate => (p) => p.entityId.progId === id;

// Matches any Program permission where the role is Member.
const isMemberOnProgram: PermissionPredicate = (p) =>
  p.entityTypeCode === ENTITY_TYPE_MAP.PROGRAM.code && p.roleCode === ROLE_MAP.MEMBER.code;

export function ProgramNavLinks({ programs }: { programs: Program[] }) {
  const { filterPermissions } = usePermissions();

  // or: accessible if the user holds ADMIN or MEMBER on the program
  const accessibleIds = new Set(
    filterPermissions(or(isAdminOnProgram, isMemberOnProgram)).map((p) => p.entityId.progId),
  );

  // and: composes a role predicate with a program-scoped predicate to check manage eligibility
  const adminIds = new Set(
    programs
      .filter((prog) => filterPermissions(and(isAdminOnProgram, forProgram(prog.id))).length > 0)
      .map((prog) => prog.id),
  );

  // and + not: member access only — accessible but not an admin
  const memberOnlyIds = new Set(
    filterPermissions(and(isMemberOnProgram, not(isAdminOnProgram))).map((p) => p.entityId.progId),
  );

  return (
    <nav>
      {programs
        .filter((prog) => accessibleIds.has(prog.id))
        .map((prog) => (
          <div key={prog.id}>
            <a href={`/programs/${prog.id}`}>{prog.name}</a>
            {adminIds.has(prog.id) && (
              <a href={`/programs/${prog.id}/manage`}>Manage</a>
            )}
            {memberOnlyIds.has(prog.id) && <span>(member)</span>}
          </div>
        ))}
    </nav>
  );
}
