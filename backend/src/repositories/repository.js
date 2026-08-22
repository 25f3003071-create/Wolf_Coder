const { getServiceSupabase, isSupabaseConfigured } = require('./supabase');
const { dbMemory } = require('./memory-store');

function generateDonationReceiptId() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomStr = '';
  for (let i = 0; i < 6; i++) randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  return `DR-2026-${randomStr}`;
}

function generateBeneficiaryId() {
  const chars = '0123456789ABCDEF';
  let randomStr = '';
  for (let i = 0; i < 5; i++) randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  return `BEN-${randomStr}`;
}

function generateAllocationId() {
  const chars = '0123456789ABCDEF';
  let randomStr = '';
  for (let i = 0; i < 4; i++) randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  return `ALLOC-2026-${randomStr}`;
}

function generateExpenseId() {
  const chars = '0123456789ABCDEF';
  let randomStr = '';
  for (let i = 0; i < 4; i++) randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  return `EXP-2026-${randomStr}`;
}

function generateEvidenceId() {
  const chars = '0123456789ABCDEF';
  let randomStr = '';
  for (let i = 0; i < 4; i++) randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  return `EVD-2026-${randomStr}`;
}

class DatabaseRepository {
  static async createDonation(input) {
    if (!input.amount || typeof input.amount !== 'number' || input.amount <= 0) {
      throw new Error('Valid positive donation amount is required');
    }

    const receiptId = generateDonationReceiptId();
    const isRealOnChain = Boolean(input.realTxHash);
    const txHash = input.realTxHash || `SIMULATED-0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`;
    const txStatus = isRealOnChain ? 'CONFIRMED_ON_CHAIN' : 'SIMULATED_TRANSACTION';
    const now = new Date().toISOString();

    const allocatedAmount = Number((input.amount * 0.85).toFixed(2));

    const receiptData = {
      id: receiptId,
      donation_id: `d-${Date.now()}`,
      donor_id: input.donorId || '11111111-1111-1111-1111-111111111111',
      campaign_id: input.campaignId || 'CMP-2026-0192',
      campaign_title: input.campaignId === 'CMP-2026-0411' ? 'Flood Disaster Reconstruction & Aid' : 'Emergency Medical Relief Campaign 2026',
      ngo_id: 'NGO-1042',
      ngo_name: 'Red Cross Relief India',
      beneficiary_id: 'BEN-72A91',
      beneficiary_badge: 'BEN-72A91 — VERIFIED ✓',
      beneficiary_summary: 'Emergency Cardiac Surgery & Intensive Care',
      amount: Number(input.amount),
      allocated_amount: allocatedAmount,
      spent_amount: 0,
      remaining_amount: input.amount,
      status: 'DONATION_CREATED',
      current_step: 1,
      total_steps: 10,
      blockchain_tx_hash: txHash,
      blockchain_tx_status: txStatus,
      payment_mode: 'DEVELOPMENT_SIMULATION',
      created_at: now,
      updated_at: now,
    };

    const isProductionMode = process.env.NODE_ENV === 'production';

    if (isSupabaseConfigured()) {
      const supabase = getServiceSupabase();
      const { error } = await supabase.from('donation_receipts').insert([receiptData]);
      if (error) {
        if (isProductionMode) {
          throw new Error(`DATABASE PERSISTENCE ERROR: ${error.message}`);
        }
        dbMemory.receipts.set(receiptId, receiptData);
      }
    } else {
      if (isProductionMode) {
        throw new Error('DATABASE CONFIGURATION ERROR: Supabase production database is unconfigured.');
      }
      dbMemory.receipts.set(receiptId, receiptData);
    }

    return receiptData;
  }

  static async getDonationReceipt(receiptId) {
    let receipt = dbMemory.receipts.get(receiptId.toUpperCase());

    if (!receipt && isSupabaseConfigured()) {
      try {
        const supabase = getServiceSupabase();
        const { data } = await supabase.from('donation_receipts').select('*').eq('id', receiptId.toUpperCase()).single();
        if (data) receipt = data;
      } catch (e) {}
    }

    if (!receipt) {
      receipt = {
        id: receiptId,
        donation_id: `d-${Date.now()}`,
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
        blockchain_tx_hash: 'SIMULATED-0x8a7291bc44f128e932104975193a218f77361a90c4217734891a274191bc44f1',
        blockchain_tx_status: 'SIMULATED_TRANSACTION',
        payment_mode: 'DEVELOPMENT_SIMULATION',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      dbMemory.receipts.set(receiptId, receipt);
    }

    const timeline = [
      {
        step: 1,
        title: 'DONATION CREATED',
        status: 'COMPLETED',
        timestamp: receipt.created_at,
        actor: 'Donor (Rahul Sharma)',
        reference: 'Receipt Generated',
        details: `Donation of ₹${receipt.amount} received for Emergency Medical Relief.`,
      },
      {
        step: 2,
        title: 'BLOCKCHAIN ANCHORED',
        status: receipt.current_step >= 2 ? 'COMPLETED' : 'PENDING',
        timestamp: receipt.created_at,
        actor: 'Ethereum Sepolia Protocol',
        reference: receipt.blockchain_tx_hash ? `${receipt.blockchain_tx_hash.substring(0, 14)}...` : 'SIMULATED-0x8a72...',
        details: 'Donation receipt anchored to Ethereum Sepolia multi-chain smart contract.',
      },
      {
        step: 3,
        title: 'DONATION VERIFIED',
        status: receipt.current_step >= 3 ? 'COMPLETED' : 'PENDING',
        timestamp: receipt.created_at,
        actor: 'Manager (Dr. Vikram Seth)',
        reference: 'VER-2026-9281',
        details: 'Platform verification auditor confirmed transaction legitimacy.',
      },
      {
        step: 4,
        title: 'NGO ASSIGNED',
        status: receipt.current_step >= 4 ? 'COMPLETED' : 'PENDING',
        timestamp: receipt.created_at,
        actor: 'ReliefTrack System',
        reference: receipt.ngo_id || 'NGO-1042',
        details: `Assigned to ${receipt.ngo_name || 'Red Cross Relief India'} for field execution.`,
      },
      {
        step: 5,
        title: 'NGO RECEIVED FUNDS',
        status: receipt.current_step >= 5 ? 'COMPLETED' : 'PENDING',
        timestamp: receipt.created_at,
        actor: receipt.ngo_name || 'Red Cross Relief India',
        reference: 'BANK-TR-99120',
        details: 'NGO treasury confirmed receipt of campaign pool distribution.',
      },
      {
        step: 6,
        title: 'BENEFICIARY VERIFIED',
        status: receipt.current_step >= 6 ? 'COMPLETED' : 'PENDING',
        timestamp: receipt.created_at,
        actor: 'XYZ Hospital Board',
        reference: receipt.beneficiary_id || 'BEN-72A91',
        details: 'Beneficiary medical eligibility and emergency surgery estimate verified.',
      },
      {
        step: 7,
        title: 'FUNDS ALLOCATED',
        status: receipt.current_step >= 7 ? 'COMPLETED' : 'PENDING',
        timestamp: receipt.created_at,
        actor: 'Manager Auditor',
        reference: 'ALLOC-2026-91A7',
        details: `₹${receipt.allocated_amount} allocated specifically to beneficiary ${receipt.beneficiary_id || 'BEN-72A91'}.`,
      },
      {
        step: 8,
        title: 'AID DELIVERY',
        status: receipt.current_step === 8 ? 'IN_PROGRESS' : receipt.current_step > 8 ? 'COMPLETED' : 'PENDING',
        timestamp: receipt.updated_at,
        actor: 'Field Operations Unit',
        reference: 'EXP-2026-77A2',
        details: 'Emergency surgery performed. Medical expenses incurred and recorded.',
      },
      {
        step: 9,
        title: 'EVIDENCE SUBMITTED',
        status: receipt.current_step >= 9 ? 'COMPLETED' : 'PENDING',
        timestamp: receipt.current_step >= 9 ? receipt.updated_at : 'Pending Review',
        actor: 'NGO Field Officer',
        reference: 'EVD-2026-72K9',
        details: 'Camera-verified hospital receipts and post-op care photos uploaded.',
      },
      {
        step: 10,
        title: 'FINAL REPORT',
        status: receipt.current_step === 10 ? 'COMPLETED' : 'PENDING',
        timestamp: 'Pending',
        actor: 'Platform Auditor',
        reference: 'RPT-2026-FINAL',
        details: 'Final impact breakdown and audited reconciliation report.',
      },
    ];

    const matchingExpenses = Array.from(dbMemory.expenses.values()).filter(
      (e) => e.receipt_id === receiptId || e.receipt_id === 'DR-2026-8F72K9'
    );

    return {
      receipt,
      timeline,
      expenses: matchingExpenses.length > 0 ? matchingExpenses : Array.from(dbMemory.expenses.values()),
    };
  }

  static async createBeneficiary(input) {
    const aidReq = input.emergencyNeed || input.aidRequired;
    if (!aidReq || aidReq.trim().length === 0) {
      throw new Error('Required aid description is mandatory');
    }
    const cost = Number(input.requestedAmount || input.estimatedCost || 0);
    if (!cost || cost <= 0) {
      throw new Error('Valid positive estimated cost is required');
    }

    const benId = generateBeneficiaryId();
    const now = new Date().toISOString();
    const approvedAmt = input.approvedAmount !== undefined ? Number(input.approvedAmount) : 0;
    const initialStatus = approvedAmt > 0 ? 'APPROVED' : 'PENDING';

    const beneficiary = {
      id: benId,
      ngo_id: input.ngoId || 'NGO-1042',
      full_name: input.fullName || 'Anonymous Beneficiary',
      mobile: input.mobile || '',
      email: input.email || '',
      age: Number(input.age || 0),
      gender: input.gender || 'Unspecified',
      address: input.address || '',
      city_district: input.cityDistrict || '',
      emergency_need: aidReq,
      family_members: Number(input.familyMembers || 1),
      priority: input.priority || 'MEDIUM',
      requested_amount: cost,
      approved_amount: approvedAmt,
      spent_amount: 0,
      remaining_amount: approvedAmt,
      aid_category: input.aidCategory || input.category || 'Medical',
      description: input.description || input.anonymizedSummary || aidReq,
      category: (input.aidCategory || input.category || 'MEDICAL').toUpperCase(),
      aid_required: aidReq,
      status: initialStatus,
      hospital_name: input.hospitalName || 'General Hospital',
      treatment_type: input.treatmentType || 'Emergency Aid',
      estimated_cost: cost,
      anonymized_summary: input.anonymizedSummary || aidReq,
      created_at: now,
      updated_at: now,
    };

    dbMemory.beneficiaries.set(benId, beneficiary);
    return { beneficiary, fraudFlags: [] };
  }

  static async getBeneficiaries(ngoId) {
    let allBeneficiaries = Array.from(dbMemory.beneficiaries.values());
    const filtered = ngoId ? allBeneficiaries.filter((b) => b.ngo_id === ngoId) : allBeneficiaries;

    const summary = {
      totalBeneficiaries: filtered.length,
      totalApproved: filtered.reduce((sum, b) => sum + (b.approved_amount || b.estimated_cost || 0), 0),
      totalDisbursed: filtered.reduce((sum, b) => sum + (b.spent_amount || 0), 0),
      totalRemaining: filtered.reduce((sum, b) => sum + (b.remaining_amount || 0), 0),
    };

    return { success: true, beneficiaries: filtered, summary };
  }

  static async getBeneficiaryById(id) {
    const beneficiary = dbMemory.beneficiaries.get(id);
    if (!beneficiary) {
      throw new Error(`Beneficiary with ID '${id}' not found.`);
    }

    const documents = Array.from((dbMemory.beneficiaryDocuments || new Map()).values()).filter(
      (d) => d.beneficiary_id === id
    );
    const disbursements = Array.from((dbMemory.aidDisbursements || new Map()).values()).filter(
      (d) => d.beneficiary_id === id
    );

    return { beneficiary, documents, disbursements };
  }

  static async updateBeneficiary(id, updates) {
    let beneficiary = dbMemory.beneficiaries.get(id);
    if (!beneficiary) {
      throw new Error(`Beneficiary '${id}' not found`);
    }

    const updated = {
      ...beneficiary,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    dbMemory.beneficiaries.set(id, updated);
    return updated;
  }

  static async uploadBeneficiaryDocument(input) {
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const allowedExts = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = input.filename.substring(input.filename.lastIndexOf('.')).toLowerCase();

    if (!allowedMimeTypes.includes((input.mimeType || '').toLowerCase()) && !allowedExts.includes(ext)) {
      throw new Error('INVALID FILE TYPE: Allowed file types are PDF, JPG, JPEG, and PNG.');
    }

    if (input.fileSize > 10 * 1024 * 1024) {
      throw new Error('FILE SIZE EXCEEDED: File size cannot exceed 10 MB.');
    }

    const docId = `DOC-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();

    const document = {
      id: docId,
      beneficiary_id: input.beneficiaryId,
      ngo_id: input.ngoId,
      document_type: input.documentType || 'Eligibility Document',
      filename: input.filename,
      mime_type: input.mimeType,
      file_size: input.fileSize,
      storage_path: input.storagePath || `documents/${docId.toLowerCase()}_${input.filename}`,
      uploaded_by: input.uploadedBy || 'NGO Field Representative',
      created_at: now,
    };

    if (!dbMemory.beneficiaryDocuments) dbMemory.beneficiaryDocuments = new Map();
    dbMemory.beneficiaryDocuments.set(docId, document);
    return document;
  }

  static async getBeneficiaryDocuments(beneficiaryId) {
    if (!dbMemory.beneficiaryDocuments) return [];
    return Array.from(dbMemory.beneficiaryDocuments.values()).filter(
      (d) => d.beneficiary_id === beneficiaryId
    );
  }

  static async deleteBeneficiaryDocument(documentId) {
    if (!dbMemory.beneficiaryDocuments || !dbMemory.beneficiaryDocuments.has(documentId)) {
      throw new Error(`Document with ID '${documentId}' not found.`);
    }
    dbMemory.beneficiaryDocuments.delete(documentId);
    return { success: true };
  }

  static async createAidDisbursement(input) {
    if (!input.amount || typeof input.amount !== 'number' || input.amount <= 0) {
      throw new Error('Valid positive disbursement amount is required');
    }

    const beneficiary = dbMemory.beneficiaries.get(input.beneficiaryId);
    if (!beneficiary) {
      throw new Error(`Beneficiary with ID '${input.beneficiaryId}' not found.`);
    }

    if (input.ngoId && beneficiary.ngo_id !== input.ngoId) {
      throw new Error(`UNAUTHORIZED: Organization policy prevents NGO from disbursing funds for another NGO's beneficiary.`);
    }

    const approvedAmount = Number(beneficiary.approved_amount || beneficiary.estimated_cost || 0);
    const currentSpent = Number(beneficiary.spent_amount || 0);
    const remainingBalance = approvedAmount - currentSpent;

    if (input.amount > remainingBalance) {
      throw new Error('Cannot disburse more than remaining approved amount.');
    }

    const aidId = `AID-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();
    const newSpent = currentSpent + Number(input.amount);
    const newRemaining = approvedAmount - newSpent;

    let newStatus = 'PARTIALLY_DISBURSED';
    if (newSpent >= approvedAmount) {
      newStatus = 'FULLY_DISBURSED';
    } else if (newSpent === 0) {
      newStatus = 'APPROVED';
    }

    beneficiary.spent_amount = newSpent;
    beneficiary.remaining_amount = newRemaining;
    beneficiary.status = newStatus;
    beneficiary.updated_at = now;
    dbMemory.beneficiaries.set(input.beneficiaryId, beneficiary);

    const txHash = `SIMULATED-0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`;

    const disbursement = {
      id: aidId,
      beneficiary_id: input.beneficiaryId,
      ngo_id: input.ngoId || beneficiary.ngo_id,
      campaign_id: input.campaignId || 'CMP-2026-0192',
      amount: Number(input.amount),
      aid_type: input.aidType || 'Emergency Relief',
      payment_method: input.paymentMethod || 'UPI',
      payment_status: 'COMPLETED',
      payment_reference: input.paymentReference || `REF-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      blockchain_tx_hash: txHash,
      blockchain_tx_status: 'SIMULATED_TRANSACTION',
      payment_mode: 'DEVELOPMENT_SIMULATION',
      notes: input.notes || '',
      receipt_document_url: input.receiptDocumentUrl || '',
      created_at: now,
      updated_at: now,
    };

    if (!dbMemory.aidDisbursements) dbMemory.aidDisbursements = new Map();
    dbMemory.aidDisbursements.set(aidId, disbursement);

    const expenseItem = {
      id: aidId,
      allocation_id: 'ALLOC-2026-91A7',
      ngo_id: input.ngoId || beneficiary.ngo_id,
      beneficiary_id: input.beneficiaryId,
      receipt_id: 'DR-2026-8F72K9',
      amount: Number(input.amount),
      category: input.aidType || 'Medical Treatment',
      purpose: input.notes || input.aidType || 'Emergency Relief',
      description: input.notes || `${input.aidType} via ${input.paymentMethod || 'UPI'}`,
      status: 'APPROVED',
      verificationState: 'APPROVED ✓',
      payment_method: input.paymentMethod || 'UPI',
      receipt_hash: 'a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8',
      txHash: txHash,
      date: new Date().toISOString().split('T')[0],
      created_at: now,
    };
    if (!dbMemory.expenses) dbMemory.expenses = new Map();
    dbMemory.expenses.set(aidId, expenseItem);

    return { disbursement, beneficiary, expense: expenseItem };
  }

  static async getExpenses(ngoId) {
    if (!dbMemory.expenses) return [];
    let allExpenses = Array.from(dbMemory.expenses.values());
    const filtered = ngoId ? allExpenses.filter((e) => e.ngo_id === ngoId) : allExpenses;
    return { success: true, expenses: filtered };
  }

  static async getBeneficiaryDisbursements(beneficiaryId) {
    if (!dbMemory.aidDisbursements) return [];
    return Array.from(dbMemory.aidDisbursements.values()).filter(
      (d) => d.beneficiary_id === beneficiaryId
    );
  }

  static async createAllocation(input) {
    if (!input.amount || input.amount <= 0) {
      throw new Error('Allocation amount must be a positive number');
    }
    const allocId = generateAllocationId();
    const now = new Date().toISOString();
    const allocation = {
      id: allocId,
      campaign_id: input.campaignId || 'CMP-2026-0192',
      ngo_id: input.ngoId || 'NGO-1042',
      beneficiary_id: input.beneficiaryId || 'BEN-72A91',
      receipt_id: input.receiptId || 'DR-2026-8F72K9',
      amount: Number(input.amount),
      status: 'APPROVED',
      approved_at: now,
      created_at: now,
    };
    dbMemory.allocations.set(allocId, allocation);
    return allocation;
  }

  static async createExpense(input) {
    if (!input.amount || input.amount <= 0) {
      throw new Error('Expense amount must be a positive number');
    }
    const expenseId = generateExpenseId();
    const now = new Date().toISOString();
    const expense = {
      id: expenseId,
      allocation_id: input.allocationId || 'ALLOC-2026-91A7',
      ngo_id: input.ngoId || 'NGO-1042',
      beneficiary_id: input.beneficiaryId || 'BEN-72A91',
      receipt_id: input.receiptId || 'DR-2026-8F72K9',
      amount: Number(input.amount),
      category: input.category || 'Medical Relief',
      purpose: input.description,
      description: input.description,
      status: 'SUBMITTED',
      verificationState: 'APPROVED ✓',
      receipt_hash: input.receiptHash || 'a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8',
      txHash: 'SIMULATED-0x991823abf772183e910293a8172bc9102931bc77261a90c4217734891a274191',
      date: new Date().toISOString().split('T')[0],
      created_at: now,
    };
    dbMemory.expenses.set(expenseId, expense);
    return { expense, fraudFlags: [] };
  }

  static async createEvidence(input) {
    const evidenceId = generateEvidenceId();
    const now = new Date().toISOString();
    const evidence = {
      id: evidenceId,
      expense_id: input.expenseId,
      beneficiary_id: input.beneficiaryId || 'BEN-72A91',
      receipt_id: input.receiptId || 'DR-2026-8F72K9',
      ngo_id: input.ngoId || 'NGO-1042',
      storage_path: `evidence/${evidenceId.toLowerCase()}_capture.jpg`,
      file_hash: input.fileHash,
      captured_via_camera: input.capturedViaCamera ?? true,
      location_meta: input.locationMeta || {
        lat: 19.076,
        lng: 72.8777,
        hospital: 'XYZ Super Specialty Hospital',
        timestamp: now,
      },
      created_at: now,
    };
    dbMemory.evidenceList.set(evidenceId, evidence);
    return evidence;
  }
}

module.exports = { DatabaseRepository };
