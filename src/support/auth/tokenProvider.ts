import { getConfig } from '../config/getConfig.js';
import { getLogger } from '../../framework/core/logging/loggerRegistry.js';

export async function getAccessToken(): Promise<string> {
  const config = getConfig();
  const logger = getLogger();
  logger.debug('Generating access token');
  return String(config.mockAccessToken ?? 'mock-token');
}
