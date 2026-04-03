import { initConfig } from '../config/initConfig.js';
import { setDbExecutor } from '../db/dbClient.js';

export function resetSupport(): void {
  initConfig({});
  setDbExecutor(async () => []);
}
