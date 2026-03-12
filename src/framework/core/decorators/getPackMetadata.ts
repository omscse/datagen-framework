import type { PackMetadata } from '../types/metadata.js';
import { PACK_METADATA } from './metadataKeys.js';

export function getPackMetadata(target: Function): PackMetadata | undefined {
  return (target as any)[PACK_METADATA] as PackMetadata | undefined;
}
