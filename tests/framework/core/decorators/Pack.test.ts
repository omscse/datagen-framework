import { describe, it, expect } from 'vitest';
import { Pack } from '../../../../src/framework/core/decorators/Pack.js';
import { getPackMetadata } from '../../../../src/framework/core/decorators/getPackMetadata.js';
import type { DataGenerationPack } from '../../../../src/framework/core/types/pack.js';

describe('@Pack decorator / getPackMetadata', () => {
  it('attaches metadata to a class via the decorator', () => {
    @Pack({ name: 'SomePack', description: 'Does something' })
    class SomePack implements DataGenerationPack<void> {
      async createDefault() {}
      async delete() {}
    }

    const meta = getPackMetadata(SomePack);
    expect(meta).toBeDefined();
    expect(meta?.name).toBe('SomePack');
    expect(meta?.description).toBe('Does something');
  });

  it('returns undefined for a class without @Pack', () => {
    class NakedClass {}
    expect(getPackMetadata(NakedClass)).toBeUndefined();
  });

  it('does not expose the metadata as an enumerable property', () => {
    @Pack({ name: 'Hidden', description: 'Not enumerable' })
    class HiddenPack implements DataGenerationPack<void> {
      async createDefault() {}
      async delete() {}
    }

    const keys = Object.keys(HiddenPack);
    expect(keys).not.toContain('PACK_METADATA');
  });

  it('metadata is not writable (property descriptor)', () => {
    @Pack({ name: 'Locked', description: 'Immutable meta' })
    class LockedPack implements DataGenerationPack<void> {
      async createDefault() {}
      async delete() {}
    }

    const meta = getPackMetadata(LockedPack);
    expect(meta?.name).toBe('Locked');

    // Attempting to overwrite should be silently ignored in non-strict mode
    // (in strict mode it would throw — both behaviours confirm non-writable).
    try {
      (LockedPack as any)[Symbol.for('PACK_METADATA')] = { name: 'Mutated' };
    } catch {
      // strict mode threw — that's fine too
    }

    expect(getPackMetadata(LockedPack)?.name).toBe('Locked');
  });
});
