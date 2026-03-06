import { usePermissions } from '../hooks/usePermissions';
import {
  DEFAULT_ENTITY_ID,
  ENTITY_TYPE_MAP,
  ROLE_MAP,
  entityIdMatches,
  type Entity,
  type EntityPredicateBuilder,
} from '../types/permissions';

interface Program {
  programId: number;
  name: string;
}

interface ProgramEntity extends Program, Entity {}

function toProgramEntity(data: Program): ProgramEntity {
  return {
    ...data,
    entityId: () => ({ ...DEFAULT_ENTITY_ID, progId: data.programId }),
  };
}

const canAccessProgram: EntityPredicateBuilder<ProgramEntity> = (filterPermissions) => (program) =>
  filterPermissions(p =>
    p.entityTypeCode === ENTITY_TYPE_MAP.PROGRAM.code &&
    entityIdMatches(p.entityId, program.entityId()) &&
    (p.roleCode === ROLE_MAP.ADMIN.code || p.roleCode === ROLE_MAP.MEMBER.code)
  ).length > 0;

export function FilteredProgramList({ programs }: { programs: Program[] }) {
  const { filterEntities } = usePermissions();

  const accessible = filterEntities(
    programs.map(toProgramEntity),
    canAccessProgram,
  );

  return (
    <ul>
      {accessible.map(p => <li key={p.programId}>{p.name}</li>)}
    </ul>
  );
}
