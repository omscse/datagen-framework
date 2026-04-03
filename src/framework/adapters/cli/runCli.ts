import type { PackClass } from '../../core/types/pack.js';
import { listPacks } from '../ui/packListController.js';
import { initCliAdapter } from './initCliAdapter.js';
import { parseArgs } from './parseArgs.js';

export async function runCli(
  argv: string[],
  registry: Record<string, PackClass>,
  cacheFile = '.datagen-cache.json',
): Promise<void> {
  const [command, ...rest] = argv;
  const args = parseArgs(rest);

  if (!command || command === 'help' || args.help === true) {
    printHelp();
    return;
  }

  const { generator, cleanupManager } = initCliAdapter(registry, cacheFile);

  switch (command) {
    case 'list': {
      const packs = listPacks(registry);
      console.log('\nRegistered packs:');
      for (const { registryKey, metadata } of packs) {
        const name = metadata?.name ?? registryKey;
        const desc = metadata?.description ?? '(no description)';
        console.log(`  ${registryKey.padEnd(12)} ${name} — ${desc}`);
      }
      console.log('');
      break;
    }

    case 'generate': {
      const packName = typeof args.pack === 'string' ? args.pack : '';
      if (!packName) {
        console.error('Error: --pack=<name> is required for generate command');
        process.exit(1);
      }
      const storeAs = typeof args['store-as'] === 'string' ? args['store-as'] : undefined;

      if (args.custom === true) {
        const rawInput = typeof args.input === 'string' ? args.input : '{}';
        let input: unknown;
        try {
          input = JSON.parse(rawInput);
        } catch {
          console.error('Error: --input must be valid JSON');
          process.exit(1);
        }
        const data = await generator.generateCustom(packName as never, input as never, { storeAs });
        console.log(JSON.stringify(data, null, 2));
      } else {
        const data = await generator.generateDefault(packName as never, { storeAs });
        console.log(JSON.stringify(data, null, 2));
      }
      break;
    }

    case 'cleanup': {
      const report = await cleanupManager.cleanupAll();
      console.log(`Cleanup complete: ${report.cleaned.length} cleaned, ${report.failed.length} failed`);
      if (report.failed.length > 0) {
        for (const f of report.failed) {
          console.error(`  FAILED: ${f.key} — ${f.reason}`);
        }
        process.exit(1);
      }
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exit(1);
  }
}

function printHelp(): void {
  console.log(`
Usage: datagen <command> [options]

Commands:
  list                              List all registered packs
  generate --pack=<name>            Generate default data for a pack
  generate --pack=<name> --custom \\
           --input=<json>           Generate custom data for a pack
  cleanup                           Delete all stored generated data
  help                              Show this help message

Options:
  --store-as=<key>   Store result under this key for later retrieval
  --input=<json>     JSON input object for custom generation
`);
}
