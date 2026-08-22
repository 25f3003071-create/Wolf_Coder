-- Migration: 002_missing_tables.sql
-- Adds tables referenced by RLS in 001_initial_schema.sql

CREATE TABLE IF NOT EXISTS ngo_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ngo_id VARCHAR(50) NOT NULL REFERENCES ngos(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'MEMBER',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(ngo_id, user_id)
);

CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO system_settings (key, value) VALUES
('platform_name', '"ReliefTrack"'::jsonb),
('default_currency', '"INR"'::jsonb),
('manager_review_expense_threshold', '50000'::jsonb)
ON CONFLICT (key) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_ngo_members_ngo ON ngo_members(ngo_id);
CREATE INDEX IF NOT EXISTS idx_ngo_members_user ON ngo_members(user_id);

-- Donation journey events for audit-driven timeline
CREATE TABLE IF NOT EXISTS donation_status_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_id VARCHAR(50) NOT NULL REFERENCES donation_receipts(id) ON DELETE CASCADE,
    step INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    actor_label VARCHAR(255),
    reference_id VARCHAR(100),
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_donation_status_events_receipt ON donation_status_events(receipt_id, step);

ALTER TABLE donation_status_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY public_donation_status_events_read ON donation_status_events
    FOR SELECT USING (true);
