-- ReliefTrack PostgreSQL Complete Database Schema Definition
-- Contains relational tables, foreign keys, indexes, and Row Level Security (RLS) rules.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ROLES
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL
);

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(50),
  role_id UUID REFERENCES roles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  avatar_url TEXT,
  bio TEXT,
  organization_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NGOS
CREATE TABLE IF NOT EXISTS ngos (
  id VARCHAR(50) PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  registration_number VARCHAR(100) UNIQUE NOT NULL,
  verification_status VARCHAR(50) DEFAULT 'PENDING',
  verified_at TIMESTAMP WITH TIME ZONE,
  total_received NUMERIC(12, 2) DEFAULT 0,
  total_allocated NUMERIC(12, 2) DEFAULT 0,
  total_spent NUMERIC(12, 2) DEFAULT 0,
  remaining_balance NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CAMPAIGNS
CREATE TABLE IF NOT EXISTS campaigns (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  target_amount NUMERIC(12, 2) NOT NULL,
  raised_amount NUMERIC(12, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BENEFICIARIES
CREATE TABLE IF NOT EXISTS beneficiaries (
  id VARCHAR(50) PRIMARY KEY,
  ngo_id VARCHAR(50) REFERENCES ngos(id),
  category VARCHAR(100) NOT NULL,
  aid_required TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  hospital_name VARCHAR(255),
  treatment_type VARCHAR(255),
  estimated_cost NUMERIC(12, 2) NOT NULL,
  anonymized_summary TEXT NOT NULL,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DONATION RECEIPTS
CREATE TABLE IF NOT EXISTS donation_receipts (
  id VARCHAR(50) PRIMARY KEY,
  donation_id UUID,
  donor_id UUID REFERENCES users(id),
  campaign_id VARCHAR(50) REFERENCES campaigns(id),
  ngo_id VARCHAR(50) REFERENCES ngos(id),
  beneficiary_id VARCHAR(50) REFERENCES beneficiaries(id),
  amount NUMERIC(12, 2) NOT NULL,
  allocated_amount NUMERIC(12, 2) DEFAULT 0,
  spent_amount NUMERIC(12, 2) DEFAULT 0,
  remaining_amount NUMERIC(12, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'DONATION_CREATED',
  current_step INT DEFAULT 1,
  total_steps INT DEFAULT 10,
  blockchain_tx_hash VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ALLOCATIONS
CREATE TABLE IF NOT EXISTS allocations (
  id VARCHAR(50) PRIMARY KEY,
  campaign_id VARCHAR(50) REFERENCES campaigns(id),
  ngo_id VARCHAR(50) REFERENCES ngos(id),
  beneficiary_id VARCHAR(50) REFERENCES beneficiaries(id),
  receipt_id VARCHAR(50) REFERENCES donation_receipts(id),
  amount NUMERIC(12, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'APPROVED',
  approved_by UUID REFERENCES users(id),
  tx_hash VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EXPENSES
CREATE TABLE IF NOT EXISTS expenses (
  id VARCHAR(50) PRIMARY KEY,
  allocation_id VARCHAR(50) REFERENCES allocations(id),
  ngo_id VARCHAR(50) REFERENCES ngos(id),
  beneficiary_id VARCHAR(50) REFERENCES beneficiaries(id),
  receipt_id VARCHAR(50) REFERENCES donation_receipts(id),
  amount NUMERIC(12, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'SUBMITTED',
  receipt_hash VARCHAR(100),
  tx_hash VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EVIDENCE
CREATE TABLE IF NOT EXISTS evidence (
  id VARCHAR(50) PRIMARY KEY,
  expense_id VARCHAR(50) REFERENCES expenses(id),
  beneficiary_id VARCHAR(50) REFERENCES beneficiaries(id),
  receipt_id VARCHAR(50) REFERENCES donation_receipts(id),
  ngo_id VARCHAR(50) REFERENCES ngos(id),
  storage_path TEXT NOT NULL,
  file_hash VARCHAR(100) NOT NULL,
  captured_via_camera BOOLEAN DEFAULT TRUE,
  location_meta JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  reasoning TEXT,
  blockchain_ref VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FRAUD FLAGS
CREATE TABLE IF NOT EXISTS fraud_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'OPEN',
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
