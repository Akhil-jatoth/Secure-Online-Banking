import { TransactionService } from '../services/transactionService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class TransactionController {
  static async transfer(req, res, next) {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown';

      const result = await TransactionService.executeTransfer({
        userId: req.user._id,
        ...req.body,
        ipAddress,
        userAgent,
      });

      return ApiResponse.success(res, 'Fund transfer processed successfully.', result, 201);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message, 'TRANSFER_FAILED');
    }
  }

  static async getTransactions(req, res, next) {
    try {
      const result = await TransactionService.getUserTransactions(req.user._id, req.query);
      return ApiResponse.success(res, 'Transactions retrieved successfully.', result);
    } catch (error) {
      return ApiResponse.serverError(res, error.message);
    }
  }

  static async getTransactionById(req, res, next) {
    try {
      const transaction = await TransactionService.getTransactionById(req.params.id, req.user._id);
      return ApiResponse.success(res, 'Transaction details retrieved.', transaction);
    } catch (error) {
      return ApiResponse.notFound(res, error.message);
    }
  }
}
