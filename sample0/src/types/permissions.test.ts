import { describe, it, expect } from 'vitest';
import { parseGeneralPermission, parsePermissionString } from './permissions';

describe('parsePermissionString', () => {
  it('parses a valid permission string into typed fields', () => {
    const result = parsePermissionString('2:10:1');
    expect(result).toEqual({ entityTypeCode: '2', entityId: 10, roleCode: '1' });
  });

  it('parses entityId as a number', () => {
    const result = parsePermissionString('1:42:3');
    expect(typeof result.entityId).toBe('number');
    expect(result.entityId).toBe(42);
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
