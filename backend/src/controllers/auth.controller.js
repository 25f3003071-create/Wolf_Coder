const OtpService = require('../services/otp.service');

class AuthController {
  static async sendOtp(req, res, next) {
    try {
      const { mobileNumber, phone, email } = req.body;
      const target = mobileNumber || phone || email;

      if (!target || target.trim().length < 5) {
        return res.status(400).json({ error: 'Valid mobile number or email address is required' });
      }

      const result = OtpService.generateAndSendOtp(target);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      const responseData = {
        success: true,
        message: result.message,
      };

      if (process.env.NODE_ENV !== 'production' && result.otp) {
        responseData.developmentOtp = result.otp;
      }

      return res.json(responseData);
    } catch (err) {
      next(err);
    }
  }

  static async verifyOtp(req, res, next) {
    try {
      const { mobileNumber, phone, email, otp } = req.body;
      const target = mobileNumber || phone || email;

      const result = OtpService.verifyOtp(target, otp);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      return res.json({
        success: true,
        message: 'OTP verified successfully',
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
