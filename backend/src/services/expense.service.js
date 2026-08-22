const { DatabaseRepository } = require('../repositories/repository');

class ExpenseService {
  static async createExpense(data) {
    return await DatabaseRepository.createExpense(data);
  }
}

module.exports = ExpenseService;
