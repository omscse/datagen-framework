import type { PackClass } from '../types/pack.js';
import { validateRegistry } from './validateRegistry.js';

export function definePackRegistry<T extends Record<string, PackClass>>(registry: T): T {
  return validateRegistry(registry);
}
