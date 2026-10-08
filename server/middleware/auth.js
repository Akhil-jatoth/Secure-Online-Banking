import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return ApiResponse.unauthorized(res, 'Authentication token missing. Please log in.', 'AUTH_TOKEN_MISSING');
    }

    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_academic_secure_bank_2026_production_grade_random_seed_994821049';
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return ApiResponse.unauthorized(res, 'Session expired. Please log in again.', 'TOKEN_EXPIRED');
      }
      return ApiResponse.unauthorized(res, 'Invalid authentication token.', 'INVALID_TOKEN');
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return ApiResponse.unauthorized(res, 'User no longer exists.', 'USER_NOT_FOUND');
    }

    if (user.isLocked()) {
      return ApiResponse.forbidden(res, 'Account is temporarily locked due to multiple failed login attempts. Please try again later.', 'ACCOUNT_LOCKED');
    }

    // Attach user and token payload to request object
    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;

    next();
  } catch (error) {
    return ApiResponse.serverError(res, `Authentication error: ${error.message}`);
  }
};

export const optionalAuthenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_academic_secure_bank_2026_production_grade_random_seed_994821049';
      try {
        const decoded = jwt.verify(token, secret);
        const user = await User.findById(decoded.id);
        if (user && !user.isLocked()) {
          req.user = user;
          req.userId = user._id;
          req.userRole = user.role;
        }
      } catch {
        // Token invalid or expired, continue without req.user
      }
    }
    next();
  } catch {
    next();
  }
};
