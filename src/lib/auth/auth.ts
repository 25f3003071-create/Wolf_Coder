import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, isSupabaseConfigured } from '../db/supabase';
import { UserRole } from '@/types';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  ngo_id?: string;
  full_name: string;
}

/**
 * Server-side session authentication & RBAC role verification helper.
 * Resolves authenticated user & server-assigned role from database/session.
 * NEVER trusts client-submitted role fields in request bodies or query params.
 */
export async function getAuthenticatedUser(req: NextRequest): Promise<{
  user: AuthenticatedUser | null;
  error: string | null;
  status: number;
}> {
  // Check Authorization Bearer header or Session Token header
  const authHeader = req.headers.get('authorization') || req.headers.get('x-session-token');

  if (!authHeader) {
    return {
      user: null,
      error: 'UNAUTHENTICATED: Authentication token or session header is required.',
      status: 401,
    };
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const isProductionMode = process.env.NODE_ENV === 'production';

  // Live Supabase Auth Session Verification
  if (isSupabaseConfigured()) {
    try {
      const supabase = getServiceSupabase();
      const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !supabaseUser) {
        return {
          user: null,
          error: 'UNAUTHENTICATED: Invalid or expired Supabase authentication token.',
          status: 401,
        };
      }

      // Fetch server-assigned role from database users table
      const { data: dbUser } = await supabase
        .from('users')
        .select('id, email, full_name, role_id, roles(name)')
        .eq('id', supabaseUser.id)
        .single();

      const roleName = (dbUser?.roles as any)?.name || 'DONOR';

      return {
        user: {
          id: supabaseUser.id,
          email: supabaseUser.email || dbUser?.email || '',
          role: roleName as UserRole,
          full_name: dbUser?.full_name || 'Authenticated User',
        },
        error: null,
        status: 200,
      };
    } catch (e) {
      if (isProductionMode) {
        return {
          user: null,
          error: 'UNAUTHENTICATED: Supabase authentication service unavailable.',
          status: 401,
        };
      }
    }
  }

  // Development/Test Mode Tokens ONLY (Strictly REJECTED in Production)
  if (!isProductionMode && (token.startsWith('test-token-') || token.startsWith('demo-token-'))) {
    let resolvedRole: UserRole = 'DONOR';
    let userId = '11111111-1111-1111-1111-111111111111';
    let ngoId = 'NGO-1042';

    if (token.includes('manager') || token.includes('admin')) {
      resolvedRole = 'MANAGER';
      userId = '44444444-4444-4444-4444-444444444444';
    } else if (token.includes('ngo')) {
      resolvedRole = 'NGO';
      userId = '22222222-2222-2222-2222-222222222222';
    }

    return {
      user: {
        id: userId,
        email: `${resolvedRole.toLowerCase()}@relieftrack.org`,
        role: resolvedRole,
        ngo_id: ngoId,
        full_name: `Test ${resolvedRole} User`,
      },
      error: null,
      status: 200,
    };
  }

  return {
    user: null,
    error: isProductionMode
      ? 'UNAUTHENTICATED: Production mode requires valid Supabase Auth session token.'
      : 'UNAUTHENTICATED: Invalid authentication credentials.',
    status: 401,
  };
}

/**
 * Enforce RBAC role requirement on protected API endpoints
 */
export async function authorizeRole(
  req: NextRequest,
  allowedRoles: UserRole[]
): Promise<{
  user: AuthenticatedUser | null;
  errorResponse: NextResponse | null;
}> {
  const { user, error, status } = await getAuthenticatedUser(req);

  if (error || !user) {
    return {
      user: null,
      errorResponse: NextResponse.json({ error: error || 'UNAUTHENTICATED' }, { status }),
    };
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      user,
      errorResponse: NextResponse.json(
        {
          error: `UNAUTHORIZED: Role '${user.role}' is not permitted to perform this operation. Required: [${allowedRoles.join(
            ', '
          )}]`,
        },
        { status: 403 }
      ),
    };
  }

  return { user, errorResponse: null };
}

/**
 * Enforce NGO Organization Scoping (NGO user can only access own org; Manager has global access)
 */
export function authorizeNgoOrgAccess(
  user: AuthenticatedUser,
  targetNgoId: string
): NextResponse | null {
  if (user.role === 'MANAGER') return null; // Managers have cross-NGO audit authority

  if (user.role === 'NGO' && user.ngo_id === targetNgoId) return null; // Matches assigned NGO

  return NextResponse.json(
    {
      error: `UNAUTHORIZED: Organization isolation policy prevents NGO user from accessing data for '${targetNgoId}'.`,
    },
    { status: 403 }
  );
}
