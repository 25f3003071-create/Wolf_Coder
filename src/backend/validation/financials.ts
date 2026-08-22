/**
 * Server-Side Financial Safety & Ceiling Validation Module.
 * Enforces transaction limits and prevents over-allocation.
 */

export function validatePositiveAmount(amount: number, label: string = 'Amount'): void {
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    throw new Error(`INVALID AMOUNT: ${label} must be a positive number.`);
  }
}

export function validateAllocationCeiling(
  requestedAmount: number,
  allocatedTotal: number,
  campaignRaisedPool: number
): void {
  validatePositiveAmount(requestedAmount, 'Allocation amount');
  if (allocatedTotal + requestedAmount > campaignRaisedPool) {
    throw new Error(
      `OVER-ALLOCATION PREVENTED: Requested allocation ₹${requestedAmount} exceeds available campaign pool ₹${
        campaignRaisedPool - allocatedTotal
      }`
    );
  }
}

export function validateExpenseCeiling(
  claimedAmount: number,
  existingExpensesTotal: number,
  approvedAllocationAmount: number
): void {
  validatePositiveAmount(claimedAmount, 'Expense amount');
  if (existingExpensesTotal + claimedAmount > approvedAllocationAmount) {
    throw new Error(
      `EXPENSE CEILING EXCEEDED: Claimed expense ₹${claimedAmount} exceeds remaining approved allocation ₹${
        approvedAllocationAmount - existingExpensesTotal
      }`
    );
  }
}
