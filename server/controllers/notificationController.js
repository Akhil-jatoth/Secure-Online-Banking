import { NotificationService } from '../services/notificationService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class NotificationController {
  static async getNotifications(req, res, next) {
    try {
      const result = await NotificationService.getUserNotifications(req.user._id, req.query);
      return ApiResponse.success(res, 'Notifications retrieved.', result);
    } catch (error) {
      return ApiResponse.serverError(res, error.message);
    }
  }

  static async markAsRead(req, res, next) {
    try {
      const updated = await NotificationService.markAsRead(req.params.id, req.user._id);
      if (!updated) {
        return ApiResponse.notFound(res, 'Notification not found.');
      }
      return ApiResponse.success(res, 'Marked as read.', updated);
    } catch (error) {
      return ApiResponse.serverError(res, error.message);
    }
  }

  static async markAllAsRead(req, res, next) {
    try {
      await NotificationService.markAllAsRead(req.user._id);
      return ApiResponse.success(res, 'All notifications marked as read.');
    } catch (error) {
      return ApiResponse.serverError(res, error.message);
    }
  }
}
