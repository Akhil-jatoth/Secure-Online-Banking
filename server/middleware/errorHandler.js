import { logger } from '../config/logger.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(`Unhandled Error [${req.method} ${req.url}]: ${err.message}`, {
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return ApiResponse.badRequest(
      res,
      `A record with this ${field} already exists.`,
      'DUPLICATE_KEY_ERROR'
    );
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return ApiResponse.badRequest(res, 'Validation failed.', 'MONGOOSE_VALIDATION_ERROR', errors);
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.unauthorized(res, 'Invalid token provided.', 'INVALID_JWT');
  }

  if (err.name === 'TokenExpiredError') {
    return ApiResponse.unauthorized(res, 'Token has expired.', 'EXPIRED_JWT');
  }

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'An unexpected internal server error occurred.'
    : err.message || 'Internal Server Error';

  return ApiResponse.error(res, message, statusCode, err.errorCode || 'INTERNAL_SERVER_ERROR');
};
