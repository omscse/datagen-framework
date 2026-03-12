import type { PackClass } from '../types/pack.js';
import { getPackMetadata } from '../decorators/getPackMetadata.js';

export function getRegisteredPacks<T extends Record<string, PackClass>>(registry: T) {
  return Object.entries(registry).map(([registryKey, PackCtor]) => ({
    registryKey,
    metadata: getPackMetadata(PackCtor),
    packClass: PackCtor,
  }));
}
