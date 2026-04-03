import { getConfig } from '../config/getConfig.js';
import { getAuthorizationHeader } from '../auth/oauthClient.js';
import { getLogger } from '../../framework/core/logging/loggerRegistry.js';

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const config = getConfig();
  const authHeaders = await getAuthorizationHeader();
  const logger = getLogger();
  const url = `${String(config.apiUrl ?? '')}${path}`;
  logger.info(`HTTP POST ${url}`);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`HTTP POST ${url} failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function apiDelete(path: string): Promise<void> {
  const config = getConfig();
  const authHeaders = await getAuthorizationHeader();
  const logger = getLogger();
  const url = `${String(config.apiUrl ?? '')}${path}`;
  logger.info(`HTTP DELETE ${url}`);

  const response = await fetch(url, {
    method: 'DELETE',
    headers: { ...authHeaders },
  });

  if (!response.ok) {
    throw new Error(`HTTP DELETE ${url} failed: ${response.status} ${response.statusText}`);
  }
}
