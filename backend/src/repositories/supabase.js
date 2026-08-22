const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

function getServiceSupabase() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase service role configuration is missing. Set SUPABASE_SERVICE_ROLE_KEY in .env.local');
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

module.exports = { supabase, getServiceSupabase, isSupabaseConfigured };
