const express = require('express');
const FraudController = require('../controllers/fraud.controller');
const router = express.Router();

router.post('/evaluate', FraudController.evaluateFraud);
router.post('/:id/resolve', FraudController.resolveFlag);

module.exports = router;
