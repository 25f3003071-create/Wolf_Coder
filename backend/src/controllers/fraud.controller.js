const FraudService = require('../services/fraud.service');

class FraudController {
  static async evaluateFraud(req, res, next) {
    try {
      const flags = FraudService.evaluate(req.body);
      return res.json({ success: true, flags });
    } catch (err) {
      next(err);
    }
  }

  static async resolveFlag(req, res, next) {
    try {
      const { id } = req.params;
      const { resolutionNotes } = req.body;
      return res.json({
        success: true,
        flagId: id,
        status: 'RESOLVED',
        resolutionNotes: resolutionNotes || 'Resolved by manager auditor',
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = FraudController;
