import type { Logger } from '../types/logging.js';
import { ConsoleLogger } from './ConsoleLogger.js';

let currentLogger: Logger = new ConsoleLogger();

export function setLogger(logger: Logger): void {
  currentLogger = logger;
}

export function getLogger(): Logger {
  return currentLogger;
}
