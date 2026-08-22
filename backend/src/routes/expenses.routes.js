const express = require('express');
const ExpenseController = require('../controllers/expense.controller');
const router = express.Router();

router.post('/', ExpenseController.createExpense);

module.exports = router;
