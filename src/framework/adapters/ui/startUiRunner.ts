import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import type { PackClass } from '../../core/types/pack.js';
import { initUiAdapter } from './initUiAdapter.js';
import { listPacks } from './packListController.js';

export async function startUiRunner(
  registry: Record<string, PackClass>,
  cacheFile = '.datagen-cache.json',
): Promise<void> {
  const { generator, cleanupManager } = initUiAdapter(registry, cacheFile);
  const rl = readline.createInterface({ input, output });

  console.log('\n=== Data Generation Framework ===\n');

  let running = true;
  while (running) {
    console.log('Menu:');
    console.log('  1. List packs');
    console.log('  2. Generate default data');
    console.log('  3. Generate custom data');
    console.log('  4. Cleanup all stored data');
    console.log('  5. Exit\n');

    const choice = (await rl.question('Select option: ')).trim();

    switch (choice) {
      case '1': {
        const packs = listPacks(registry);
        console.log('\nAvailable packs:');
        for (const { registryKey, metadata } of packs) {
          const PackCtor = registry[registryKey];
          const supportsCustom = PackCtor && new PackCtor().createCustom ? ' (supports custom)' : '';
          const name = metadata?.name ?? registryKey;
          const desc = metadata?.description ?? '(no description)';
          console.log(`  [${registryKey}] ${name} — ${desc}${supportsCustom}`);
        }
        console.log('');
        break;
      }

      case '2':
      case '3': {
        const isCustom = choice === '3';
        const packs = listPacks(registry);

        console.log('\nAvailable packs:');
        packs.forEach(({ registryKey, metadata }, i) => {
          console.log(`  ${i + 1}. [${registryKey}] ${metadata?.name ?? registryKey}`);
        });

        const sel = (await rl.question('Select pack number or key: ')).trim();
        const idx = Number(sel);
        const selected = isNaN(idx) ? sel : packs[idx - 1]?.registryKey;

        if (!selected || !registry[selected]) {
          console.log('Invalid selection.\n');
          break;
        }

        const storeAsRaw = (await rl.question('Store as key (leave blank to skip): ')).trim();
        const storeAs = storeAsRaw || undefined;

        try {
          let data: unknown;
          if (isCustom) {
            const rawInput = (await rl.question('Enter JSON input (e.g. {"role":"admin"}): ')).trim();
            let parsedInput: unknown;
            try {
              parsedInput = JSON.parse(rawInput || '{}');
            } catch {
              console.error('Invalid JSON.\n');
              break;
            }
            data = await generator.generateCustom(selected as never, parsedInput as never, { storeAs });
          } else {
            data = await generator.generateDefault(selected as never, { storeAs });
          }
          console.log('\nResult:');
          console.log(JSON.stringify(data, null, 2));
        } catch (err) {
          console.error('Error:', err instanceof Error ? err.message : String(err));
        }
        console.log('');
        break;
      }

      case '4': {
        const confirm = (await rl.question('Delete all stored data? (yes/no): ')).trim().toLowerCase();
        if (confirm === 'yes') {
          const report = await cleanupManager.cleanupAll();
          console.log(`\nCleanup complete: ${report.cleaned.length} cleaned, ${report.failed.length} failed`);
          if (report.failed.length > 0) {
            for (const f of report.failed) {
              console.error(`  FAILED: ${f.key} — ${f.reason}`);
            }
          }
        } else {
          console.log('Cancelled.');
        }
        console.log('');
        break;
      }

      case '5':
        running = false;
        break;

      default:
        console.log('Invalid option.\n');
    }
  }

  rl.close();
  console.log('\nGoodbye!');
}
