import type { CleanupReport } from '../types/cleanup.js';
import type { PackClass } from '../types/pack.js';
import type { DataStore } from '../types/store.js';
import { getLogger } from '../logging/loggerRegistry.js';

export class CleanupManager<TRegistry extends Record<string, PackClass>> {
  constructor(
    private readonly registry: TRegistry,
    private readonly store: DataStore,
  ) {}

  async cleanupAll(): Promise<CleanupReport> {
    const logger = getLogger();
    const report: CleanupReport = { cleaned: [], failed: [] };
    const records = (await this.store.list?.()) ?? [];

    for (const record of records) {
      try {
        const PackCtor = this.registry[record.packName as keyof TRegistry];
        if (!PackCtor) throw new Error(`Pack not found in registry: ${record.packName}`);
        const pack = new PackCtor();
        await pack.delete(record.data);
        await this.store.delete(record.key);
        report.cleaned.push(record.key);
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        logger.error(`Cleanup failed for ${record.key}`, reason);
        report.failed.push({ key: record.key, reason });
      }
    }

    return report;
  }
}
