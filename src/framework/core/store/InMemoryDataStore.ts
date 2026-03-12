import type { DataStore, StoredDataRecord } from '../types/store.js';
import { DuplicateStoreNameError } from '../errors/DuplicateStoreNameError.js';
import { StoredDataNotFoundError } from '../errors/StoredDataNotFoundError.js';

export class InMemoryDataStore implements DataStore {
  private readonly records = new Map<string, StoredDataRecord>();

  save<T>(name: string, record: StoredDataRecord<T>): void {
    if (this.records.has(name)) throw new DuplicateStoreNameError(name);
    this.records.set(name, record as StoredDataRecord);
  }

  get<T>(name: string): StoredDataRecord<T> {
    const record = this.records.get(name);
    if (!record) throw new StoredDataNotFoundError(name);
    return record as StoredDataRecord<T>;
  }

  has(name: string): boolean {
    return this.records.has(name);
  }

  delete(name: string): void {
    this.records.delete(name);
  }

  list(): Array<StoredDataRecord & { key: string }> {
    return [...this.records.entries()].map(([key, value]) => ({ key, ...value }));
  }

  clear(): void {
    this.records.clear();
  }
}
