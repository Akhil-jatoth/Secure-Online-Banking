import { User } from '../models/User.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { AuditService } from '../services/auditService.js';
import { AUDIT_ACTIONS } from '../utils/constants.js';

export class ProfileController {
  static async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.user._id);
      return ApiResponse.success(res, 'Profile retrieved.', user);
    } catch (error) {
      return ApiResponse.serverError(res, error.message);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const { fullName, phoneNumber, address } = req.body;
      const user = await User.findById(req.user._id);

      if (fullName) user.fullName = fullName.trim();
      if (phoneNumber) user.phoneNumber = phoneNumber.trim();
      if (address) {
        user.address = {
          ...user.address,
          ...address,
        };
      }

      await user.save();

      const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown';

      await AuditService.log({
        userId: user._id,
        userEmail: user.email,
        action: AUDIT_ACTIONS.PROFILE_UPDATE,
        resource: 'User',
        resourceId: user._id,
        ipAddress,
        userAgent,
        status: 'SUCCESS',
      });

      return ApiResponse.success(res, 'Profile updated successfully.', user);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }
}
