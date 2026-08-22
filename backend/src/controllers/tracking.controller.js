const DonationService = require('../services/donation.service');

class TrackingController {
  static async getTrackingTimeline(req, res, next) {
    try {
      const { receiptId } = req.params;
      const result = await DonationService.getDonationReceipt(receiptId);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = TrackingController;
