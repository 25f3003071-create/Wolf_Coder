export function generateDonationReceiptId(year: number = 2026): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomStr = '';
  for (let i = 0; i < 6; i++) randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  return `DR-${year}-${randomStr}`;
}

export function generateBeneficiaryId(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomStr = '';
  for (let i = 0; i < 5; i++) randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  return `BEN-${randomStr}`;
}

export function generateNgoId(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `NGO-${randomNum}`;
}

export function generateAllocationId(): string {
  const chars = '0123456789ABCDEF';
  let randomStr = '';
  for (let i = 0; i < 4; i++) randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  return `ALLOC-2026-${randomStr}`;
}

export function generateExpenseId(): string {
  const chars = '0123456789ABCDEF';
  let randomStr = '';
  for (let i = 0; i < 4; i++) randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  return `EXP-2026-${randomStr}`;
}

export function generateEvidenceId(): string {
  const chars = '0123456789ABCDEF';
  let randomStr = '';
  for (let i = 0; i < 4; i++) randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  return `EVD-2026-${randomStr}`;
}

export function generateVerificationId(): string {
  const chars = '0123456789ABCDEF';
  let randomStr = '';
  for (let i = 0; i < 4; i++) randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  return `VER-2026-${randomStr}`;
}

export function generateCampaignId(): string {
  const chars = '0123456789ABCDEF';
  let randomStr = '';
  for (let i = 0; i < 4; i++) randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  return `CMP-2026-${randomStr}`;
}

export function generateDocumentId(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomStr = '';
  for (let i = 0; i < 6; i++) randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  return `DOC-2026-${randomStr}`;
}

export function generateAidDisbursementId(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `AID-2026-${randomNum}`;
}

export function isValidReceiptId(id: string): boolean {
  return /^DR-2026-[2-9A-HJ-NP-Z]{6}$/.test(id);
}

export function isValidBeneficiaryId(id: string): boolean {
  return /^BEN-[0-9A-F]{5}$/i.test(id);
}
