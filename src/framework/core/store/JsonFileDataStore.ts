import { promises as fs } from 'node:fs';
import { dirname } from 'node:path';
import type { DataStore, StoredDataRecord } from '../types/store.js';
import { DuplicateStoreNameError } from '../errors/DuplicateStoreNameError.js';
import { StoredDataNotFoundError } from '../errors/StoredDataNotFoundError.js';

export class JsonFileDataStore implements DataStore {
  constructor(private readonly filePath: string) {}

  private async readAll(): Promise<Record<string, StoredDataRecord>> {
    try {
      const content = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(content) as Record<string, StoredDataRecord>;
    } catch (err) {
      if ((err as { code?: string }).code === 'ENOENT') return {};
      throw err;
    }
  }

  private async writeAll(data: Record<string, StoredDataRecord>): Promise<void> {
    await fs.mkdir(dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  async save<T>(name: string, record: StoredDataRecord<T>): Promise<void> {
    const all = await this.readAll();
    if (all[name]) throw new DuplicateStoreNameError(name);
    all[name] = record as StoredDataRecord;
    await this.writeAll(all);
  }

  async get<T>(name: string): Promise<StoredDataRecord<T>> {
    const all = await this.readAll();
    if (!all[name]) throw new StoredDataNotFoundError(name);
    return all[name] as StoredDataRecord<T>;
  }

  async has(name: string): Promise<boolean> {
    const all = await this.readAll();
    return Boolean(all[name]);
  }

  async delete(name: string): Promise<void> {
    const all = await this.readAll();
    delete all[name];
    await this.writeAll(all);
  }

  async list(): Promise<Array<StoredDataRecord & { key: string }>> {
    const all = await this.readAll();
    return Object.entries(all).map(([key, value]) => ({ key, ...value }));
  }

  async clear(): Promise<void> {
    await this.writeAll({});
  }
}
