import { getAuthHeaders } from './client-session';

/**
 * Authenticated Client Fetch Utility wrapper.
 * Automatically injects Bearer authorization token headers from active ClientSession.
 */
export async function authFetch(url: string, init?: RequestInit): Promise<Response> {
  const headers = getAuthHeaders(
    (init?.headers as Record<string, string>) || { 'Content-Type': 'application/json' }
  );

  return fetch(url, {
    ...init,
    headers,
  });
}
