const express = require('express');
const AllocationController = require('../controllers/allocation.controller');
const router = express.Router();

router.post('/', AllocationController.createAllocation);

module.exports = router;
