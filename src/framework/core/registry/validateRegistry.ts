import type { PackClass } from '../types/pack.js';
import { getPackMetadata } from '../decorators/getPackMetadata.js';
import { PackMetadataMissingError } from '../errors/PackMetadataMissingError.js';

export function validateRegistry<T extends Record<string, PackClass>>(registry: T): T {
  for (const [key, PackCtor] of Object.entries(registry)) {
    if (!getPackMetadata(PackCtor)) {
      throw new PackMetadataMissingError(key);
    }
  }
  return registry;
}
