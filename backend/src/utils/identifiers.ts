export function generateDonationReceiptId(year: number = 2026): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomStr = '';
  for (let i = 0; i < 6; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `DR-${year}-${randomStr}`;
}

export function generateBeneficiaryId(year?: number): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomStr = '';
  const count = year ? 6 : 5;
  for (let i = 0; i < count; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return year ? `BEN-${year}-${randomStr}` : `BEN-${randomStr}`;
}

export function generateAidDisbursementId(year: number = 2026): string {
  const chars = '0123456789';
  let randomStr = '';
  for (let i = 0; i < 6; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `AID-${year}-${randomStr}`;
}

export function generateDocumentId(year: number = 2026): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomStr = '';
  for (let i = 0; i < 6; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `DOC-${year}-${randomStr}`;
}

export function generateNgoId(): string {
  const chars = '0123456789';
  let randomStr = '';
  for (let i = 0; i < 4; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `NGO-${randomStr}`;
}

export function generateCampaignId(): string {
  const chars = '0123456789';
  let randomStr = '';
  for (let i = 0; i < 4; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CMP-2026-${randomStr}`;
}

export function generateAllocationId(): string {
  const chars = '0123456789ABCDEF';
  let randomStr = '';
  for (let i = 0; i < 4; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ALLOC-2026-${randomStr}`;
}

export function generateExpenseId(): string {
  const chars = '0123456789ABCDEF';
  let randomStr = '';
  for (let i = 0; i < 4; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `EXP-2026-${randomStr}`;
}

export function generateEvidenceId(): string {
  const chars = '0123456789ABCDEF';
  let randomStr = '';
  for (let i = 0; i < 4; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `EVD-2026-${randomStr}`;
}

export function generateVerificationId(): string {
  const chars = '0123456789';
  let randomStr = '';
  for (let i = 0; i < 4; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `VER-2026-${randomStr}`;
}
