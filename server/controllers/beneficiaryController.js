import { BeneficiaryService } from '../services/beneficiaryService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class BeneficiaryController {
  static async getBeneficiaries(req, res, next) {
    try {
      const beneficiaries = await BeneficiaryService.getBeneficiaries(req.user._id);
      return ApiResponse.success(res, 'Beneficiaries fetched successfully.', beneficiaries);
    } catch (error) {
      return ApiResponse.serverError(res, error.message);
    }
  }

  static async addBeneficiary(req, res, next) {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown';

      const beneficiary = await BeneficiaryService.addBeneficiary(
        req.user._id,
        req.body,
        ipAddress,
        userAgent
      );
      return ApiResponse.success(res, 'Beneficiary registered successfully.', beneficiary, 201);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message, 'BENEFICIARY_CREATION_FAILED');
    }
  }

  static async updateBeneficiary(req, res, next) {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown';

      const updated = await BeneficiaryService.updateBeneficiary(
        req.params.id,
        req.user._id,
        req.body,
        ipAddress,
        userAgent
      );
      return ApiResponse.success(res, 'Beneficiary updated successfully.', updated);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  static async deleteBeneficiary(req, res, next) {
    try {
      const { otp } = req.body;
      if (!otp) {
        return ApiResponse.badRequest(res, 'OTP verification code is required to delete a beneficiary.');
      }

      const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown';

      const result = await BeneficiaryService.deleteBeneficiary(
        req.params.id,
        req.user._id,
        otp,
        ipAddress,
        userAgent
      );
      return ApiResponse.success(res, result.message);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message, 'BENEFICIARY_DELETION_FAILED');
    }
  }
}
