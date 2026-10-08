import { Beneficiary } from '../models/Beneficiary.js';
import { OTPService } from './otpService.js';
import { AuditService } from './auditService.js';
import { NotificationService } from './notificationService.js';
import { AUDIT_ACTIONS, OTP_PURPOSES } from '../utils/constants.js';

export class BeneficiaryService {
  static async getBeneficiaries(userId) {
    return Beneficiary.find({ user: userId }).sort({ createdAt: -1 });
  }

  static async addBeneficiary(userId, { name, accountNumber, bankName, routingNumber, nickname, otp }, ipAddress, userAgent) {
    // 1. Verify OTP
    const otpResult = await OTPService.verifyOTP({
      userId,
      purpose: OTP_PURPOSES.ADD_BENEFICIARY,
      otp,
    });

    if (!otpResult.isValid) {
      throw new Error(otpResult.message || 'Invalid or expired OTP for adding beneficiary.');
    }

    // 2. Check duplicate
    const existing = await Beneficiary.findOne({ user: userId, accountNumber: accountNumber.trim() });
    if (existing) {
      throw new Error('You have already added a beneficiary with this account number.');
    }

    const beneficiary = await Beneficiary.create({
      user: userId,
      name: name.trim(),
      accountNumber: accountNumber.trim(),
      bankName: bankName.trim(),
      routingNumber: routingNumber.trim(),
      nickname: nickname ? nickname.trim() : '',
    });

    await AuditService.log({
      userId,
      action: AUDIT_ACTIONS.BENEFICIARY_CREATE,
      resource: 'Beneficiary',
      resourceId: beneficiary._id,
      ipAddress,
      userAgent,
      status: 'SUCCESS',
      metadata: { name: beneficiary.name, accountNumber: beneficiary.accountNumber },
    });

    await NotificationService.create({
      userId,
      title: 'Beneficiary Added',
      message: `Beneficiary "${beneficiary.name}" (#${beneficiary.accountNumber}) has been added successfully.`,
      type: 'SECURITY',
    });

    return beneficiary;
  }

  static async updateBeneficiary(beneficiaryId, userId, updateData, ipAddress, userAgent) {
    const beneficiary = await Beneficiary.findOne({ _id: beneficiaryId, user: userId });
    if (!beneficiary) {
      throw new Error('Beneficiary not found or unauthorized.');
    }

    if (updateData.name) beneficiary.name = updateData.name.trim();
    if (updateData.nickname !== undefined) beneficiary.nickname = updateData.nickname.trim();
    if (updateData.bankName) beneficiary.bankName = updateData.bankName.trim();
    if (updateData.routingNumber) beneficiary.routingNumber = updateData.routingNumber.trim();

    await beneficiary.save();

    await AuditService.log({
      userId,
      action: AUDIT_ACTIONS.BENEFICIARY_UPDATE,
      resource: 'Beneficiary',
      resourceId: beneficiary._id,
      ipAddress,
      userAgent,
      status: 'SUCCESS',
    });

    return beneficiary;
  }

  static async deleteBeneficiary(beneficiaryId, userId, otp, ipAddress, userAgent) {
    const beneficiary = await Beneficiary.findOne({ _id: beneficiaryId, user: userId });
    if (!beneficiary) {
      throw new Error('Beneficiary not found or unauthorized.');
    }

    // Verify OTP for deletion
    const otpResult = await OTPService.verifyOTP({
      userId,
      purpose: OTP_PURPOSES.DELETE_BENEFICIARY,
      otp,
    });

    if (!otpResult.isValid) {
      throw new Error(otpResult.message || 'Invalid or expired OTP for removing beneficiary.');
    }

    await Beneficiary.deleteOne({ _id: beneficiary._id });

    await AuditService.log({
      userId,
      action: AUDIT_ACTIONS.BENEFICIARY_DELETE,
      resource: 'Beneficiary',
      resourceId: beneficiary._id,
      ipAddress,
      userAgent,
      status: 'SUCCESS',
      metadata: { name: beneficiary.name, accountNumber: beneficiary.accountNumber },
    });

    await NotificationService.create({
      userId,
      title: 'Beneficiary Removed',
      message: `Beneficiary "${beneficiary.name}" has been removed from your saved list.`,
      type: 'SECURITY',
    });

    return { success: true, message: 'Beneficiary deleted successfully.' };
  }
}
