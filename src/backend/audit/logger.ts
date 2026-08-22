import { getServiceSupabase, isSupabaseConfigured } from '../services/supabase';

export interface AuditLogEntryInput {
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  newState?: any;
  blockchainRef?: string;
  reasoning?: string;
}

export async function createAuditEntry(input: AuditLogEntryInput): Promise<void> {
  const isProduction = process.env.NODE_ENV === 'production';
  const entry = {
    user_id: input.userId || '11111111-1111-1111-1111-111111111111',
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId,
    reasoning: input.reasoning || `System action ${input.action} performed on ${input.entityType} ${input.entityId}`,
    blockchain_ref: input.blockchainRef || null,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = getServiceSupabase();
      const { error } = await supabase.from('audit_logs').insert([entry]);
      if (error) {
        if (isProduction) {
          console.error('CRITICAL: Audit log PostgreSQL write failed:', error.message);
        } else {
          console.warn('Audit log write fallback:', error.message);
        }
      }
    } catch (e: unknown) {
      if (isProduction) {
        console.error('CRITICAL: Audit log service error:', e);
      }
    }
  }
}
