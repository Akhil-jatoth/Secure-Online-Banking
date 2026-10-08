import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Account } from '../models/Account.js';
import { AuditService } from './auditService.js';
import { NotificationService } from './notificationService.js';
import { OTPService } from './otpService.js';
import { ROLES, ACCOUNT_TYPES, ACCOUNT_STATUS, AUDIT_ACTIONS, OTP_PURPOSES } from '../utils/constants.js';

export class AuthService {
  static generateToken(user) {
    const payload = {
      id: user._id,
      customerId: user.customerId,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };
    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_academic_secure_bank_2026_production_grade_random_seed_994821049';
    const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
    return jwt.sign(payload, secret, { expiresIn });
  }

  static async register({ fullName, email, password, phoneNumber, dateOfBirth, address }, ipAddress, userAgent) {
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new Error('An account with this email address already exists.');
    }

    // Generate unique Customer ID
    const customerId = `CUST-${Date.now().toString().slice(-5)}${Math.floor(100 + Math.random() * 900)}`;

    const user = new User({
      customerId,
      fullName,
      email: normalizedEmail,
      password,
      phoneNumber,
      dateOfBirth,
      address,
      role: ROLES.CUSTOMER,
    });

    await user.save();

    // Automatically create primary Savings account with simulated initial balance
    const accountNumber = `100${Date.now().toString().slice(-7)}${Math.floor(10 + Math.random() * 90)}`;
    const initialWelcomeBalance = 2500.00;

    const account = await Account.create({
      accountNumber,
      user: user._id,
      accountType: ACCOUNT_TYPES.SAVINGS,
      balance: initialWelcomeBalance,
      availableBalance: initialWelcomeBalance,
      currency: 'USD',
      status: ACCOUNT_STATUS.ACTIVE,
    });

    // Record audit log
    await AuditService.log({
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      action: AUDIT_ACTIONS.REGISTRATION,
      resource: 'User',
      resourceId: user._id,
      ipAddress,
      userAgent,
      status: 'SUCCESS',
      metadata: { customerId, accountNumber, initialBalance: initialWelcomeBalance },
    });

    // Send Welcome Notification
    await NotificationService.create({
      userId: user._id,
      title: 'Welcome to Aegis Secure Bank',
      message: `Your account #${accountNumber} is active with an opening balance of $${initialWelcomeBalance.toFixed(2)}.`,
      type: 'ACCOUNT',
    });

    const token = this.generateToken(user);

    return {
      user: {
        id: user._id,
        customerId: user.customerId,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
      account: {
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        balance: account.balance,
        availableBalance: account.availableBalance,
        currency: account.currency,
      },
      token,
    };
  }

  static async login({ email, password }, ipAddress, userAgent) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      await AuditService.log({
        userEmail: normalizedEmail,
        action: AUDIT_ACTIONS.FAILED_LOGIN,
        resource: 'Auth',
        ipAddress,
        userAgent,
        status: 'FAILURE',
        metadata: { reason: 'User not found' },
      });
      throw new Error('Invalid email or password credentials.');
    }

    if (user.isLocked()) {
      const lockMinutesRemaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
      await AuditService.log({
        userId: user._id,
        userEmail: user.email,
        action: AUDIT_ACTIONS.FAILED_LOGIN,
        resource: 'Auth',
        ipAddress,
        userAgent,
        status: 'WARNING',
        metadata: { reason: 'Attempt while locked out', lockMinutesRemaining },
      });
      throw new Error(`Account is locked due to repeated failed attempts. Please try again in ${lockMinutesRemaining} minute(s).`);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      const updatedUser = await User.findById(user._id);

      await AuditService.log({
        userId: user._id,
        userEmail: user.email,
        action: AUDIT_ACTIONS.FAILED_LOGIN,
        resource: 'Auth',
        ipAddress,
        userAgent,
        status: 'FAILURE',
        metadata: { failedAttempts: updatedUser.failedLoginAttempts },
      });

      if (updatedUser.isLocked()) {
        await AuditService.log({
          userId: user._id,
          userEmail: user.email,
          action: AUDIT_ACTIONS.ACCOUNT_LOCKOUT,
          resource: 'User',
          resourceId: user._id,
          ipAddress,
          userAgent,
          status: 'WARNING',
          metadata: { lockedUntil: updatedUser.lockUntil },
        });

        await NotificationService.create({
          userId: user._id,
          title: 'Security Alert: Account Locked',
          message: 'Your account has been temporarily locked for 15 minutes due to 5 consecutive failed login attempts.',
          type: 'SECURITY',
        });

        throw new Error('Account locked due to 5 consecutive failed login attempts. Please try again after 15 minutes.');
      }

      throw new Error('Invalid email or password credentials.');
    }

    // Successful login: reset attempts and record last login
    await user.resetLoginAttempts(ipAddress);

    await AuditService.log({
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      action: AUDIT_ACTIONS.LOGIN,
      resource: 'Auth',
      ipAddress,
      userAgent,
      status: 'SUCCESS',
      metadata: { lastLoginAt: new Date() },
    });

    await NotificationService.create({
      userId: user._id,
      title: 'Successful Login',
      message: `Signed in from IP: ${ipAddress} on ${new Date().toLocaleString()}`,
      type: 'SECURITY',
    });

    const token = this.generateToken(user);

    return {
      user: {
        id: user._id,
        customerId: user.customerId,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        lastLoginAt: user.lastLoginAt,
      },
      token,
    };
  }

  static async changePassword(userId, { currentPassword, newPassword, otp }, ipAddress, userAgent) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new Error('User not found.');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new Error('Current password does not match our records.');
    }

    // Verify OTP
    const otpResult = await OTPService.verifyOTP({
      userId: user._id,
      purpose: OTP_PURPOSES.CHANGE_PASSWORD,
      otp,
    });

    if (!otpResult.isValid) {
      throw new Error(otpResult.message || 'Invalid or expired OTP code.');
    }

    user.password = newPassword;
    await user.save();

    await AuditService.log({
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      action: AUDIT_ACTIONS.PASSWORD_CHANGE,
      resource: 'User',
      resourceId: user._id,
      ipAddress,
      userAgent,
      status: 'SUCCESS',
    });

    await NotificationService.create({
      userId: user._id,
      title: 'Password Changed Successfully',
      message: 'Your account password has been updated. If you did not perform this action, contact support immediately.',
      type: 'SECURITY',
    });

    return { success: true, message: 'Password changed successfully.' };
  }

  static async forgotPassword({ email }, ipAddress, userAgent) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // For security reasons, do not reveal if user does not exist
    if (!user) {
      return {
        success: true,
        message: 'If the email is registered, a password reset OTP has been sent.',
      };
    }

    const otpData = await OTPService.generateOTP({
      userId: user._id,
      email: user.email,
      purpose: OTP_PURPOSES.RESET_PASSWORD,
    });

    await AuditService.log({
      userId: user._id,
      userEmail: user.email,
      action: AUDIT_ACTIONS.PASSWORD_RESET_REQUEST,
      resource: 'Auth',
      ipAddress,
      userAgent,
      status: 'SUCCESS',
    });

    return {
      success: true,
      message: 'If the email is registered, a password reset OTP has been sent.',
      demoCode: otpData.demoCode,
    };
  }

  static async resetPassword({ email, otp, newPassword }, ipAddress, userAgent) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      throw new Error('Invalid email or expired OTP request.');
    }

    const otpResult = await OTPService.verifyOTP({
      userId: user._id,
      email: user.email,
      purpose: OTP_PURPOSES.RESET_PASSWORD,
      otp,
    });

    if (!otpResult.isValid) {
      throw new Error(otpResult.message || 'Invalid or expired OTP code.');
    }

    user.password = newPassword;
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    await AuditService.log({
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      action: AUDIT_ACTIONS.PASSWORD_RESET_SUCCESS,
      resource: 'User',
      resourceId: user._id,
      ipAddress,
      userAgent,
      status: 'SUCCESS',
    });

    await NotificationService.create({
      userId: user._id,
      title: 'Password Reset Successful',
      message: 'Your password was successfully reset. You may now log in with your new password.',
      type: 'SECURITY',
    });

    return { success: true, message: 'Password has been reset successfully. Please log in.' };
  }
}
