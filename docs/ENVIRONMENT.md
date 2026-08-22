# Environment Variables Guide — ReliefTrack

This guide outlines all environment variables required to run ReliefTrack across local development, staging, and production environments.

---

## Complete `.env` Reference

```bash
# Database & Supabase Configuration
DATABASE_URL=postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Client-Side Supabase Keys (Exposed to Browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Blockchain & Testnets RPC Endpoints
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology

# Deployed Smart Contract Addresses
NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS=0x1111111111111111111111111111111111111111
NEXT_PUBLIC_POLYGON_AMOY_CONTRACT_ADDRESS=0x2222222222222222222222222222222222222222

# Wallet Private Key for Smart Contract Deployment (DO NOT COMMIT)
DEPLOYER_PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
