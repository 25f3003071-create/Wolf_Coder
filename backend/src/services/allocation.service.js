const { DatabaseRepository } = require('../repositories/repository');

class AllocationService {
  static async createAllocation(data) {
    return await DatabaseRepository.createAllocation(data);
  }
}

module.exports = AllocationService;
