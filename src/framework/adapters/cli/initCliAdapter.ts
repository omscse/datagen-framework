import { CleanupManager } from '../../core/cleanup/CleanupManager.js';
import { DataGenerator } from '../../core/generator/DataGenerator.js';
import { JsonFileDataStore } from '../../core/store/JsonFileDataStore.js';

export function initCliAdapter<T extends Record<string, new () => any>>(registry: T, cacheFile: string) {
  const store = new JsonFileDataStore(cacheFile);
  return {
    generator: new DataGenerator(registry, store),
    cleanupManager: new CleanupManager(registry, store),
  };
}
