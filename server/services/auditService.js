import { AuditLog } from '../models/AuditLog.js';
import { logger } from '../config/logger.js';

export class AuditService {
  static async log({
    userId = null,
    userEmail = null,
    userRole = null,
    action,
    resource,
    resourceId = null,
    ipAddress = '127.0.0.1',
    userAgent = 'Unknown',
    status = 'SUCCESS',
    metadata = {},
  }) {
    try {
      const logEntry = await AuditLog.create({
        userId,
        userEmail,
        userRole,
        action,
        resource,
        resourceId: resourceId ? String(resourceId) : null,
        ipAddress,
        userAgent,
        status,
        metadata,
      });

      logger.security(action, {
        userId,
        resource,
        status,
        ipAddress,
      });

      return logEntry;
    } catch (error) {
      logger.error(`Failed to record audit log: ${error.message}`, { action, resource });
      // Non-blocking: audit failure should not crash main transaction unless critical
      return null;
    }
  }

  static async getLogs({ page = 1, limit = 20, action, status, search, startDate, endDate }) {
    const query = {};

    if (action) query.action = action;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { userEmail: { $regex: search, $options: 'i' } },
        { resource: { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } },
      ];
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      AuditLog.countDocuments(query),
    ]);

    return {
      logs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit) || 1,
      },
    };
  }
}
