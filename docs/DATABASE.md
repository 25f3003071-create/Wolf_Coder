# ReliefTrack Database Schema & Persistence Architecture

ReliefTrack uses a dual-layer database architecture with Supabase PostgreSQL as primary storage and an in-memory repository fallback for development and isolated testing.

## Database Tables (`database/schema/schema.sql`)
1. `users` & `profiles`: Identity, contact details, and platform roles (`DONOR`, `NGO`, `MANAGER`).
2. `ngos`: NGO registration records, verification status, total received/allocated/spent balances.
3. `campaigns`: Disaster & medical relief campaigns with financial targets and raised pools.
4. `beneficiaries`: Anonymized aid requests, hospital treatment estimates, verification logs.
5. `donation_receipts`: Core tracking receipts (`DR-2026-XXXXXX`), status, and progress steps.
6. `allocations`: Manager-approved campaign fund distributions (`ALLOC-2026-XXXX`).
7. `expenses`: Itemized NGO expenditures (`EXP-2026-XXXX`) with receipt hashes.
8. `evidence`: In-app camera captures (`EVD-2026-XXXX`), SHA-256 hashes, and GPS location metadata.
9. `audit_logs`: Immutable audit entries detailing user actions, system events, and blockchain references.
10. `fraud_flags`: Anomaly detection flags, severity ratings (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), and resolution notes.

## Migrations & Seed Data
- `database/migrations/001_initial_schema.sql`
- `database/migrations/002_missing_tables.sql`
- `database/seed/seed.sql`
