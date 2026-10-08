import { BillService } from '../services/billService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class BillController {
  static async getBills(req, res, next) {
    try {
      const history = await BillService.getBillHistory(req.user._id);
      return ApiResponse.success(res, 'Bill payment history retrieved.', history);
    } catch (error) {
      return ApiResponse.serverError(res, error.message);
    }
  }

  static async payBill(req, res, next) {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown';

      const result = await BillService.payBill({
        userId: req.user._id,
        ...req.body,
        ipAddress,
        userAgent,
      });

      return ApiResponse.success(res, 'Bill paid successfully.', result, 201);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message, 'BILL_PAYMENT_FAILED');
    }
  }
}
