import { describe, it, expect } from 'vitest';
import { parseGeneralPermission, parsePermissionString } from './permissions';

describe('parsePermissionString', () => {
  it('parses a valid permission string into typed fields', () => {
    const result = parsePermissionString('2:10:1');
    expect(result).toEqual({ entityTypeCode: '2', entityId: { orgId: 0, progId: 10, subOrgId: 0 }, roleCode: '1' });
  });

  it('sets orgId for organization entity type', () => {
    const result = parsePermissionString('1:42:3');
    expect(result.entityId).toEqual({ orgId: 42, progId: 0, subOrgId: 0 });
  });

  it('throws for an unknown entity type code', () => {
    expect(() => parsePermissionString('9:10:1')).toThrow('Unknown entity type code: "9"');
  });

  it('throws for a string with too few parts', () => {
    expect(() => parsePermissionString('2:10')).toThrow('Invalid permission string: "2:10"');
  });

  it('throws for a string with too many parts', () => {
    expect(() => parsePermissionString('2:10:1:extra')).toThrow(
      'Invalid permission string: "2:10:1:extra"',
    );
  });

  it('throws for an empty string', () => {
    expect(() => parsePermissionString('')).toThrow();
  });
});

describe('parseGeneralPermission', () => {
  it('returns the value for a known general permission', () => {
    expect(parseGeneralPermission('VIEW')).toBe('VIEW');
    expect(parseGeneralPermission('EDIT')).toBe('EDIT');
    expect(parseGeneralPermission('MANAGE')).toBe('MANAGE');
  });

  it('throws for an unknown general permission', () => {
    expect(() => parseGeneralPermission('ADMIN')).toThrow('Unknown general permission: "ADMIN"');
  });
});
