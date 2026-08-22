class AuditController {
  static async getAuditLogs(req, res, next) {
    try {
      return res.json({
        success: true,
        auditLogs: [
          {
            id: '11111111-1111-1111-1111-111111111111',
            action: 'DONATION_CREATED',
            entity_type: 'DONATION_RECEIPT',
            entity_id: 'DR-2026-8F72K9',
            reasoning: 'Donor initiated contribution of ₹10,000 for Emergency Medical Relief',
            blockchain_ref: '0x8a7291bc44f128e932104975193a218f77361a90c4217734891a274191bc44f1',
            created_at: '2026-08-22T10:21:00Z',
          },
          {
            id: '22222222-2222-2222-2222-222222222222',
            action: 'BENEFICIARY_VERIFIED',
            entity_type: 'BENEFICIARY',
            entity_id: 'BEN-72A91',
            reasoning: 'Manager auditor verified emergency surgery cost estimate',
            blockchain_ref: 'VER-2026-9281',
            created_at: '2026-08-22T11:02:00Z',
          },
        ],
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuditController;
