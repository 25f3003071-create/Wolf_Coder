const express = require('express');
const TrackingController = require('../controllers/tracking.controller');
const router = express.Router();

router.get('/:receiptId', TrackingController.getTrackingTimeline);

module.exports = router;
