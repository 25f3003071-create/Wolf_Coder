const express = require('express');
const BeneficiaryController = require('../controllers/beneficiary.controller');
const router = express.Router();

router.post('/', BeneficiaryController.registerBeneficiary);
router.post('/:id/verify', BeneficiaryController.verifyBeneficiary);

module.exports = router;
