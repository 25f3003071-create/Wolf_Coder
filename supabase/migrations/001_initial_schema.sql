-- ReliefTrack Database Schema Migration
-- Migration: 001_initial_schema.sql

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ROLES TABLE
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO roles (id, name, description) VALUES
(1, 'DONOR', 'Individual or organizational donor who contributes funds and tracks impact'),
(2, 'NGO', 'Non-governmental organization responsible for aid execution and reporting'),
(3, 'MANAGER', 'High-authority platform administrator and verification auditor')
ON CONFLICT (id) DO NOTHING;

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    role_id INT REFERENCES roles(id) DEFAULT 1,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    avatar_url TEXT,
    bio TEXT,
    organization_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. WALLETS TABLE
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    wallet_address VARCHAR(100) NOT NULL,
    chain VARCHAR(50) DEFAULT 'sepolia',
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, wallet_address, chain)
);

-- 5. NGOS TABLE
CREATE TABLE IF NOT EXISTS ngos (
    id VARCHAR(50) PRIMARY KEY, -- e.g. NGO-1042
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100) UNIQUE NOT NULL,
    verification_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, VERIFIED, REJECTED, SUSPENDED
    verified_at TIMESTAMPTZ,
    total_received NUMERIC(18, 2) DEFAULT 0.00,
    total_allocated NUMERIC(18, 2) DEFAULT 0.00,
    total_spent NUMERIC(18, 2) DEFAULT 0.00,
    remaining_balance NUMERIC(18, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS campaigns (
    id VARCHAR(50) PRIMARY KEY, -- e.g. CMP-2026-0192
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'Emergency Relief',
    target_amount NUMERIC(18, 2) NOT NULL,
    raised_amount NUMERIC(18, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, COMPLETED, PAUSED
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. BENEFICIARIES TABLE
CREATE TABLE IF NOT EXISTS beneficiaries (
    id VARCHAR(50) PRIMARY KEY, -- e.g. BEN-72A91
    ngo_id VARCHAR(50) REFERENCES ngos(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- MEDICAL, DISABILITY, DISASTER, OTHER
    aid_required TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, UNDER_REVIEW, VERIFIED, REJECTED, SUSPENDED
    hospital_name VARCHAR(255),
    treatment_type VARCHAR(255),
    estimated_cost NUMERIC(18, 2) DEFAULT 0.00,
    anonymized_summary TEXT,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. BENEFICIARY DOCUMENTS (RESTRICTED VAULT STORAGE)
CREATE TABLE IF NOT EXISTS beneficiary_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    beneficiary_id VARCHAR(50) REFERENCES beneficiaries(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL, -- Aadhaar, Medical Report, Disability Cert, Hospital Bill
    storage_path TEXT NOT NULL, -- Encrypted private Supabase Storage path
    file_hash VARCHAR(64) NOT NULL, -- SHA-256 hash for integrity
    is_sensitive BOOLEAN DEFAULT TRUE,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. VERIFICATION RECORDS TABLE
CREATE TABLE IF NOT EXISTS verification_records (
    id VARCHAR(50) PRIMARY KEY, -- e.g. VER-2026-9281
    entity_type VARCHAR(50) NOT NULL, -- BENEFICIARY, NGO, EXPENSE
    entity_id VARCHAR(50) NOT NULL,
    reviewer_id UUID REFERENCES users(id),
    status VARCHAR(50) NOT NULL, -- VERIFIED, REJECTED, MORE_INFO_REQUIRED
    notes TEXT,
    hospital_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. HOSPITAL VERIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS hospital_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    beneficiary_id VARCHAR(50) REFERENCES beneficiaries(id) ON DELETE CASCADE,
    hospital_name VARCHAR(255) NOT NULL,
    doctor_name VARCHAR(255),
    case_number VARCHAR(100),
    estimated_cost NUMERIC(18, 2) NOT NULL,
    verification_status VARCHAR(50) DEFAULT 'VERIFIED',
    notes TEXT,
    verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. DONATIONS TABLE
CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    campaign_id VARCHAR(50) REFERENCES campaigns(id) ON DELETE CASCADE,
    amount NUMERIC(18, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    chain VARCHAR(50) DEFAULT 'sepolia',
    wallet_address VARCHAR(100),
    tx_hash VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. DONATION RECEIPTS TABLE
CREATE TABLE IF NOT EXISTS donation_receipts (
    id VARCHAR(50) PRIMARY KEY, -- e.g. DR-2026-8F72K9
    donation_id UUID REFERENCES donations(id) ON DELETE CASCADE,
    donor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    campaign_id VARCHAR(50) REFERENCES campaigns(id),
    ngo_id VARCHAR(50) REFERENCES ngos(id),
    beneficiary_id VARCHAR(50) REFERENCES beneficiaries(id),
    amount NUMERIC(18, 2) NOT NULL,
    allocated_amount NUMERIC(18, 2) DEFAULT 0.00,
    spent_amount NUMERIC(18, 2) DEFAULT 0.00,
    remaining_amount NUMERIC(18, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'DONATION_CREATED',
    current_step INT DEFAULT 1,
    total_steps INT DEFAULT 10,
    blockchain_tx_hash VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. ALLOCATIONS TABLE
CREATE TABLE IF NOT EXISTS allocations (
    id VARCHAR(50) PRIMARY KEY, -- e.g. ALLOC-2026-91A7
    campaign_id VARCHAR(50) REFERENCES campaigns(id),
    ngo_id VARCHAR(50) REFERENCES ngos(id),
    beneficiary_id VARCHAR(50) REFERENCES beneficiaries(id),
    receipt_id VARCHAR(50) REFERENCES donation_receipts(id),
    amount NUMERIC(18, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'APPROVED', -- PROPOSED, APPROVED, DISBURSED, REJECTED
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ DEFAULT NOW(),
    tx_hash VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(50) PRIMARY KEY, -- e.g. EXP-2026-77A2
    allocation_id VARCHAR(50) REFERENCES allocations(id),
    ngo_id VARCHAR(50) REFERENCES ngos(id),
    beneficiary_id VARCHAR(50) REFERENCES beneficiaries(id),
    receipt_id VARCHAR(50) REFERENCES donation_receipts(id),
    amount NUMERIC(18, 2) NOT NULL,
    category VARCHAR(100) NOT NULL, -- Medical Treatment, Medicines, Logistics, Shelter
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'SUBMITTED', -- DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, FLAGGED
    receipt_storage_path TEXT,
    receipt_hash VARCHAR(64),
    submitted_by UUID REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. EVIDENCE TABLE
CREATE TABLE IF NOT EXISTS evidence (
    id VARCHAR(50) PRIMARY KEY, -- e.g. EVD-2026-72K9
    expense_id VARCHAR(50) REFERENCES expenses(id) ON DELETE CASCADE,
    beneficiary_id VARCHAR(50) REFERENCES beneficiaries(id),
    receipt_id VARCHAR(50) REFERENCES donation_receipts(id),
    ngo_id VARCHAR(50) REFERENCES ngos(id),
    storage_path TEXT NOT NULL,
    file_hash VARCHAR(64) NOT NULL,
    captured_via_camera BOOLEAN DEFAULT TRUE,
    uploader_id UUID REFERENCES users(id),
    location_meta JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. BLOCKCHAIN TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS blockchain_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chain VARCHAR(50) DEFAULT 'sepolia',
    network VARCHAR(50) DEFAULT 'Sepolia Testnet',
    tx_hash VARCHAR(100) UNIQUE NOT NULL,
    block_number BIGINT,
    contract_address VARCHAR(100),
    wallet_address VARCHAR(100),
    event_name VARCHAR(100),
    status VARCHAR(50) DEFAULT 'CONFIRMED', -- INITIATED, SUBMITTED, CONFIRMING, CONFIRMED, FAILED
    raw_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. AUDIT LOGS TABLE (APPEND ONLY)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- BENEFICIARY_VERIFIED, FUNDS_ALLOCATED, EXPENSE_SUBMITTED, etc.
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    ip_address VARCHAR(50),
    reasoning TEXT,
    blockchain_ref VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'INFO', -- INFO, SUCCESS, WARNING, ALERT
    is_read BOOLEAN DEFAULT FALSE,
    target_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. FRAUD FLAGS TABLE
CREATE TABLE IF NOT EXISTS fraud_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL, -- BENEFICIARY, NGO, EXPENSE, EVIDENCE
    entity_id VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL, -- LOW, MEDIUM, HIGH, CRITICAL
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, UNDER_INVESTIGATION, RESOLVED, DISMISSED
    reviewed_by UUID REFERENCES users(id),
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. SUPPORTED CHAINS TABLE
CREATE TABLE IF NOT EXISTS supported_chains (
    id SERIAL PRIMARY KEY,
    chain_id INT UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    network VARCHAR(50) NOT NULL,
    rpc_url TEXT NOT NULL,
    contract_address VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO supported_chains (chain_id, name, network, rpc_url, contract_address) VALUES
(11155111, 'Ethereum Sepolia', 'testnet', 'https://rpc.sepolia.org', '0x1111111111111111111111111111111111111111'),
(80002, 'Polygon Amoy', 'testnet', 'https://rpc-amoy.polygon.technology', '0x2222222222222222222222222222222222222222')
ON CONFLICT (chain_id) DO NOTHING;

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_donation_receipts_id ON donation_receipts(id);
CREATE INDEX IF NOT EXISTS idx_donations_donor ON donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_ngo ON beneficiaries(ngo_id);
CREATE INDEX IF NOT EXISTS idx_allocations_ngo ON allocations(ngo_id);
CREATE INDEX IF NOT EXISTS idx_expenses_allocation ON expenses(allocation_id);
CREATE INDEX IF NOT EXISTS idx_evidence_expense ON evidence(expense_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- COMPREHENSIVE ROW LEVEL SECURITY (RLS) POLICIES FOR ALL 23 TABLES
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ngos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ngo_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiary_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE blockchain_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE supported_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- 1. PUBLIC READ POLICIES (Public tracking & active campaign metadata)
CREATE POLICY public_donation_receipt_read ON donation_receipts FOR SELECT USING (true);
CREATE POLICY public_campaign_read ON campaigns FOR SELECT USING (true);
CREATE POLICY public_ngo_read ON ngos FOR SELECT USING (verification_status = 'VERIFIED');
CREATE POLICY public_beneficiary_anonymized_read ON beneficiaries FOR SELECT USING (status = 'VERIFIED');
CREATE POLICY public_supported_chains_read ON supported_chains FOR SELECT USING (true);

-- 2. DONOR ROLE POLICIES (Own donations & receipts)
CREATE POLICY donor_own_donations_read ON donations FOR SELECT USING (donor_id = auth.uid());
CREATE POLICY donor_own_notifications_read ON notifications FOR SELECT USING (user_id = auth.uid());

-- 3. NGO ROLE POLICIES (Assigned workspace scoping)
CREATE POLICY ngo_own_beneficiaries_read ON beneficiaries FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role_id IN (2, 3))
);
CREATE POLICY ngo_own_expenses_read ON expenses FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role_id IN (2, 3))
);
CREATE POLICY ngo_own_evidence_read ON evidence FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role_id IN (2, 3))
);

-- 4. MANAGER AUDITOR POLICIES (Platform-wide operational & vault access)
CREATE POLICY manager_all_users_read ON users FOR SELECT USING (true);
CREATE POLICY manager_beneficiary_documents_vault_policy ON beneficiary_documents 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role_id = 3 -- MANAGER
        ) OR uploaded_by = auth.uid()
    );
CREATE POLICY manager_audit_logs_read ON audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role_id = 3)
);
CREATE POLICY manager_fraud_flags_read ON fraud_flags FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role_id = 3)
);

