# ReliefTrack Database Assets

This directory contains PostgreSQL database migrations, schema definitions, and seed data scripts for ReliefTrack.

- `migrations/001_initial_schema.sql`: Primary database tables (roles, users, ngos, campaigns, beneficiaries, receipts).
- `migrations/002_missing_tables.sql`: Supplemental tables (ngo_members, system_settings, donation_status_events) & RLS policies.
- `seed/seed.sql`: Demo seed data including core receipt `DR-2026-8F72K9`, beneficiary `BEN-72A91`, and expenses.
- `schema/schema.sql`: Complete PostgreSQL schema reference.
