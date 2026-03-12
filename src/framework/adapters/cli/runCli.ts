import { parseArgs } from './parseArgs.js';

export async function runCli(argv: string[]): Promise<void> {
  const args = parseArgs(argv);
  console.log('CLI adapter scaffold', args);
}
