const AllocationService = require('../services/allocation.service');

class AllocationController {
  static async createAllocation(req, res, next) {
    try {
      const result = await AllocationService.createAllocation(req.body);
      return res.status(201).json({ success: true, allocation: result });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AllocationController;
