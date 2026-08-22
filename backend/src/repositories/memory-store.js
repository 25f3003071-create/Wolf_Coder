class InMemoryDatabase {
  constructor() {
    this.receipts = new Map();
    this.donations = new Map();
    this.beneficiaries = new Map();
    this.allocations = new Map();
    this.expenses = new Map();
    this.evidenceList = new Map();
    this.campaigns = new Map();
    this.ngos = new Map();
    this.seedDefaults();
  }

  seedDefaults() {
    this.campaigns.set('CMP-2026-0192', {
      id: 'CMP-2026-0192',
      title: 'Emergency Medical Relief Campaign 2026',
      description: 'Immediate surgical assistance and critical medication for acute emergency victims in underserved regions.',
      category: 'Medical Emergency',
      target_amount: 500000,
      raised_amount: 285000,
      status: 'ACTIVE',
    });

    this.ngos.set('NGO-1042', {
      id: 'NGO-1042',
      name: 'Red Cross Relief India',
      registration_number: 'NGO-REG-2021-9981',
      verification_status: 'VERIFIED',
      total_received: 1500000,
      total_allocated: 1100000,
      total_spent: 940000,
      remaining_balance: 560000,
    });

    this.beneficiaries.set('BEN-72A91', {
      id: 'BEN-72A91',
      ngo_id: 'NGO-1042',
      category: 'MEDICAL',
      aid_required: 'Emergency Cardiac Bypass Surgery & Intensive Care',
      status: 'VERIFIED',
      hospital_name: 'XYZ Super Specialty Hospital',
      treatment_type: 'Emergency Surgery',
      estimated_cost: 78500,
      anonymized_summary: 'Emergency cardiac procedure for 48yo sole earner from rural district.',
      created_at: '2026-08-20T10:00:00Z',
    });

    this.receipts.set('DR-2026-8F72K9', {
      id: 'DR-2026-8F72K9',
      donation_id: 'd1e2f3a4-0003-0003-0003-000300030003',
      donor_id: '11111111-1111-1111-1111-111111111111',
      campaign_id: 'CMP-2026-0192',
      campaign_title: 'Emergency Medical Relief Campaign 2026',
      ngo_id: 'NGO-1042',
      ngo_name: 'Red Cross Relief India',
      beneficiary_id: 'BEN-72A91',
      beneficiary_badge: 'BEN-72A91 — VERIFIED ✓',
      beneficiary_summary: 'Emergency Cardiac Surgery & Intensive Care',
      amount: 10000,
      allocated_amount: 8500,
      spent_amount: 8500,
      remaining_amount: 1500,
      status: 'AID_DELIVERY',
      current_step: 8,
      total_steps: 10,
      blockchain_tx_hash: '0x8a7291bc44f128e932104975193a218f77361a90c4217734891a274191bc44f1',
      created_at: '2026-08-22T10:21:00Z',
      updated_at: '2026-08-22T11:42:00Z',
    });

    this.allocations.set('ALLOC-2026-91A7', {
      id: 'ALLOC-2026-91A7',
      campaign_id: 'CMP-2026-0192',
      ngo_id: 'NGO-1042',
      beneficiary_id: 'BEN-72A91',
      receipt_id: 'DR-2026-8F72K9',
      amount: 8500,
      status: 'APPROVED',
      approved_at: '2026-08-22T11:18:00Z',
      tx_hash: '0x991823abf772183e910293a8172bc9102931bc77261a90c4217734891a274191',
    });

    this.expenses.set('EXP-2026-77A2', {
      id: 'EXP-2026-77A2',
      allocation_id: 'ALLOC-2026-91A7',
      ngo_id: 'NGO-1042',
      beneficiary_id: 'BEN-72A91',
      receipt_id: 'DR-2026-8F72K9',
      amount: 6500,
      category: 'Medical Treatment',
      purpose: 'Surgical OT Charges & Physician Fees',
      description: 'Surgical OT charges and physician fees at XYZ Hospital',
      status: 'APPROVED',
      date: '2026-08-22',
      verificationState: 'APPROVED ✓',
      evidenceId: 'EVD-2026-72K9',
      receipt_hash: 'a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8',
      txHash: '0x991823abf772183e910293a8172bc9102931bc77261a90c4217734891a274191',
      created_at: '2026-08-22T11:40:00Z',
    });

    this.expenses.set('EXP-2026-77A3', {
      id: 'EXP-2026-77A3',
      allocation_id: 'ALLOC-2026-91A7',
      ngo_id: 'NGO-1042',
      beneficiary_id: 'BEN-72A91',
      receipt_id: 'DR-2026-8F72K9',
      amount: 2000,
      category: 'Medicines',
      purpose: 'Cardiovascular Medications & IV Drips',
      description: 'Post-operative cardiovascular medications and IV drips',
      status: 'APPROVED',
      date: '2026-08-22',
      verificationState: 'APPROVED ✓',
      evidenceId: 'EVD-2026-72K9',
      receipt_hash: 'c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4',
      txHash: '0x991823abf772183e910293a8172bc9102931bc77261a90c4217734891a274191',
      created_at: '2026-08-22T11:41:00Z',
    });

    this.evidenceList.set('EVD-2026-72K9', {
      id: 'EVD-2026-72K9',
      expense_id: 'EXP-2026-77A2',
      beneficiary_id: 'BEN-72A91',
      receipt_id: 'DR-2026-8F72K9',
      ngo_id: 'NGO-1042',
      storage_path: 'evidence/ben-72a91_surgery_evidence.jpg',
      file_hash: '7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c',
      captured_via_camera: true,
      location_meta: {
        lat: 19.076,
        lng: 72.8777,
        hospital: 'XYZ Super Specialty Hospital',
        timestamp: '2026-08-22T11:42:00Z',
      },
      created_at: '2026-08-22T11:42:00Z',
    });
  }
}

const dbMemory = new InMemoryDatabase();
module.exports = { InMemoryDatabase, dbMemory };
