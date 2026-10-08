import { Notification } from '../models/Notification.js';
import { logger } from '../config/logger.js';

export class NotificationService {
  static async create({ userId, title, message, type = 'GENERAL', metadata = {} }) {
    try {
      const notification = await Notification.create({
        user: userId,
        title,
        message,
        type,
        metadata,
      });
      return notification;
    } catch (error) {
      logger.error(`Failed to create notification for user ${userId}: ${error.message}`);
      return null;
    }
  }

  static async getUserNotifications(userId, { page = 1, limit = 20, unreadOnly = false }) {
    const query = { user: userId };
    if (unreadOnly) {
      query.isRead = false;
    }

    const skip = (page - 1) * limit;
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Notification.countDocuments(query),
      Notification.countDocuments({ user: userId, isRead: false }),
    ]);

    return {
      notifications,
      unreadCount,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async markAsRead(notificationId, userId) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true },
      { new: true }
    );
  }

  static async markAllAsRead(userId) {
    return Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
  }
}
