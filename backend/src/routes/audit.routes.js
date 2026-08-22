const express = require('express');
const AuditController = require('../controllers/audit.controller');
const router = express.Router();

router.get('/', AuditController.getAuditLogs);

module.exports = router;
