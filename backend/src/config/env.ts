export const CONFIG = {
  isProduction: process.env.NODE_ENV === 'production',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  sepoliaRpcUrl: process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org',
  polygonAmoyRpcUrl: process.env.POLYGON_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology',
  contractAddressSepolia: process.env.NEXT_PUBLIC_RELIEF_TRACKER_ADDRESS || '0x1111111111111111111111111111111111111111',
  contractAddressAmoy: process.env.NEXT_PUBLIC_RELIEF_TRACKER_ADDRESS_AMOY || '0x2222222222222222222222222222222222222222',
};
