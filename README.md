# ReliefTrack — Blockchain Emergency Relief & Donation Tracking Platform

> **"Every donation has a journey. Track your emergency relief contribution in real time like an Amazon order delivery."**

ReliefTrack is a full-stack, production-ready Web3 & Fintech platform designed to solve charity opacity. Every donation receives a unique Donation Receipt ID (`DR-2026-8F72K9`), allowing donors to track funds from blockchain confirmation to NGO allocation, verified beneficiary delivery, and camera evidence.

---

## Key Features

1. **Donation Journey Tracking System (`/track/[receiptId]`)**
   - Human-friendly public tracking reference ID (`DR-2026-XXXXXX`).
   - Delivery-style 10-step progress timeline updated in real time via Supabase channels.
   - Transparent financial money breakdown (Allocated, Spent, Remaining).

2. **Privacy-Preserving Verification Vault**
   - Donors view anonymized badges: `BEN-72A91 — VERIFIED ✓`.
   - Raw identity cards (Aadhaar), disability certificates, and private hospital records remain encrypted in Supabase Storage.
   - Step-up security modal for Managers generates 15-minute signed URLs with audit logging.

3. **In-App Camera Evidence Capture**
   - High-trust evidence capture workflow with live camera view.
   - Calculates cryptographic SHA-256 file hashes and GPS hospital metadata.

4. **Multi-Chain Smart Contracts**
   - Solidity smart contract (`ReliefTracker.sol`) anchoring donation receipts, fund allocations, expense hashes, and evidence hashes.
   - Network adapters for **Ethereum Sepolia** and **Polygon Amoy**.

5. **Fraud & Anomaly Detection Engine**
   - Automated rules checking for duplicate document hashes, expense over-allocation, missing evidence, and unverified NGO transactions.

---

## Tech Stack

- **Frontend & App Framework**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Framer Motion
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS), Supabase Storage
- **Blockchain**: Solidity 0.8.24, Hardhat, Ethers v6, Viem
- **Testing**: Vitest, Hardhat Test Suite

---

## Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Database Migration & Seed
```bash
# Seed local / Supabase mock database
npm run db:seed
```

### 3. Compile Smart Contracts
```bash
npm run contract:compile
```

### 4. Start Next.js Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Interactive End-to-End Demo Scenario

Open `/track/DR-2026-8F72K9` to experience the complete demo journey:
- **Campaign**: Emergency Medical Relief Campaign 2026
- **Donation**: ₹10,000
- **Beneficiary**: `BEN-72A91` (Emergency Cardiac Surgery at XYZ Hospital, ₹78,500 estimate)
- **NGO**: Red Cross Relief India (`NGO-1042`)
- **Expenditures**: ₹6,500 Medical Treatment + ₹2,000 Medicines
- **Evidence**: `EVD-2026-72K9` (Camera verified with SHA-256 checksum)

---

## Documentation Directory

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) — System architecture & data flow diagrams
- [DATABASE.md](./docs/DATABASE.md) — PostgreSQL relational schema & RLS rules
- [API.md](./docs/API.md) — REST API endpoint specification
- [BLOCKCHAIN.md](./docs/BLOCKCHAIN.md) — Smart contracts & multi-chain adapters
- [SECURITY.md](./docs/SECURITY.md) — Privacy vault, threat modeling, & RLS policies
- [DEPLOYMENT.md](./docs/DEPLOYMENT.md) — One-click production deployment guide
- [DEMO.md](./docs/DEMO.md) — Step-by-step presentation script
- [ENVIRONMENT.md](./docs/ENVIRONMENT.md) — Environment variables configuration guide
- [CONTRIBUTING.md](./docs/CONTRIBUTING.md) — Code style and PR guidelines
