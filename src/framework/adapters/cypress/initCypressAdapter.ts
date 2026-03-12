import { CleanupManager } from '../../core/cleanup/CleanupManager.js';
import { DataGenerator } from '../../core/generator/DataGenerator.js';
import { InMemoryDataStore } from '../../core/store/InMemoryDataStore.js';
import { registerCommands } from './registerCommands.js';
import { registerHooks } from './registerHooks.js';
import { registerTasks } from './registerTasks.js';

export function initCypressAdapter<T extends Record<string, new () => any>>(
  params: {
    registry: T;
    on: (event: 'task' | 'after:run', handler: any) => void;
    CypressRef?: any;
  },
): void {
  const store = new InMemoryDataStore();
  const generator = new DataGenerator(params.registry, store);
  const cleanupManager = new CleanupManager(params.registry, store);

  registerTasks(params.on as any, {
    generateDefault: (packName, options) => generator.generateDefault(packName as keyof T, options),
    generateCustom: (packName, input, options) => generator.generateCustom(packName as any, input as any, options),
    retrieveData: (storeName) => generator.retrieveData(storeName),
  });

  registerHooks(params.on as any, {
    cleanup: async () => {
      await cleanupManager.cleanupAll();
    },
  });

  if (params.CypressRef) {
    registerCommands(params.CypressRef);
  }
}
