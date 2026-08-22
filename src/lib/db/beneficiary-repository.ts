import { getServiceSupabase, isSupabaseConfigured } from './supabase';
import { dbMemory } from './memory-store';
import { generateBeneficiaryId, generateDocumentId, generateAidDisbursementId } from '@/lib/utils/identifiers';
import { evaluateFraudRules } from '../fraud/engine';
import { createAuditEntry } from '../audit/logger';

export class BeneficiaryRepository {
  private static async persistRecord(table: string, id: string, record: any, memoryMap: Map<string, any>) {
    const isProduction = process.env.NODE_ENV === 'production';
    if (isSupabaseConfigured()) {
      const { error } = await getServiceSupabase().from(table).insert([record]);
      if (error) {
        if (isProduction) throw new Error(`DATABASE PERSISTENCE ERROR: ${error.message}`);
        memoryMap.set(id, record);
      }
    } else {
      if (isProduction) throw new Error('DATABASE CONFIGURATION ERROR: Supabase production database is unconfigured.');
      memoryMap.set(id, record);
    }
  }

  private static async fetchRecords(table: string, ngoId?: string, memoryMap?: Map<string, any>) {
    let list = memoryMap ? Array.from(memoryMap.values()) : [];
    if (isSupabaseConfigured()) {
      try {
        let query = getServiceSupabase().from(table).select('*');
        if (ngoId) query = query.eq('ngo_id', ngoId);
        const { data } = await query;
        if (data && data.length > 0) list = data;
      } catch {}
    }
    return ngoId ? list.filter((item: any) => item.ngo_id === ngoId) : list;
  }

  static async createBeneficiary(input: any) {
    const aidReq = input.emergencyNeed || input.aidRequired;
    if (!aidReq || !aidReq.trim()) throw new Error('Required aid description is mandatory');
    const cost = Number(input.requestedAmount || input.estimatedCost || 0);
    if (!cost || cost <= 0) throw new Error('Valid positive estimated cost is required');

    const benId = generateBeneficiaryId(); const now = new Date().toISOString();
    const fraudFlags = evaluateFraudRules({ entityType: 'BENEFICIARY', entityId: benId, documentHash: input.documentHash, existingHashes: ['e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'] });
    const approvedAmt = input.approvedAmount !== undefined ? Number(input.approvedAmount) : 0;
    const initialStatus = fraudFlags.length > 0 ? 'UNDER_REVIEW' : approvedAmt > 0 ? 'APPROVED' : 'PENDING';

    const beneficiary = {
      id: benId, ngo_id: input.ngoId || 'NGO-1042', full_name: input.fullName || 'Anonymous Beneficiary', mobile: input.mobile || '', email: input.email || '', age: Number(input.age || 0), gender: input.gender || 'Unspecified', address: input.address || '', city_district: input.cityDistrict || '', emergency_need: aidReq, family_members: Number(input.familyMembers || 1), priority: input.priority || 'MEDIUM', requested_amount: cost, approved_amount: approvedAmt, spent_amount: 0, remaining_amount: approvedAmt, aid_category: input.aidCategory || input.category || 'Medical', description: input.description || input.anonymizedSummary || aidReq, category: (input.aidCategory || input.category || 'MEDICAL').toUpperCase(), aid_required: aidReq, status: initialStatus, hospital_name: input.hospitalName || 'General Hospital', treatment_type: input.treatmentType || 'Emergency Aid', estimated_cost: cost, anonymized_summary: input.anonymizedSummary || aidReq, created_at: now, updated_at: now,
    };

    await BeneficiaryRepository.persistRecord('beneficiaries', benId, beneficiary, dbMemory.beneficiaries);
    await createAuditEntry({ action: 'BENEFICIARY_REGISTERED', entityType: 'BENEFICIARY', entityId: benId, newState: beneficiary, reasoning: `NGO registered beneficiary ${benId} with requested amount ₹${cost}.` });
    return { beneficiary, fraudFlags };
  }

  static async getBeneficiaries(ngoId?: string) {
    const filtered = await BeneficiaryRepository.fetchRecords('beneficiaries', ngoId, dbMemory.beneficiaries);
    const summary = {
      totalBeneficiaries: filtered.length,
      totalApproved: filtered.reduce((sum: number, b: any) => sum + (b.approved_amount || b.estimated_cost || 0), 0),
      totalDisbursed: filtered.reduce((sum: number, b: any) => sum + (b.spent_amount || 0), 0),
      totalRemaining: filtered.reduce((sum: number, b: any) => sum + (b.remaining_amount || 0), 0),
    };
    return { success: true, beneficiaries: filtered, summary };
  }

  static async getBeneficiaryById(id: string) {
    let beneficiary = dbMemory.beneficiaries.get(id);
    if (!beneficiary && isSupabaseConfigured()) {
      try { const { data } = await getServiceSupabase().from('beneficiaries').select('*').eq('id', id).single(); if (data) beneficiary = data; } catch {}
    }
    if (!beneficiary) throw new Error(`Beneficiary with ID '${id}' not found.`);

    const documents = Array.from(dbMemory.beneficiaryDocuments.values()).filter((d) => d.beneficiary_id === id);
    const disbursements = Array.from(dbMemory.aidDisbursements.values()).filter((d) => d.beneficiary_id === id);
    return { beneficiary, documents, disbursements };
  }

  static async updateBeneficiary(id: string, updates: any) {
    const beneficiary = dbMemory.beneficiaries.get(id);
    if (!beneficiary) throw new Error(`Beneficiary '${id}' not found`);
    const updated = { ...beneficiary, ...updates, updated_at: new Date().toISOString() };
    dbMemory.beneficiaries.set(id, updated);
    return updated;
  }

  static async uploadBeneficiaryDocument(input: any) {
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', '.pdf', '.jpg', '.jpeg', '.png'];
    const ext = input.filename.substring(input.filename.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes((input.mimeType || '').toLowerCase()) && !allowed.includes(ext)) throw new Error('INVALID FILE TYPE: Allowed file types are PDF, JPG, JPEG, and PNG.');
    if (input.fileSize > 10 * 1024 * 1024) throw new Error('FILE SIZE EXCEEDED: File size cannot exceed 10 MB.');

    const docId = generateDocumentId();
    const document = {
      id: docId, beneficiary_id: input.beneficiaryId, ngo_id: input.ngoId, document_type: input.documentType || 'Eligibility Document', filename: input.filename, mime_type: input.mimeType, file_size: input.fileSize, storage_path: input.storagePath || `documents/${docId.toLowerCase()}_${input.filename}`, uploaded_by: input.uploadedBy || 'NGO Field Representative', created_at: new Date().toISOString(),
    };

    dbMemory.beneficiaryDocuments.set(docId, document);
    await createAuditEntry({ action: 'DOCUMENT_UPLOADED', entityType: 'BENEFICIARY_DOCUMENT', entityId: docId, newState: document, reasoning: `Document '${input.filename}' uploaded for beneficiary ${input.beneficiaryId}.` });
    return document;
  }

  static async getBeneficiaryDocuments(beneficiaryId: string) {
    return Array.from(dbMemory.beneficiaryDocuments.values()).filter((d) => d.beneficiary_id === beneficiaryId);
  }

  static async deleteBeneficiaryDocument(documentId: string) {
    if (!dbMemory.beneficiaryDocuments.has(documentId)) throw new Error(`Document with ID '${documentId}' not found.`);
    dbMemory.beneficiaryDocuments.delete(documentId);
    return { success: true };
  }

  static async createAidDisbursement(input: any) {
    if (!input.amount || typeof input.amount !== 'number' || input.amount <= 0) throw new Error('Valid positive disbursement amount is required');

    const beneficiary = dbMemory.beneficiaries.get(input.beneficiaryId);
    if (!beneficiary) throw new Error(`Beneficiary with ID '${input.beneficiaryId}' not found.`);
    if (input.ngoId && beneficiary.ngo_id !== input.ngoId) throw new Error(`UNAUTHORIZED: Organization policy prevents NGO from disbursing funds for another NGO's beneficiary.`);

    const approvedAmount = Number(beneficiary.approved_amount || beneficiary.estimated_cost || 0);
    const currentSpent = Number(beneficiary.spent_amount || 0);
    const remainingBalance = approvedAmount - currentSpent;
    if (input.amount > remainingBalance) throw new Error('Cannot disburse more than remaining approved amount.');

    const aidId = generateAidDisbursementId(); const now = new Date().toISOString();
    const newSpent = currentSpent + Number(input.amount);
    const newRemaining = approvedAmount - newSpent;

    beneficiary.spent_amount = newSpent; beneficiary.remaining_amount = newRemaining;
    beneficiary.status = newSpent >= approvedAmount ? 'FULLY_DISBURSED' : newSpent === 0 ? 'APPROVED' : 'PARTIALLY_DISBURSED';
    beneficiary.updated_at = now;
    dbMemory.beneficiaries.set(input.beneficiaryId, beneficiary);

    const txHash = `SIMULATED-0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`;
    const disbursement = {
      id: aidId, beneficiary_id: input.beneficiaryId, ngo_id: input.ngoId || beneficiary.ngo_id, campaign_id: input.campaignId || 'CMP-2026-0192', amount: Number(input.amount), aid_type: input.aidType || 'Emergency Relief', payment_method: input.paymentMethod || 'UPI', payment_status: 'COMPLETED', payment_reference: input.paymentReference || `REF-2026-${Math.floor(100000 + Math.random() * 900000)}`, blockchain_tx_hash: txHash, blockchain_tx_status: 'SIMULATED_TRANSACTION', payment_mode: 'DEVELOPMENT_SIMULATION', notes: input.notes || '', receipt_document_url: input.receiptDocumentUrl || '', created_at: now, updated_at: now,
    };
    dbMemory.aidDisbursements.set(aidId, disbursement);

    const expenseItem = {
      id: aidId, allocation_id: 'ALLOC-2026-91A7', ngo_id: input.ngoId || beneficiary.ngo_id, beneficiary_id: input.beneficiaryId, receipt_id: 'DR-2026-8F72K9', amount: Number(input.amount), category: input.aidType || 'Medical Treatment', purpose: input.notes || input.aidType || 'Emergency Relief', description: input.notes || `${input.aidType} via ${input.paymentMethod || 'UPI'}`, status: 'APPROVED', verificationState: 'APPROVED ✓', payment_method: input.paymentMethod || 'UPI', receipt_hash: 'a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8', txHash, date: new Date().toISOString().split('T')[0], created_at: now,
    };
    dbMemory.expenses.set(aidId, expenseItem);

    await createAuditEntry({ action: 'AID_DISBURSED', entityType: 'AID_DISBURSEMENT', entityId: aidId, newState: disbursement, blockchainRef: txHash, reasoning: `NGO recorded aid disbursement of ₹${input.amount} for beneficiary ${input.beneficiaryId}. New remaining balance: ₹${newRemaining}.` });
    return { disbursement, beneficiary, expense: expenseItem };
  }

  static async getBeneficiaryDisbursements(beneficiaryId: string) {
    return Array.from(dbMemory.aidDisbursements.values()).filter((d) => d.beneficiary_id === beneficiaryId);
  }
}
