const DonationService = require('../services/donation.service');

class DonationController {
  static async createDonation(req, res, next) {
    try {
      const { campaignId, amount, donorId, chain } = req.body;
      const result = await DonationService.createDonation({ campaignId, amount, donorId, chain });
      return res.status(201).json({ success: true, receipt: result });
    } catch (err) {
      next(err);
    }
  }

  static async getReceipt(req, res, next) {
    try {
      const { receiptId } = req.params;
      const result = await DonationService.getDonationReceipt(receiptId);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = DonationController;
