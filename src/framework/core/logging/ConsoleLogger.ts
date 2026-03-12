import type { Logger } from '../types/logging.js';

export class ConsoleLogger implements Logger {
  debug(message: string, meta?: unknown): void { console.debug(message, meta); }
  info(message: string, meta?: unknown): void { console.info(message, meta); }
  warn(message: string, meta?: unknown): void { console.warn(message, meta); }
  error(message: string, meta?: unknown): void { console.error(message, meta); }
}
