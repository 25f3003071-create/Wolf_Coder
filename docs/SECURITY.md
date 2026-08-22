# ReliefTrack Security Architecture & Privacy Isolation

## 1. Confidential Verification Vault
- Identity cards (Aadhaar/PAN) and raw medical diagnosis reports are stored exclusively in an encrypted Supabase storage bucket (`vault/`).
- Access requires step-up authentication and is restricted to verified Manager Auditors.
- Generates 15-minute temporary signed URLs (`generateSignedVaultUrl`) with mandatory audit logging (`VAULT_ACCESS_ATTEMPT`).
- Donors see only anonymized badges (e.g. `BEN-72A91 — VERIFIED ✓`).

## 2. Server-Side Financial Safety Ceilings
- **Allocation Ceiling**: Total allocations cannot exceed campaign raised pool.
- **Expense Ceiling**: NGO expenses cannot exceed approved allocation balance.
- **Positive Amount Enforcement**: Prevents negative or zero-value transactions.

## 3. Production Persistence Fail-Safe
- In production mode (`NODE_ENV === 'production'`), silent memory fallback is disallowed.
- If live Supabase connection parameters are unconfigured, database methods throw explicit errors.

## 4. Key Management & Client Safety
- `SUPABASE_SERVICE_ROLE_KEY` and `DEPLOYER_PRIVATE_KEY` are strictly server-side variables and are never bundled into client JS code.
