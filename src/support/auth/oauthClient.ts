import { getAccessToken } from './tokenProvider.js';

export async function getAuthorizationHeader(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return { Authorization: `Bearer ${token}` };
}
