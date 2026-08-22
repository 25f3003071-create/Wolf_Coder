# ReliefTrack — Environment Setup & Production Deployment Guide

## Prerequisites & Environment Configuration

Copy `.env.example` to `.env.local` and populate the appropriate environment variables:

```bash
# 1. Supabase PostgreSQL Database & Auth
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 2. Web3 Node Providers & Deployer Private Key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
DEPLOYER_PRIVATE_KEY=0x...your_deployer_private_key

# 3. Twilio Mobile SMS Gateway
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+12025550192
```

## Running the Application

### Development Server
```bash
npm run dev
# Opens at http://localhost:3000
```

### Production Build
```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm start
```

### Smart Contract Deployment
```bash
cd contracts
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js --network sepolia
```
