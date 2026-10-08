import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { OTP } from '../models/OTP.js';
import { logger } from '../config/logger.js';
import { OTP_PURPOSES } from '../utils/constants.js';
import { EmailService } from './emailService.js';

export class OTPService {
  /**
   * Generates a secure random 6-digit OTP, stores bcrypt hash, and dispatches via Brevo Email
   */
  static async generateOTP({ userId = null, email, purpose, fullName = 'Valued Customer', metadata = {} }) {
    // Generate 6-digit random code
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otpCode, salt);

    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10);
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Invalidate any existing unused OTPs for this user & purpose
    const invalidateQuery = { purpose, isUsed: false };
    if (userId) invalidateQuery.userId = userId;
    if (email) invalidateQuery.email = email.toLowerCase();
    await OTP.updateMany(invalidateQuery, { isUsed: true });

    // Store new hashed OTP
    await OTP.create({
      userId,
      email: email ? email.toLowerCase() : undefined,
      otpHash,
      purpose,
      expiresAt,
      metadata,
    });

    // Dispatch formal Email via Brevo API
    if (email) {
      await EmailService.sendOTPEmail({
        email,
        fullName,
        otpCode,
        purpose,
        expiryMinutes,
      });
    }

    logger.info(`=======================================================`);
    logger.info(`[SURAKSHA BANK OTP DISPATCHED] FOR: ${email || userId}`);
    logger.info(`[PURPOSE]: ${purpose}`);
    logger.info(`[ONE-TIME CODE]: >>> ${otpCode} <<< (Expires in ${expiryMinutes} minutes)`);
    logger.info(`=======================================================`);

    return {
      success: true,
      expiresAt,
      message: `OTP has been dispatched to ${email || 'your registered email'}.`,
    };
  }

  /**
   * Verifies an OTP code against its stored hash
   */
  static async verifyOTP({ userId = null, email, purpose, otp }) {
    const query = {
      purpose,
      isUsed: false,
    };
    if (userId && email) {
      query.$or = [{ userId }, { email: email.toLowerCase().trim() }];
    } else if (userId) {
      query.userId = userId;
    } else if (email) {
      query.email = email.toLowerCase().trim();
    }

    // Find the latest active OTP
    const latestOtp = await OTP.findOne(query).sort({ createdAt: -1 });

    if (!latestOtp) {
      return {
        isValid: false,
        message: 'No active OTP found or code already expired. Please click Resend OTP for a fresh code.',
      };
    }

    const verificationResult = await latestOtp.verifyCode(otp);
    if (!verificationResult.valid) {
      return {
        isValid: false,
        message: verificationResult.reason,
        attemptsRemaining: verificationResult.attemptsRemaining,
      };
    }

    return {
      isValid: true,
      message: 'OTP verified successfully.',
    };
  }
}
