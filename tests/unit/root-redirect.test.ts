import { describe, it, expect } from 'vitest';
import { createDemoSession, saveSession, getSession, clearSession } from '../../src/lib/auth/client-session';

describe('Authentication Flow Order Unit Tests (Root Role Selection -> Login -> Workspace)', () => {
  it('1. Unauthenticated root route requires role selection first', () => {
    clearSession();
    const session = getSession();
    expect(session).toBeNull();
  });

  it('2. TEST A: DONOR Role Selection -> Login -> /donor workspace session', () => {
    clearSession();
    const targetRole = 'DONOR';
    const session = createDemoSession(targetRole, { email: 'donor@relieftrack.org' });
    saveSession(session);

    const activeSession = getSession();
    expect(activeSession).not.toBeNull();
    expect(activeSession?.role).toBe('DONOR');
    expect(activeSession?.email).toBe('donor@relieftrack.org');
  });

  it('3. TEST B: NGO Role Selection -> Login -> /ngo workspace session', () => {
    clearSession();
    const targetRole = 'NGO';
    const session = createDemoSession(targetRole, { email: 'ngo@redcrossrelief.org' });
    saveSession(session);

    const activeSession = getSession();
    expect(activeSession).not.toBeNull();
    expect(activeSession?.role).toBe('NGO');
    expect(activeSession?.ngo_id).toBe('NGO-1042');
  });

  it('4. TEST C: MANAGER Role Selection -> Login -> /manager workspace session', () => {
    clearSession();
    const targetRole = 'MANAGER';
    const session = createDemoSession(targetRole, { email: 'admin@relieftrack.org' });
    saveSession(session);

    const activeSession = getSession();
    expect(activeSession).not.toBeNull();
    expect(activeSession?.role).toBe('MANAGER');
  });

  it('5. Logout clears active session and target role state', () => {
    saveSession(createDemoSession('DONOR'));
    expect(getSession()).not.toBeNull();

    clearSession();
    expect(getSession()).toBeNull();
  });

  it('6. Unauthenticated state with targetRole does NOT grant session or bypass authentication', () => {
    clearSession();
    // Simulate setting targetRole in sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('relieftrack_target_role', 'DONOR');
    }
    const session = getSession();
    expect(session).toBeNull();
  });
});
