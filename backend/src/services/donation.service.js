const { DatabaseRepository } = require('../repositories/repository');

class DonationService {
  static async createDonation(data) {
    return await DatabaseRepository.createDonation(data);
  }

  static async getDonationReceipt(receiptId) {
    return await DatabaseRepository.getDonationReceipt(receiptId);
  }
}

module.exports = DonationService;
