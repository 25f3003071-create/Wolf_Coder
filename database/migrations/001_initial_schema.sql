-- Initial database schema for ReliefTrack PostgreSQL
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO roles (name) VALUES ('DONOR'), ('NGO'), ('MANAGER') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role_id UUID REFERENCES roles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS donation_receipts (
  id VARCHAR(50) PRIMARY KEY,
  donation_id UUID,
  donor_id UUID REFERENCES users(id),
  campaign_id VARCHAR(50),
  campaign_title VARCHAR(255),
  ngo_id VARCHAR(50),
  ngo_name VARCHAR(255),
  beneficiary_id VARCHAR(50),
  beneficiary_badge VARCHAR(255),
  beneficiary_summary TEXT,
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
