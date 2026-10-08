import { AuthService } from '../services/authService.js';
import { OTPService } from '../services/otpService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { OTP_PURPOSES } from '../utils/constants.js';

export class AuthController {
  static async register(req, res, next) {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown';

      const result = await AuthService.register(req.body, ipAddress, userAgent);
      return ApiResponse.success(res, 'Registration successful. Bank account opened.', result, 201);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message, 'REGISTRATION_FAILED');
    }
  }

  static async login(req, res, next) {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown';

      const result = await AuthService.login(req.body, ipAddress, userAgent);
      return ApiResponse.success(res, 'Authentication successful.', result);
    } catch (error) {
      if (error.message.includes('Account is locked') || error.message.includes('5 consecutive failed')) {
        return ApiResponse.forbidden(res, error.message, 'ACCOUNT_LOCKED');
      }
      return ApiResponse.unauthorized(res, error.message, 'INVALID_CREDENTIALS');
    }
  }

  static async logout(req, res, next) {
    try {
      return ApiResponse.success(res, 'Logged out successfully.');
    } catch (error) {
      return ApiResponse.serverError(res, error.message);
    }
  }

  static async getMe(req, res, next) {
    try {
      const user = req.user;
      return ApiResponse.success(res, 'Current user profile retrieved.', {
        id: user._id,
        customerId: user.customerId,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        address: user.address,
        role: user.role,
        lastLoginAt: user.lastLoginAt,
      });
    } catch (error) {
      return ApiResponse.serverError(res, error.message);
    }
  }

  static async requestOTP(req, res, next) {
    try {
      const { purpose, email } = req.body;
      const targetUserId = req.user ? req.user._id : null;
      const targetEmail = req.user ? req.user.email : email;
      const targetFullName = req.user ? req.user.fullName : 'Customer';

      if (!targetEmail && !targetUserId) {
        return ApiResponse.badRequest(res, 'Email or authenticated session required to send OTP.');
      }

      const validPurpose = Object.values(OTP_PURPOSES).includes(purpose) ? purpose : OTP_PURPOSES.TRANSFER;
      const result = await OTPService.generateOTP({
        userId: targetUserId,
        email: targetEmail,
        fullName: targetFullName,
        purpose: validPurpose,
      });

      return ApiResponse.success(res, result.message, {
        expiresAt: result.expiresAt,
      });
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  static async verifyOTP(req, res, next) {
    try {
      const { purpose, otp, email } = req.body;
      const targetUserId = req.user ? req.user._id : null;
      const targetEmail = req.user ? req.user.email : email;

      const result = await OTPService.verifyOTP({
        userId: targetUserId,
        email: targetEmail,
        purpose,
        otp,
      });

      if (!result.isValid) {
        return ApiResponse.badRequest(res, result.message, 'INVALID_OTP', [
          { attemptsRemaining: result.attemptsRemaining },
        ]);
      }

      return ApiResponse.success(res, result.message);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown';

      const result = await AuthService.changePassword(req.user._id, req.body, ipAddress, userAgent);
      return ApiResponse.success(res, result.message);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message, 'PASSWORD_CHANGE_FAILED');
    }
  }

  static async forgotPassword(req, res, next) {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown';

      const result = await AuthService.forgotPassword(req.body, ipAddress, userAgent);
      return ApiResponse.success(res, result.message);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown';

      const result = await AuthService.resetPassword(req.body, ipAddress, userAgent);
      return ApiResponse.success(res, result.message);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message, 'PASSWORD_RESET_FAILED');
    }
  }
}
