import { CleanupManager } from '../../core/cleanup/CleanupManager.js';
import { DataGenerator } from '../../core/generator/DataGenerator.js';
import { JsonFileDataStore } from '../../core/store/JsonFileDataStore.js';
import type { PackClass } from '../../core/types/pack.js';

export function initWebUiAdapter<T extends Record<string, PackClass>>(
  registry: T,
  cacheFile: string,
) {
  const store = new JsonFileDataStore(cacheFile);
  return {
    generator: new DataGenerator(registry, store),
    cleanupManager: new CleanupManager(registry, store),
    store,
  };
}
