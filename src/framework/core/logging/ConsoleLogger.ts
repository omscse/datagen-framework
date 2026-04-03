import type { Logger } from '../types/logging.js';

export class ConsoleLogger implements Logger {
  debug(message: string, meta?: unknown): void { meta !== undefined ? console.debug(message, meta) : console.debug(message); }
  info(message: string, meta?: unknown): void { meta !== undefined ? console.info(message, meta) : console.info(message); }
  warn(message: string, meta?: unknown): void { meta !== undefined ? console.warn(message, meta) : console.warn(message); }
  error(message: string, meta?: unknown): void { meta !== undefined ? console.error(message, meta) : console.error(message); }
}
