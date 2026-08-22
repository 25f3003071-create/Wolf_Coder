const { DatabaseRepository } = require('../repositories/repository');

class EvidenceService {
  static async createEvidence(data) {
    return await DatabaseRepository.createEvidence(data);
  }
}

module.exports = EvidenceService;
