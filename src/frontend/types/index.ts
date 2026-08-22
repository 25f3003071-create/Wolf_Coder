export type UserRole = 'DONOR' | 'NGO' | 'MANAGER';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  ngo_id?: string;
  created_at: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  category: string;
  target_amount: number;
  raised_amount: number;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
}

export interface Beneficiary {
  id: string;
  ngo_id: string;
  full_name?: string;
  mobile?: string;
  email?: string;
  age?: number;
  gender?: string;
  address?: string;
  city_district?: string;
  emergency_need?: string;
  family_members?: number;
  priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  requested_amount?: number;
  approved_amount: number;
  spent_amount: number;
  remaining_amount: number;
  aid_category?: string;
  description?: string;
  category: string;
  aid_required: string;
  status: 'REGISTERED' | 'APPROVED' | 'PARTIALLY_DISBURSED' | 'FULLY_DISBURSED' | 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
  hospital_name?: string;
  treatment_type?: string;
  estimated_cost: number;
  anonymized_summary?: string;
  created_at: string;
  updated_at?: string;
}

export interface BeneficiaryDocument {
  id: string;
  beneficiary_id: string;
  ngo_id: string;
  document_type: string;
  filename: string;
  mime_type: string;
  file_size: number;
  storage_path: string;
  uploaded_by: string;
  created_at: string;
}

export interface AidDisbursement {
  id: string;
  beneficiary_id: string;
  ngo_id: string;
  campaign_id?: string;
  amount: number;
  aid_type: string;
  payment_method: 'UPI' | 'Bank Transfer' | 'Cash' | 'Crypto' | string;
  payment_status: string;
  payment_reference: string;
  blockchain_tx_hash: string;
  blockchain_tx_status: string;
  payment_mode: string;
  notes?: string;
  receipt_document_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface DonationReceipt {
  id: string; // e.g. DR-2026-8F72K9
  donation_id: string;
  donor_id: string;
  campaign_id: string;
  campaign_title: string;
  ngo_id: string;
  ngo_name: string;
  beneficiary_id: string;
  beneficiary_badge: string;
  beneficiary_summary: string;
  amount: number;
  allocated_amount: number;
  spent_amount: number;
  remaining_amount: number;
  status: 'DONATION_CREATED' | 'BLOCKCHAIN_CONFIRMED' | 'FUNDS_ALLOCATED' | 'AID_DELIVERY' | 'COMPLETED';
  current_step: number;
  total_steps: number;
  blockchain_tx_hash: string;
  blockchain_tx_status?: string;
  payment_mode?: string;
  created_at: string;
  updated_at: string;
}

export interface Allocation {
  id: string;
  campaign_id: string;
  ngo_id: string;
  beneficiary_id: string;
  receipt_id: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approved_at: string;
  tx_hash?: string;
}

export interface Expense {
  id: string;
  allocation_id: string;
  ngo_id: string;
  beneficiary_id: string;
  receipt_id: string;
  amount: number;
  category: string;
  purpose: string;
  description: string;
  status: 'SUBMITTED' | 'APPROVED' | 'FLAGGED' | 'REJECTED';
  verificationState: string;
  evidenceId?: string;
  receipt_hash?: string;
  txHash?: string;
  created_at: string;
}

export interface Evidence {
  id: string;
  expense_id: string;
  beneficiary_id: string;
  receipt_id: string;
  ngo_id: string;
  storage_path: string;
  file_hash: string;
  captured_via_camera: boolean;
  location_meta?: {
    lat: number;
    lng: number;
    hospital?: string;
    timestamp?: string;
  };
  created_at: string;
}

export type FraudSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface FraudFlag {
  id: string;
  entity_type: 'BENEFICIARY' | 'NGO' | 'EXPENSE' | 'EVIDENCE';
  entity_id: string;
  severity: FraudSeverity;
  reason: string;
  status: 'OPEN' | 'UNDER_INVESTIGATION' | 'RESOLVED' | 'DISMISSED';
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  reasoning: string;
  blockchain_ref?: string;
  created_at: string;
}
