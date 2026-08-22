const ExpenseService = require('../services/expense.service');

class ExpenseController {
  static async createExpense(req, res, next) {
    try {
      const result = await ExpenseService.createExpense(req.body);
      return res.status(201).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ExpenseController;
