import { AdminService } from '../services/adminService.js';
import { AuditService } from '../services/auditService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class AdminController {
  static async getDashboard(req, res, next) {
    try {
      const stats = await AdminService.getDashboardStats();
      return ApiResponse.success(res, 'Admin dashboard metrics retrieved.', stats);
    } catch (error) {
      return ApiResponse.serverError(res, error.message);
    }
  }

  static async getUsers(req, res, next) {
    try {
      const result = await AdminService.getUsers(req.query);
      return ApiResponse.success(res, 'User list retrieved.', result);
    } catch (error) {
      return ApiResponse.serverError(res, error.message);
    }
  }

  static async getUserById(req, res, next) {
    try {
      const userDetails = await AdminService.getUserDetails(req.params.id);
      return ApiResponse.success(res, 'User details retrieved.', userDetails);
    } catch (error) {
      return ApiResponse.notFound(res, error.message);
    }
  }

  static async freezeAccount(req, res, next) {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown';
      const { reason } = req.body;

      const account = await AdminService.freezeAccount(
        req.params.id,
        req.user._id,
        reason,
        ipAddress,
        userAgent
      );
      return ApiResponse.success(res, `Account #${account.accountNumber} has been frozen.`, account);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  static async unfreezeAccount(req, res, next) {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown';

      const account = await AdminService.unfreezeAccount(
        req.params.id,
        req.user._id,
        ipAddress,
        userAgent
      );
      return ApiResponse.success(res, `Account #${account.accountNumber} has been un-frozen and reactivated.`, account);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  static async getTransactions(req, res, next) {
    try {
      const result = await AdminService.getAllTransactions(req.query);
      return ApiResponse.success(res, 'System transactions retrieved.', result);
    } catch (error) {
      return ApiResponse.serverError(res, error.message);
    }
  }

  static async getAuditLogs(req, res, next) {
    try {
      const result = await AuditService.getLogs(req.query);
      return ApiResponse.success(res, 'System audit logs retrieved.', result);
    } catch (error) {
      return ApiResponse.serverError(res, error.message);
    }
  }
}
