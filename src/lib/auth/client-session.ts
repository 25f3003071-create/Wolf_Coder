'use client';

import { UserRole } from '@/types';

const SESSION_KEY = 'relieftrack_session';
let memorySessionStore: string | null = null;

export interface ClientSession {
  token: string;
  role: UserRole;
  email: string;
  full_name: string;
  ngo_id?: string;
}

/** Development demo tokens — must match server-side test-token-* handling in auth.ts */
const DEMO_TOKENS: Record<UserRole, ClientSession> = {
  DONOR: {
    token: 'test-token-donor',
    role: 'DONOR',
    email: 'donor@relieftrack.org',
    full_name: 'Rahul Sharma',
  },
  NGO: {
    token: 'test-token-ngo',
    role: 'NGO',
    email: 'ngo@redcrossrelief.org',
    full_name: 'Red Cross Relief India',
    ngo_id: 'NGO-1042',
  },
  MANAGER: {
    token: 'test-token-manager',
    role: 'MANAGER',
    email: 'admin@relieftrack.org',
    full_name: 'Dr. Vikram Seth',
  },
};

export function createDemoSession(role: UserRole, overrides?: Partial<ClientSession>): ClientSession {
  return { ...DEMO_TOKENS[role], ...overrides };
}

export function saveSession(session: ClientSession): void {
  const json = JSON.stringify(session);
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, json);
    try {
      document.cookie = `${SESSION_KEY}=${encodeURIComponent(json)}; path=/; max-age=86400; SameSite=Lax`;
    } catch {}
  } else {
    memorySessionStore = json;
  }
}

export function getSession(): ClientSession | null {
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as ClientSession;
    } else {
      if (!memorySessionStore) return null;
      return JSON.parse(memorySessionStore) as ClientSession;
    }
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
    try {
      document.cookie = `${SESSION_KEY}=; path=/; max-age=0; SameSite=Lax`;
    } catch {}
  }
  memorySessionStore = null;
}

export function getAuthHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const session = getSession();
  const headers: Record<string, string> = { ...extra };
  const token = session?.token || (process.env.NODE_ENV !== 'production' ? 'test-token-donor' : '');
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }
  return headers;
}
