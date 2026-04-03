import { getLogger } from '../logging/loggerRegistry.js';
import { CustomGenerationNotSupportedError, PackNotFoundError } from '../errors/index.js';
import type {
  CustomPackKeys,
  PackClass,
  PackInput,
  PackInstance,
  PackOutput,
} from '../types/pack.js';
import type { GenerateOptions } from '../types/generator.js';
import type { DataStore, StoredDataRecord } from '../types/store.js';

export class DataGenerator<TRegistry extends Record<string, PackClass>> {
  constructor(
    private readonly registry: TRegistry,
    private readonly store: DataStore,
  ) {}

  async generateDefault<TName extends keyof TRegistry>(
    name: TName,
    options?: GenerateOptions,
  ): Promise<PackOutput<PackInstance<TRegistry, TName>>> {
    const logger = getLogger();
    const PackCtor = this.registry[name];
    if (!PackCtor) throw new PackNotFoundError(String(name));

    logger.info(`Generating default data for pack: ${String(name)}`);
    const pack = new PackCtor();
    const data = await pack.createDefault();
    await this.save(String(name), data, options);
    return data as PackOutput<PackInstance<TRegistry, TName>>;
  }

  async generateCustom<TName extends CustomPackKeys<TRegistry>>(
    name: TName,
    input: PackInput<PackInstance<TRegistry, TName>>,
    options?: GenerateOptions,
  ): Promise<PackOutput<PackInstance<TRegistry, TName>>> {
    const logger = getLogger();
    const PackCtor = this.registry[name];
    if (!PackCtor) throw new PackNotFoundError(String(name));

    const pack = new PackCtor();
    if (!pack.createCustom) throw new CustomGenerationNotSupportedError(String(name));

    logger.info(`Generating custom data for pack: ${String(name)}`);
    const data = await pack.createCustom(input);
    await this.save(String(name), data, options);
    return data as PackOutput<PackInstance<TRegistry, TName>>;
  }

  async hasStoredData(packName: string, options?: GenerateOptions): Promise<boolean> {
    return this.store.has(this.buildKey(packName, options?.storeAs));
  }

  async getStoredRecord<T = unknown>(packName: string, options?: GenerateOptions): Promise<StoredDataRecord<T>> {
    return this.store.get<T>(this.buildKey(packName, options?.storeAs));
  }

  async retrieveData<T = unknown>(packName: string, options?: GenerateOptions): Promise<T> {
    const record = await this.getStoredRecord<T>(packName, options);
    return record.data;
  }

  async cleanup<TName extends keyof TRegistry>(
    packName: TName,
    data: unknown,
    options?: GenerateOptions,
  ): Promise<void> {
    const PackCtor = this.registry[packName];
    if (!PackCtor) throw new PackNotFoundError(String(packName));
    const pack = new PackCtor();
    await pack.delete(data as never);
    await this.store.delete(this.buildKey(String(packName), options?.storeAs));
  }

  private async save(packName: string, data: unknown, options?: GenerateOptions): Promise<void> {
    await this.store.save(this.buildKey(packName, options?.storeAs), {
      packName,
      data,
      createdAt: new Date().toISOString(),
    });
  }

  private buildKey(packName: string, storeAs?: string): string {
    return JSON.stringify({ packName, storeAs: storeAs ?? null });
  }
}
