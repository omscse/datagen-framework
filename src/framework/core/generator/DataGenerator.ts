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
import type { DataStore } from '../types/store.js';

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
    await this.saveIfNeeded(String(name), data, options);
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
    await this.saveIfNeeded(String(name), data, options);
    return data as PackOutput<PackInstance<TRegistry, TName>>;
  }

  async retrieveData<T = unknown>(storeName: string): Promise<T> {
    const record = await this.store.get<T>(storeName);
    return record.data;
  }

  private async saveIfNeeded(packName: string, data: unknown, options?: GenerateOptions): Promise<void> {
    if (!options?.storeAs) return;
    await this.store.save(options.storeAs, {
      packName,
      data,
      createdAt: new Date().toISOString(),
    });
  }
}
