-- ReliefTrack Demo Seed Data
-- Migration / Seed File: seed.sql

-- 1. USERS & PROFILES
INSERT INTO users (id, email, role_id, full_name, phone) VALUES
('11111111-1111-1111-1111-111111111111', 'donor@relieftrack.org', 1, 'Rahul Sharma', '+91 98765 43210'),
('22222222-2222-2222-2222-222222222222', 'ngo@redcrossrelief.org', 2, 'Priya Mehta (Red Cross India)', '+91 98111 22233'),
('33333333-3333-3333-3333-333333333333', 'ngo@carefoundation.org', 2, 'Anil Verma (Care Foundation)', '+91 98222 33344'),
('44444444-4444-4444-4444-444444444444', 'admin@relieftrack.org', 3, 'Dr. Vikram Seth (Platform Manager)', '+91 99999 00000')
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (user_id, avatar_url, bio, organization_name) VALUES
('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'Individual philanthropist passionate about emergency healthcare.', 'Self'),
('22222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'Lead Coordinator at Red Cross India Emergency Care.', 'Red Cross Relief India'),
('33333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150', 'Field Director at Care Foundation Emergency Relief.', 'Care Foundation'),
('44444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'Chief Verification Manager & Platform Auditor.', 'ReliefTrack Governance')
ON CONFLICT (user_id) DO NOTHING;

-- 2. NGOS
INSERT INTO ngos (id, user_id, name, registration_number, verification_status, verified_at, total_received, total_allocated, total_spent, remaining_balance) VALUES
('NGO-1042', '22222222-2222-2222-2222-222222222222', 'Red Cross Relief India', 'NGO-REG-2021-9981', 'VERIFIED', NOW() - INTERVAL '60 days', 1500000.00, 1100000.00, 940000.00, 560000.00),
('NGO-2088', '33333333-3333-3333-3333-333333333333', 'Care Foundation', 'NGO-REG-2022-4412', 'VERIFIED', NOW() - INTERVAL '30 days', 850000.00, 600000.00, 450000.00, 400000.00)
ON CONFLICT (id) DO NOTHING;

-- 3. CAMPAIGNS
INSERT INTO campaigns (id, title, description, category, target_amount, raised_amount, status) VALUES
('CMP-2026-0192', 'Emergency Medical Relief Campaign 2026', 'Immediate surgical assistance and critical medication for acute emergency victims in underserved regions.', 'Medical Emergency', 500000.00, 285000.00, 'ACTIVE'),
('CMP-2026-0411', 'Flood Disaster Reconstruction & Aid', 'Providing urgent shelter kits, clean water, and food rations for flood-affected families.', 'Disaster Relief', 1000000.00, 620000.00, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 4. BENEFICIARIES
INSERT INTO beneficiaries (id, ngo_id, category, aid_required, status, hospital_name, treatment_type, estimated_cost, anonymized_summary, verified_by, verified_at) VALUES
('BEN-72A91', 'NGO-1042', 'MEDICAL', 'Emergency Cardiac Bypass Surgery & Post-Op Intensive Care', 'VERIFIED', 'XYZ Super Specialty Hospital', 'Emergency Surgery', 78500.00, 'Emergency cardiac procedure for 48yo sole earner from rural district. Fully verified by hospital board.', '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '2 days'),
('BEN-48B12', 'NGO-1042', 'DISABILITY', 'Motorized Wheelchair & Vocational Rehabilitation', 'VERIFIED', 'City Rehabilitation Center', 'Prosthetic & Mobility Unit', 45000.00, 'Assistance for mobility restoration post-accident.', '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '5 days'),
('BEN-99C03', 'NGO-2088', 'DISASTER', 'Emergency Shelter Kit & Medical Ration Box', 'UNDER_REVIEW', 'District Disaster Care Unit', 'Trauma Assistance', 25000.00, 'Disaster relief for family displaced by flash floods.', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- 5. BENEFICIARY DOCUMENTS (SENSITIVE VAULT DATA)
INSERT INTO beneficiary_documents (id, beneficiary_id, document_type, storage_path, file_hash, is_sensitive, uploaded_by) VALUES
('a1b2c3d4-0001-0001-0001-000100010001', 'BEN-72A91', 'Aadhaar Identity Card', 'vault/ben-72a91/aadhaar_masked_encrypted.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', TRUE, '22222222-2222-2222-2222-222222222222'),
('a1b2c3d4-0001-0001-0001-000100010002', 'BEN-72A91', 'Hospital Emergency Admission & Cost Estimate', 'vault/ben-72a91/xyz_hospital_estimate.pdf', 'f4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', TRUE, '22222222-2222-2222-2222-222222222222')
ON CONFLICT (id) DO NOTHING;

-- 6. HOSPITAL VERIFICATIONS
INSERT INTO hospital_verifications (id, beneficiary_id, hospital_name, doctor_name, case_number, estimated_cost, verification_status, notes) VALUES
('b2c3d4e5-0002-0002-0002-000200020002', 'BEN-72A91', 'XYZ Super Specialty Hospital', 'Dr. Ramesh Kulkarni (Chief Surgeon)', 'HOSP-2026-88912', 78500.00, 'VERIFIED', 'Verified diagnosis of acute coronary occlusion requiring immediate intervention.')
ON CONFLICT (id) DO NOTHING;

-- 7. VERIFICATION RECORDS
INSERT INTO verification_records (id, entity_type, entity_id, reviewer_id, status, notes, hospital_verified) VALUES
('VER-2026-9281', 'BENEFICIARY', 'BEN-72A91', '44444444-4444-4444-4444-444444444444', 'VERIFIED', 'All hospital estimates, doctor credentials, and financial need verified against platform standards.', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 8. DONATIONS
INSERT INTO donations (id, donor_id, campaign_id, amount, currency, chain, wallet_address, tx_hash) VALUES
('d1e2f3a4-0003-0003-0003-000300030003', '11111111-1111-1111-1111-111111111111', 'CMP-2026-0192', 10000.00, 'INR', 'sepolia', '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', '0x8a7291bc44f128e932104975193a218f77361a90c4217734891a274191bc44f1')
ON CONFLICT (id) DO NOTHING;

-- 9. DONATION RECEIPT (DR-2026-8F72K9) - CORE DEMO RECEIPT
INSERT INTO donation_receipts (
    id, donation_id, donor_id, campaign_id, ngo_id, beneficiary_id, amount, allocated_amount, spent_amount, remaining_amount, status, current_step, total_steps, blockchain_tx_hash
) VALUES (
    'DR-2026-8F72K9',
    'd1e2f3a4-0003-0003-0003-000300030003',
    '11111111-1111-1111-1111-111111111111',
    'CMP-2026-0192',
    'NGO-1042',
    'BEN-72A91',
    10000.00,
    8500.00,
    8500.00,
    1500.00,
    'AID_DELIVERY',
    8,
    10,
    '0x8a7291bc44f128e932104975193a218f77361a90c4217734891a274191bc44f1'
) ON CONFLICT (id) DO NOTHING;

-- 10. ALLOCATIONS
INSERT INTO allocations (id, campaign_id, ngo_id, beneficiary_id, receipt_id, amount, status, approved_by, tx_hash) VALUES
('ALLOC-2026-91A7', 'CMP-2026-0192', 'NGO-1042', 'BEN-72A91', 'DR-2026-8F72K9', 8500.00, 'APPROVED', '44444444-4444-4444-4444-444444444444', '0x991823abf772183e910293a8172bc9102931bc77261a90c4217734891a274191')
ON CONFLICT (id) DO NOTHING;

-- 11. EXPENSES
INSERT INTO expenses (id, allocation_id, ngo_id, beneficiary_id, receipt_id, amount, category, description, status, receipt_storage_path, receipt_hash, submitted_by, reviewed_by, reviewed_at) VALUES
('EXP-2026-77A2', 'ALLOC-2026-91A7', 'NGO-1042', 'BEN-72A91', 'DR-2026-8F72K9', 6500.00, 'Medical Treatment', 'Surgical OT charges and physician fees at XYZ Hospital', 'APPROVED', 'receipts/xyz_surgery_receipt_6500.pdf', 'a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '1 day'),
('EXP-2026-77A3', 'ALLOC-2026-91A7', 'NGO-1042', 'BEN-72A91', 'DR-2026-8F72K9', 2000.00, 'Medicines', 'Post-operative cardiovascular medications and IV drips', 'APPROVED', 'receipts/xyz_pharmacy_receipt_2000.pdf', 'c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- 12. EVIDENCE (CAMERA CAPTURED WITH METADATA HASH)
INSERT INTO evidence (id, expense_id, beneficiary_id, receipt_id, ngo_id, storage_path, file_hash, captured_via_camera, uploader_id, location_meta) VALUES
('EVD-2026-72K9', 'EXP-2026-77A2', 'BEN-72A91', 'DR-2026-8F72K9', 'NGO-1042', 'evidence/ben-72a91_surgery_evidence.jpg', '7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c', TRUE, '22222222-2222-2222-2222-222222222222', '{"lat": 19.0760, "lng": 72.8777, "hospital": "XYZ Super Specialty Hospital", "timestamp": "2026-08-22T11:42:00Z"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 13. BLOCKCHAIN TRANSACTIONS
INSERT INTO blockchain_transactions (chain, network, tx_hash, block_number, contract_address, wallet_address, event_name, status, raw_data) VALUES
('sepolia', 'Ethereum Sepolia', '0x8a7291bc44f128e932104975193a218f77361a90c4217734891a274191bc44f1', 5849120, '0x1111111111111111111111111111111111111111', '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', 'DonationCreated', 'CONFIRMED', '{"receiptId": "DR-2026-8F72K9", "amount": 10000, "campaignId": "CMP-2026-0192"}'::jsonb),
('polygon', 'Polygon Amoy', '0x991823abf772183e910293a8172bc9102931bc77261a90c4217734891a274191', 1204918, '0x2222222222222222222222222222222222222222', '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', 'FundsAllocated', 'CONFIRMED', '{"allocationId": "ALLOC-2026-91A7", "amount": 8500, "ngoId": "NGO-1042"}'::jsonb)
ON CONFLICT (tx_hash) DO NOTHING;

-- 14. FRAUD FLAGS
INSERT INTO fraud_flags (entity_type, entity_id, severity, reason, status, resolution_notes) VALUES
('EXPENSE', 'EXP-TEST-999', 'MEDIUM', 'Expense amount ₹45,000 exceeds maximum single transaction threshold without prior multi-sig approval.', 'RESOLVED', 'Verified by manager. Additional hospital documentation was attached.')
ON CONFLICT DO NOTHING;

-- 15. AUDIT LOGS
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, reasoning, blockchain_ref) VALUES
('11111111-1111-1111-1111-111111111111', 'DONATION_CREATED', 'DONATION_RECEIPT', 'DR-2026-8F72K9', 'Donor initiated ₹10,000 contribution for Emergency Medical Relief', '0x8a7291bc44f128e932104975193a218f77361a90c4217734891a274191bc44f1'),
('44444444-4444-4444-4444-444444444444', 'BENEFICIARY_VERIFIED', 'BENEFICIARY', 'BEN-72A91', 'Manager verified hospital cardiac surgery estimate and credentials', 'VER-2026-9281'),
('44444444-4444-4444-4444-444444444444', 'FUNDS_ALLOCATED', 'ALLOCATION', 'ALLOC-2026-91A7', 'Approved ₹8,500 allocation from receipt DR-2026-8F72K9 to NGO-1042', '0x991823abf772183e910293a8172bc9102931bc77261a90c4217734891a274191'),
('22222222-2222-2222-2222-222222222222', 'EVIDENCE_SUBMITTED', 'EVIDENCE', 'EVD-2026-72K9', 'NGO uploaded camera-verified surgery evidence and receipt hash', 'EVD-2026-72K9');
