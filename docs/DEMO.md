# End-to-End Demo Presentation Script — ReliefTrack

This demo scenario demonstrates the full lifecycle of a donation without requiring manual database editing.

---

## Storyline: Emergency Medical Relief for BEN-72A91

### 1. Donor Flow (Rahul Sharma)
1. Open homepage `/`.
2. Enter receipt ID `DR-2026-8F72K9` in tracking search box or click "VIEW DEMO JOURNEY".
3. View the Amazon/Flipkart-style 10-step progress timeline:
   - `✓ DONATION CREATED` (10:21 AM)
   - `✓ BLOCKCHAIN CONFIRMED` (10:22 AM - Sepolia block #5849120)
   - `✓ DONATION VERIFIED` (10:24 AM - VER-2026-9281)
   - `✓ NGO ASSIGNED` (10:29 AM - Red Cross India NGO-1042)
   - `✓ NGO RECEIVED FUNDS` (10:34 AM)
   - `✓ BENEFICIARY VERIFIED` (11:02 AM - BEN-72A91 Hospital Board)
   - `✓ FUNDS ALLOCATED` (11:18 AM - ALLOC-2026-91A7 ₹8,500)
   - `◉ AID DELIVERY` (11:42 AM - Surgical OT & Medicines)
4. Scroll down to view the itemized Money Breakdown:
   - **Total Donated**: ₹10,000
   - **Allocated**: ₹8,500
   - **Spent**: ₹8,500 (₹6,500 Surgery + ₹2,000 Medicines)
   - **Remaining Escrow**: ₹1,500

### 2. Donor Privacy Shield
- Donor sees: `BEN-72A91 — VERIFIED ✓` badge and anonymized summary ("Emergency cardiac procedure for 48yo sole earner").
- Raw Aadhaar cards and doctor certificates remain isolated.

### 3. NGO Operations Flow
1. Navigate to `/ngo`.
2. Click "In-App Camera Evidence" button.
3. Open live camera view, snap receipt photo, and view instant SHA-256 hash calculation (`7b8c9d0e...`).

### 4. Manager & Verification Vault Flow
1. Navigate to `/manager`.
2. Click "Open Verification Vault" or visit `/manager/verification-vault`.
3. Locate beneficiary `BEN-72A91` and click "VIEW VERIFICATION DETAILS".
4. View signed URL generation modal, audit log recording notice, and encrypted file access.
