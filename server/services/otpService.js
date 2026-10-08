import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { OTP } from '../models/OTP.js';
import { logger } from '../config/logger.js';
import { OTP_PURPOSES } from '../utils/constants.js';

export class OTPService {
  /**
   * Generates a secure random 6-digit OTP and stores its bcrypt hash
   */
  static async generateOTP({ userId = null, email, purpose, metadata = {} }) {
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

    // Academic Banking Simulation: Safe simulated MFA logger
    logger.info(`=======================================================`);
    logger.info(`[ACADEMIC MFA SIMULATION] OTP GENERATED FOR: ${email || userId}`);
    logger.info(`[PURPOSE]: ${purpose}`);
    logger.info(`[ONE-TIME CODE]: >>> ${otpCode} <<< (Expires in ${expiryMinutes} minutes)`);
    logger.info(`=======================================================`);

    return {
      success: true,
      expiresAt,
      // For academic simulation ease of testing in UI/Postman:
      demoCode: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
      message: `OTP has been generated and dispatched (Academic simulation demo code: ${otpCode})`,
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
    if (userId) query.userId = userId;
    if (email) query.email = email.toLowerCase();

    // Find the latest active OTP
    const latestOtp = await OTP.findOne(query).sort({ createdAt: -1 });

    if (!latestOtp) {
      return {
        isValid: false,
        message: 'No valid OTP found or OTP already used. Please request a new one.',
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
