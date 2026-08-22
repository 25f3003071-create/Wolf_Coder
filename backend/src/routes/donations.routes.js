const express = require('express');
const DonationController = require('../controllers/donation.controller');
const router = express.Router();

router.post('/', DonationController.createDonation);
router.get('/:receiptId', DonationController.getReceipt);

module.exports = router;
