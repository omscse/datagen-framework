import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CleanupManager } from '../../../../src/framework/core/cleanup/CleanupManager.js';
import { InMemoryDataStore } from '../../../../src/framework/core/store/InMemoryDataStore.js';
import { Pack } from '../../../../src/framework/core/decorators/Pack.js';
import type { DataGenerationPack } from '../../../../src/framework/core/types/pack.js';

@Pack({ name: 'WidgetPack', description: 'Creates widgets' })
class WidgetPack implements DataGenerationPack<{ widgetId: string }> {
  async createDefault() { return { widgetId: 'w1' }; }
  async delete(_data: { widgetId: string }) {}
}

@Pack({ name: 'BrokenPack', description: 'Always fails on delete' })
class BrokenPack implements DataGenerationPack<{ id: string }> {
  async createDefault() { return { id: 'b1' }; }
  async delete(_data: { id: string }) {
    throw new Error('delete failed');
  }
}

const registry = { WidgetPack, BrokenPack } as const;

describe('CleanupManager', () => {
  let store: InMemoryDataStore;
  let manager: CleanupManager<typeof registry>;

  beforeEach(() => {
    store = new InMemoryDataStore();
    manager = new CleanupManager(registry, store);
  });

  it('returns empty report when there is nothing to clean up', async () => {
    const report = await manager.cleanupAll();
    expect(report.cleaned).toHaveLength(0);
    expect(report.failed).toHaveLength(0);
  });

  it('cleans up stored records and reports them as cleaned', async () => {
    store.save('widget-1', { packName: 'WidgetPack', data: { widgetId: 'w1' }, createdAt: new Date().toISOString() });
    store.save('widget-2', { packName: 'WidgetPack', data: { widgetId: 'w2' }, createdAt: new Date().toISOString() });

    const report = await manager.cleanupAll();

    expect(report.cleaned).toEqual(expect.arrayContaining(['widget-1', 'widget-2']));
    expect(report.failed).toHaveLength(0);
    expect(store.list()).toHaveLength(0);
  });

  it('records a failure when pack.delete throws', async () => {
    store.save('broken-1', { packName: 'BrokenPack', data: { id: 'b1' }, createdAt: new Date().toISOString() });

    const report = await manager.cleanupAll();

    expect(report.failed).toHaveLength(1);
    expect(report.failed[0].key).toBe('broken-1');
    expect(report.failed[0].reason).toContain('delete failed');
    expect(report.cleaned).toHaveLength(0);
  });

  it('records a failure when pack is not found in registry', async () => {
    store.save('ghost-1', { packName: 'GhostPack', data: {}, createdAt: new Date().toISOString() });

    const report = await manager.cleanupAll();

    expect(report.failed).toHaveLength(1);
    expect(report.failed[0].key).toBe('ghost-1');
    expect(report.failed[0].reason).toContain('GhostPack');
  });

  it('continues cleanup even when one record fails', async () => {
    store.save('broken-1', { packName: 'BrokenPack', data: { id: 'b1' }, createdAt: new Date().toISOString() });
    store.save('widget-1', { packName: 'WidgetPack', data: { widgetId: 'w1' }, createdAt: new Date().toISOString() });

    const report = await manager.cleanupAll();

    expect(report.cleaned).toContain('widget-1');
    expect(report.failed).toHaveLength(1);
    expect(report.failed[0].key).toBe('broken-1');
  });
});
