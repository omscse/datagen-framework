import * as http from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { getRegisteredPacks } from '../../core/registry/getRegisteredPacks.js';
import type { PackClass } from '../../core/types/pack.js';
import { initWebUiAdapter } from './initWebUiAdapter.js';
import { getUiHtml } from './uiTemplate.js';

export interface WebUiServerOptions {
  cacheFile?: string;
  port?: number;
}

export async function startWebUiServer(
  registry: Record<string, PackClass>,
  options: WebUiServerOptions = {},
): Promise<void> {
  const cacheFile = options.cacheFile ?? '.datagen/store.json';
  const port = options.port ?? 3456;
  const { generator } = initWebUiAdapter(registry, cacheFile);

  const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const method = req.method ?? 'GET';
    const rawUrl = req.url ?? '/';
    const url = new URL(rawUrl, `http://localhost:${port}`);
    const path = url.pathname;

    try {
      // GET / — serve UI
      if (method === 'GET' && path === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(getUiHtml());
        return;
      }

      // GET /api/packs — list packs with stored data status
      if (method === 'GET' && path === '/api/packs') {
        const packs = getRegisteredPacks(registry);
        const payload = await Promise.all(
          packs.map(async ({ registryKey, metadata }) => {
            const PackCtor = registry[registryKey];
            const instance = new PackCtor();
            let stored: unknown = null;
            if (await generator.hasStoredData(registryKey, { storeAs: registryKey })) {
              stored = await generator.getStoredRecord(registryKey, { storeAs: registryKey });
            }
            return {
              key: registryKey,
              name: metadata?.name ?? registryKey,
              description: metadata?.description ?? '',
              supportsCustom: typeof instance.createCustom === 'function',
              stored,
            };
          }),
        );
        sendJson(res, payload, 200, { 'X-Store-Path': cacheFile });
        return;
      }

      // POST /api/packs/:key/generate
      const genMatch = /^\/api\/packs\/([^/]+)\/generate$/.exec(path);
      if (method === 'POST' && genMatch) {
        const key = genMatch[1];
        if (!registry[key]) { sendJson(res, { error: `Pack not found: ${key}` }, 404); return; }

        const body = await readBody(req);
        const { custom, input } = JSON.parse(body || '{}') as { custom?: boolean; input?: unknown };

        // Clean up previously generated data before regenerating
        if (await generator.hasStoredData(key, { storeAs: key })) {
          const existing = await generator.getStoredRecord(key, { storeAs: key });
          await generator.cleanup(key as never, existing.data, { storeAs: key });
        }

        let data: unknown;
        if (custom && input !== undefined) {
          data = await generator.generateCustom(key as never, input as never, { storeAs: key });
        } else {
          data = await generator.generateDefault(key as never, { storeAs: key });
        }

        sendJson(res, { success: true, data });
        return;
      }

      // GET /api/packs/:key/download — stream stored data as a JSON file
      const dlMatch = /^\/api\/packs\/([^/]+)\/download$/.exec(path);
      if (method === 'GET' && dlMatch) {
        const key = dlMatch[1];
        if (!(await generator.hasStoredData(key, { storeAs: key }))) { sendJson(res, { error: 'No data stored for this pack' }, 404); return; }
        const record = await generator.getStoredRecord(key, { storeAs: key });
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${key}-data.json"`,
        });
        res.end(JSON.stringify(record.data, null, 2));
        return;
      }

      // DELETE /api/packs/:key — cleanup stored data for one pack
      const delMatch = /^\/api\/packs\/([^/]+)$/.exec(path);
      if (method === 'DELETE' && delMatch) {
        const key = delMatch[1];
        if (!registry[key]) { sendJson(res, { error: `Pack not found: ${key}` }, 404); return; }
        if (!(await generator.hasStoredData(key, { storeAs: key }))) { sendJson(res, { error: 'No data stored for this pack' }, 404); return; }

        const record = await generator.getStoredRecord(key, { storeAs: key });
        await generator.cleanup(key as never, record.data, { storeAs: key });
        sendJson(res, { success: true });
        return;
      }

      sendJson(res, { error: 'Not found' }, 404);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      sendJson(res, { error: message }, 500);
    }
  });

  await new Promise<void>((resolve) => {
    server.listen(port, () => {
      console.log(`\nData Generation UI  →  http://localhost:${port}`);
      console.log(`Store               →  ${cacheFile}\n`);
      resolve();
    });
  });

  // Keep process alive
  await new Promise<void>(() => { /* server runs until process exit */ });
}

function sendJson(res: ServerResponse, data: unknown, status = 200, extra: Record<string, string> = {}): void {
  res.writeHead(status, { 'Content-Type': 'application/json', ...extra });
  res.end(JSON.stringify(data));
}

async function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}
