import { getRegisteredPacks } from '../../core/registry/getRegisteredPacks.js';

export function listPacks<T extends Record<string, new () => any>>(registry: T) {
  return getRegisteredPacks(registry);
}
