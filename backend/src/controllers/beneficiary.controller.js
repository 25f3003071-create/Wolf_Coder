const BeneficiaryService = require('../services/beneficiary.service');

class BeneficiaryController {
  static async registerBeneficiary(req, res, next) {
    try {
      const result = await BeneficiaryService.createBeneficiary(req.body);
      return res.status(201).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  static async verifyBeneficiary(req, res, next) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      return res.json({
        success: true,
        beneficiaryId: id,
        status: status || 'VERIFIED',
        notes: notes || 'Verified by manager auditor',
        verifiedAt: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = BeneficiaryController;
