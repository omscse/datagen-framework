import type { PackMetadata } from '../types/metadata.js';
import { PACK_METADATA } from './metadataKeys.js';

export function Pack(meta: PackMetadata): ClassDecorator {
  return (target) => {
    Object.defineProperty(target, PACK_METADATA, {
      value: meta,
      writable: false,
      enumerable: false,
      configurable: false,
    });
  };
}
