# ReliefTrack REST API Documentation

Base URL: `http://localhost:5001/api`

## Authentication & OTP
- `POST /api/auth/otp` — Request mobile OTP dispatch.

## Donations & Receipts
- `POST /api/donations` — Create new donation receipt record.
- `GET /api/donations/:receiptId` — Fetch donation receipt details.

## Beneficiaries & NGO Management
- `POST /api/beneficiaries` — Register emergency beneficiary.
- `POST /api/beneficiaries/:id/verify` — Manager auditor verification of beneficiary.

## Fund Allocations
- `POST /api/allocations` — Approve campaign fund allocation to NGO & beneficiary.

## Expense Management
- `POST /api/expenses` — Record itemized expense incurred by NGO.

## Camera Evidence & Checksums
- `POST /api/evidence/capture` — Submit HTML5 camera image snapshot with Web Crypto SHA-256 hash and GPS metadata.

## Fraud Detection Engine
- `POST /api/fraud/evaluate` — Evaluate fraud rule engine against document hashes and ceilings.
- `POST /api/fraud/:id/resolve` — Resolve flagged anomaly item.

## Audit Logs
- `GET /api/audit` — Query immutable audit log entries.

## Donation Journey Tracking
- `GET /api/track/:receiptId` — Fetch dynamic 10-step progress timeline for receipt.
