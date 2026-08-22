const { DatabaseRepository } = require('../repositories/repository');

class BeneficiaryService {
  static async createBeneficiary(data) {
    return await DatabaseRepository.createBeneficiary(data);
  }
}

module.exports = BeneficiaryService;
