const express = require('express');
const AuthController = require('../controllers/auth.controller');
const router = express.Router();

router.post('/otp', AuthController.sendOtp);
router.post('/otp/verify', AuthController.verifyOtp);

module.exports = router;
