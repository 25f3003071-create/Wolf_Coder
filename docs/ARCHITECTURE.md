# ReliefTrack Protocol — Technical Architecture & System Overview

ReliefTrack is an emergency relief donation tracking platform built with Next.js App Router, Supabase PostgreSQL, and Ethereum/Polygon smart contracts.

## System Components

### 1. Frontend Layer (`frontend/src/`)
- **UI Components** (`frontend/src/components/ui/`): Button, Card, Badge, Modal, Navbar, Footer, StatCard.
- **Domain Components**:
  - `donor/`: DonationTimeline, MoneyBreakdown.
  - `ngo/`: EvidenceCaptureModal (HTML5 device camera, canvas snapshot, Web Crypto API SHA-256).
  - `manager/`: VerificationVaultModal (Preserves beneficiary identity & medical confidentiality).
- **Pages & App Router** (`src/app/`): Dedicated role views (`/donor`, `/ngo`, `/manager`, `/track/[receiptId]`).

### 2. Backend Layer (`backend/src/`)
- **Services** (`backend/src/services/`): DatabaseRepository, InMemoryDatabase fallback, Supabase PostgreSQL client, Vault storage signed URL generator.
- **Auth & RBAC** (`backend/src/middleware/`, `backend/src/auth/`): Role authorization (`DONOR`, `NGO`, `MANAGER`), organization access isolation, Twilio SMS OTP provider abstraction.
- **Fraud Engine** (`backend/src/fraud/`): Rule-based anomaly engine checking duplicate document hashes, over-allocation ceilings, unverified NGO activity, and missing evidence.
- **Financial Safety** (`backend/src/validation/`): Server-side ceilings ensuring expenses never exceed allocations and allocations never exceed campaign pools.

### 3. Database Layer (`database/`)
- **Migrations** (`database/migrations/`): `001_initial_schema.sql`, `002_missing_tables.sql`.
- **Seed Data** (`database/seed/`): `seed.sql` containing core demo receipt `DR-2026-8F72K9`, beneficiary `BEN-72A91`, NGO `NGO-1042`, and allocations/expenses.
- **Schema Reference** (`database/schema/`): `schema.sql`.

### 4. Blockchain Layer (`blockchain/` & `contracts/`)
- **ReliefTracker Smart Contract** (`blockchain/contracts/ReliefTracker.sol`): Multi-chain Solidity 0.8.24 smart contract anchoring donation receipts, fund allocations, itemized expense hashes, and camera evidence checksums.
- **Hardhat Suite**: Unit tests (`blockchain/test/ReliefTracker.test.js`) and deployment scripts (`blockchain/scripts/deploy.js`).

### 5. Testing Layer (`tests/`)
- **Unit Tests** (`tests/unit/`): Auth, Financials, Fraud rules, Identifiers, Repository logic.
- **Integration Tests** (`tests/integration/`): API route flows & allocation ceiling enforcement.
- **End-to-End Tests** (`tests/e2e/`): End-to-end relief delivery pipeline.
