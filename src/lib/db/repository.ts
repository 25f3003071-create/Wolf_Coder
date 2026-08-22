import { BeneficiaryRepository } from './beneficiary-repository';
import { FinancialRepository } from './financial-repository';

export class DatabaseRepository {
  // Financial & Donation Operations
  static createDonation = FinancialRepository.createDonation;
  static getDonationReceipt = FinancialRepository.getDonationReceipt;
  static createAllocation = FinancialRepository.createAllocation;
  static createExpense = FinancialRepository.createExpense;
  static getExpenses = FinancialRepository.getExpenses;
  static createEvidence = FinancialRepository.createEvidence;

  // Beneficiary Operations
  static createBeneficiary = BeneficiaryRepository.createBeneficiary;
  static getBeneficiaries = BeneficiaryRepository.getBeneficiaries;
  static getBeneficiaryById = BeneficiaryRepository.getBeneficiaryById;
  static updateBeneficiary = BeneficiaryRepository.updateBeneficiary;
  static uploadBeneficiaryDocument = BeneficiaryRepository.uploadBeneficiaryDocument;
  static getBeneficiaryDocuments = BeneficiaryRepository.getBeneficiaryDocuments;
  static deleteBeneficiaryDocument = BeneficiaryRepository.deleteBeneficiaryDocument;
  static createAidDisbursement = BeneficiaryRepository.createAidDisbursement;
  static getBeneficiaryDisbursements = BeneficiaryRepository.getBeneficiaryDisbursements;
}
