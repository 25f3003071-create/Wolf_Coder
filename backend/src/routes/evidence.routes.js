const express = require('express');
const EvidenceController = require('../controllers/evidence.controller');
const router = express.Router();

router.post('/capture', EvidenceController.captureEvidence);

module.exports = router;
