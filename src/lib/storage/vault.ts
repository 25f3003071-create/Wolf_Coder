import { getServiceSupabase, isSupabaseConfigured } from '../db/supabase';
import { UserRole } from '@/types';

export async function generateSignedVaultUrl(
  bucket: string,
  path: string,
  requesterRole?: UserRole
): Promise<{ url: string | null; error: string | null }> {
  // Step-up RBAC security check: Manager role ONLY
  if (requesterRole !== 'MANAGER') {
    return {
      url: null,
      error: 'UNAUTHORIZED: Access to encrypted Verification Vault is strictly restricted to Manager Auditors.',
    };
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = getServiceSupabase();
      const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 900); // 15 min expiry
      if (error) {
        return { url: null, error: `Vault storage access error: ${error.message}` };
      }
      return { url: data.signedUrl, error: null };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Storage service error';
      return { url: null, error: msg };
    }
  }

  // Development demo mode fallback signed URL
  const demoUrl = `https://vault.relieftrack.org/signed-url/dev-session?file=${encodeURIComponent(path)}&expires=${Date.now() + 900000}`;
  return { url: demoUrl, error: null };
}
