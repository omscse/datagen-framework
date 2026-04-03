import { describe, it, expect } from 'vitest';
import { safeJson } from '../../../../src/framework/core/utils/safeJson.js';

describe('safeJson', () => {
  it('serializes a plain object', () => {
    expect(safeJson({ a: 1, b: 'hello' })).toBe(JSON.stringify({ a: 1, b: 'hello' }, null, 2));
  });

  it('serializes an array', () => {
    expect(safeJson([1, 2, 3])).toBe(JSON.stringify([1, 2, 3], null, 2));
  });

  it('serializes primitives', () => {
    expect(safeJson('text')).toBe('"text"');
    expect(safeJson(42)).toBe('42');
    expect(safeJson(null)).toBe('null');
  });

  it('returns fallback string for circular references', () => {
    const obj: Record<string, unknown> = {};
    obj.self = obj;
    expect(safeJson(obj)).toBe('[Unserializable value]');
  });
});
