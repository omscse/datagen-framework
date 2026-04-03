import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryDataStore } from '../../../../src/framework/core/store/InMemoryDataStore.js';
import { DuplicateStoreNameError } from '../../../../src/framework/core/errors/DuplicateStoreNameError.js';
import { StoredDataNotFoundError } from '../../../../src/framework/core/errors/StoredDataNotFoundError.js';

const makeRecord = (data: unknown = { id: 1 }) => ({
  packName: 'TestPack',
  data,
  createdAt: new Date().toISOString(),
});

describe('InMemoryDataStore', () => {
  let store: InMemoryDataStore;

  beforeEach(() => {
    store = new InMemoryDataStore();
  });

  describe('save', () => {
    it('saves a record under a given key', () => {
      store.save('user1', makeRecord({ id: 1 }));
      expect(store.has('user1')).toBe(true);
    });

    it('throws DuplicateStoreNameError when the same key is saved twice', () => {
      store.save('user1', makeRecord());
      expect(() => store.save('user1', makeRecord())).toThrow(DuplicateStoreNameError);
    });

    it('throws with a message containing the duplicate key', () => {
      store.save('key', makeRecord());
      expect(() => store.save('key', makeRecord())).toThrow('key');
    });
  });

  describe('get', () => {
    it('returns the saved record', () => {
      const record = makeRecord({ name: 'Alice' });
      store.save('alice', record);
      const result = store.get<{ name: string }>('alice');
      expect(result.data).toEqual({ name: 'Alice' });
      expect(result.packName).toBe('TestPack');
    });

    it('throws StoredDataNotFoundError for unknown keys', () => {
      expect(() => store.get('unknown')).toThrow(StoredDataNotFoundError);
    });

    it('throws with a message containing the missing key', () => {
      expect(() => store.get('missing-key')).toThrow('missing-key');
    });
  });

  describe('has', () => {
    it('returns false when key does not exist', () => {
      expect(store.has('nope')).toBe(false);
    });

    it('returns true after saving', () => {
      store.save('exists', makeRecord());
      expect(store.has('exists')).toBe(true);
    });
  });

  describe('delete', () => {
    it('removes a saved record', () => {
      store.save('temp', makeRecord());
      store.delete('temp');
      expect(store.has('temp')).toBe(false);
    });

    it('does not throw when deleting a non-existent key', () => {
      expect(() => store.delete('ghost')).not.toThrow();
    });
  });

  describe('list', () => {
    it('returns an empty array when store is empty', () => {
      expect(store.list()).toEqual([]);
    });

    it('returns all stored records with their keys', () => {
      store.save('a', makeRecord({ val: 'a' }));
      store.save('b', makeRecord({ val: 'b' }));
      const items = store.list();
      expect(items).toHaveLength(2);
      expect(items.map((i) => i.key)).toEqual(expect.arrayContaining(['a', 'b']));
    });
  });

  describe('clear', () => {
    it('removes all records', () => {
      store.save('x', makeRecord());
      store.save('y', makeRecord());
      store.clear();
      expect(store.list()).toHaveLength(0);
    });
  });
});
