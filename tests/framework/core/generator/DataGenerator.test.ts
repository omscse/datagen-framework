import { describe, it, expect, beforeEach } from 'vitest';
import { DataGenerator } from '../../../../src/framework/core/generator/DataGenerator.js';
import { InMemoryDataStore } from '../../../../src/framework/core/store/InMemoryDataStore.js';
import { PackNotFoundError } from '../../../../src/framework/core/errors/PackNotFoundError.js';
import { CustomGenerationNotSupportedError } from '../../../../src/framework/core/errors/CustomGenerationNotSupportedError.js';
import { Pack } from '../../../../src/framework/core/decorators/Pack.js';
import type { DataGenerationPack } from '../../../../src/framework/core/types/pack.js';

// --- test packs ---

@Pack({ name: 'UserPack', description: 'Creates users' })
class UserPack implements DataGenerationPack<{ id: number; name: string }> {
  async createDefault() {
    return { id: 1, name: 'Default User' };
  }
  async delete(_data: { id: number; name: string }) {}
}

@Pack({ name: 'OrderPack', description: 'Creates orders with custom input' })
class OrderPack implements DataGenerationPack<{ orderId: string }, { sku: string }> {
  async createDefault() {
    return { orderId: 'default-order' };
  }
  async createCustom(input: { sku: string }) {
    return { orderId: `order-for-${input.sku}` };
  }
  async delete(_data: { orderId: string }) {}
}

const registry = { UserPack, OrderPack } as const;

describe('DataGenerator', () => {
  let store: InMemoryDataStore;
  let generator: DataGenerator<typeof registry>;

  beforeEach(() => {
    store = new InMemoryDataStore();
    generator = new DataGenerator(registry, store);
  });

  describe('generateDefault', () => {
    it('returns default data from the pack', async () => {
      const result = await generator.generateDefault('UserPack');
      expect(result).toEqual({ id: 1, name: 'Default User' });
    });

    it('throws PackNotFoundError for an unknown pack name', async () => {
      const gen = new DataGenerator({} as typeof registry, store);
      await expect(gen.generateDefault('UserPack')).rejects.toThrow(PackNotFoundError);
    });

    it('always saves the result using packName as default key', async () => {
      await generator.generateDefault('UserPack');
      expect(await generator.hasStoredData('UserPack')).toBe(true);
      const record = await generator.getStoredRecord('UserPack');
      expect(record.packName).toBe('UserPack');
      expect(record.data).toEqual({ id: 1, name: 'Default User' });
    });

    it('saves under storeAs key when provided', async () => {
      await generator.generateDefault('UserPack', { storeAs: 'myUser' });
      expect(await generator.hasStoredData('UserPack', { storeAs: 'myUser' })).toBe(true);
      expect(await generator.hasStoredData('UserPack')).toBe(false);
    });

    it('stores packName on the record regardless of key used', async () => {
      await generator.generateDefault('UserPack', { storeAs: 'customKey' });
      const record = await generator.getStoredRecord('UserPack', { storeAs: 'customKey' });
      expect(record.packName).toBe('UserPack');
    });
  });

  describe('generateCustom', () => {
    it('returns custom data from the pack', async () => {
      const result = await generator.generateCustom('OrderPack', { sku: 'ABC' });
      expect(result).toEqual({ orderId: 'order-for-ABC' });
    });

    it('throws CustomGenerationNotSupportedError when pack has no createCustom', async () => {
      await expect(
        (generator as any).generateCustom('UserPack', {}),
      ).rejects.toThrow(CustomGenerationNotSupportedError);
    });

    it('saves under packName by default', async () => {
      await generator.generateCustom('OrderPack', { sku: 'XYZ' });
      expect(await generator.hasStoredData('OrderPack')).toBe(true);
      const record = await generator.getStoredRecord('OrderPack');
      expect(record.packName).toBe('OrderPack');
    });

    it('saves under storeAs key when provided', async () => {
      await generator.generateCustom('OrderPack', { sku: 'XYZ' }, { storeAs: 'myOrder' });
      expect(await generator.hasStoredData('OrderPack', { storeAs: 'myOrder' })).toBe(true);
      expect(await generator.hasStoredData('OrderPack')).toBe(false);
    });
  });

  describe('retrieveData', () => {
    it('returns the data portion of a stored record using storeAs', async () => {
      await generator.generateDefault('UserPack', { storeAs: 'storedUser' });
      const data = await generator.retrieveData<{ id: number; name: string }>('UserPack', { storeAs: 'storedUser' });
      expect(data).toEqual({ id: 1, name: 'Default User' });
    });

    it('returns data stored under the default packName key', async () => {
      await generator.generateDefault('UserPack');
      const data = await generator.retrieveData<{ id: number; name: string }>('UserPack');
      expect(data).toEqual({ id: 1, name: 'Default User' });
    });
  });

  describe('hasStoredData / getStoredRecord', () => {
    it('hasStoredData returns false before generation', async () => {
      expect(await generator.hasStoredData('UserPack')).toBe(false);
    });

    it('hasStoredData returns true after generation (default key)', async () => {
      await generator.generateDefault('UserPack');
      expect(await generator.hasStoredData('UserPack')).toBe(true);
    });

    it('hasStoredData uses storeAs to locate the record', async () => {
      await generator.generateDefault('UserPack', { storeAs: 'alias' });
      expect(await generator.hasStoredData('UserPack', { storeAs: 'alias' })).toBe(true);
      expect(await generator.hasStoredData('UserPack')).toBe(false);
    });

    it('getStoredRecord returns the full record', async () => {
      await generator.generateDefault('UserPack', { storeAs: 'alias' });
      const record = await generator.getStoredRecord('UserPack', { storeAs: 'alias' });
      expect(record.packName).toBe('UserPack');
      expect(record.data).toEqual({ id: 1, name: 'Default User' });
      expect(record.createdAt).toBeTruthy();
    });

    it('two packs with same storeAs value get distinct keys', async () => {
      await generator.generateDefault('UserPack', { storeAs: 'run1' });
      await generator.generateDefault('OrderPack', { storeAs: 'run1' });
      expect(await generator.hasStoredData('UserPack', { storeAs: 'run1' })).toBe(true);
      expect(await generator.hasStoredData('OrderPack', { storeAs: 'run1' })).toBe(true);
      expect(store.list()).toHaveLength(2);
    });
  });

  describe('cleanup', () => {
    it('calls pack.delete and removes the record from the store (default key)', async () => {
      await generator.generateDefault('UserPack');
      expect(await generator.hasStoredData('UserPack')).toBe(true);

      const data = await generator.retrieveData('UserPack');
      await generator.cleanup('UserPack', data);

      expect(await generator.hasStoredData('UserPack')).toBe(false);
    });

    it('removes the record stored under storeAs key', async () => {
      await generator.generateDefault('UserPack', { storeAs: 'myUser' });
      const data = await generator.retrieveData('UserPack', { storeAs: 'myUser' });

      await generator.cleanup('UserPack', data, { storeAs: 'myUser' });

      expect(await generator.hasStoredData('UserPack', { storeAs: 'myUser' })).toBe(false);
    });

    it('throws PackNotFoundError for an unknown pack name', async () => {
      await expect(
        (generator as any).cleanup('GhostPack', {})
      ).rejects.toThrow(PackNotFoundError);
    });

    it('cleanup after regenerate removes only the current record', async () => {
      // First generation
      await generator.generateDefault('UserPack', { storeAs: 'run1' });
      const firstData = await generator.retrieveData('UserPack', { storeAs: 'run1' });

      // Simulate regenerate: cleanup old, generate new under same key
      await generator.cleanup('UserPack', firstData, { storeAs: 'run1' });
      await generator.generateDefault('UserPack', { storeAs: 'run1' });

      // Only run1 should exist with the new generation
      expect(await generator.hasStoredData('UserPack', { storeAs: 'run1' })).toBe(true);
      expect(store.list()).toHaveLength(1);

      // Cleanup the new one
      const newData = await generator.retrieveData('UserPack', { storeAs: 'run1' });
      await generator.cleanup('UserPack', newData, { storeAs: 'run1' });
      expect(await generator.hasStoredData('UserPack', { storeAs: 'run1' })).toBe(false);
    });
  });
});
