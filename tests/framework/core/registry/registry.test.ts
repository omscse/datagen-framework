import { describe, it, expect } from 'vitest';
import { definePackRegistry } from '../../../../src/framework/core/registry/definePackRegistry.js';
import { validateRegistry } from '../../../../src/framework/core/registry/validateRegistry.js';
import { Pack } from '../../../../src/framework/core/decorators/Pack.js';
import { PackMetadataMissingError } from '../../../../src/framework/core/errors/PackMetadataMissingError.js';
import type { DataGenerationPack } from '../../../../src/framework/core/types/pack.js';

@Pack({ name: 'ValidPack', description: 'A valid pack' })
class ValidPack implements DataGenerationPack<{ ok: boolean }> {
  async createDefault() { return { ok: true }; }
  async delete(_data: { ok: boolean }) {}
}

class NakedPack implements DataGenerationPack<{ ok: boolean }> {
  async createDefault() { return { ok: true }; }
  async delete(_data: { ok: boolean }) {}
}

describe('validateRegistry', () => {
  it('returns the registry unchanged when all packs have @Pack metadata', () => {
    const registry = { ValidPack };
    expect(validateRegistry(registry)).toBe(registry);
  });

  it('throws PackMetadataMissingError when a pack is missing @Pack metadata', () => {
    expect(() => validateRegistry({ NakedPack })).toThrow(PackMetadataMissingError);
  });

  it('throws with the registry key in the error message', () => {
    expect(() => validateRegistry({ NakedPack })).toThrow('NakedPack');
  });
});

describe('definePackRegistry', () => {
  it('returns a validated registry', () => {
    const registry = definePackRegistry({ ValidPack });
    expect(registry).toHaveProperty('ValidPack');
  });

  it('throws when a pack is missing metadata', () => {
    expect(() => definePackRegistry({ NakedPack })).toThrow(PackMetadataMissingError);
  });
});
