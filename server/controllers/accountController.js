import { AccountService } from '../services/accountService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class AccountController {
  static async getAccounts(req, res, next) {
    try {
      const accounts = await AccountService.getUserAccounts(req.user._id);
      return ApiResponse.success(res, 'Accounts fetched successfully.', accounts);
    } catch (error) {
      return ApiResponse.serverError(res, error.message);
    }
  }

  static async getAccountById(req, res, next) {
    try {
      const account = await AccountService.getAccountById(req.params.id, req.user._id);
      return ApiResponse.success(res, 'Account details retrieved.', account);
    } catch (error) {
      return ApiResponse.notFound(res, error.message);
    }
  }

  static async getAccountBalance(req, res, next) {
    try {
      const balanceData = await AccountService.getAccountBalance(req.params.id, req.user._id);
      return ApiResponse.success(res, 'Balance retrieved.', balanceData);
    } catch (error) {
      return ApiResponse.notFound(res, error.message);
    }
  }

  static async openAccount(req, res, next) {
    try {
      const { accountType } = req.body;
      const newAccount = await AccountService.createAdditionalAccount(req.user._id, accountType);
      return ApiResponse.success(res, 'New bank account opened successfully.', newAccount, 201);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }
}
