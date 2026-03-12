import { getConfig } from '../config/getConfig.js';
import { getAuthorizationHeader } from '../auth/oauthClient.js';
import { getLogger } from '../../framework/core/logging/loggerRegistry.js';

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const config = getConfig();
  const headers = await getAuthorizationHeader();
  const logger = getLogger();
  logger.info(`HTTP POST ${String(config.apiUrl ?? '')}${path}`, body);
  void headers;
  return body as T;
}

export async function apiDelete(path: string): Promise<void> {
  const config = getConfig();
  const logger = getLogger();
  logger.info(`HTTP DELETE ${String(config.apiUrl ?? '')}${path}`);
}
