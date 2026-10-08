import { ApiResponse } from '../utils/apiResponse.js';
import { ROLES } from '../utils/constants.js';

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return ApiResponse.unauthorized(res, 'Authentication required for role verification.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ApiResponse.forbidden(
        res,
        `Access denied. Role '${req.user.role}' is not authorized to access this resource.`,
        'ROLE_UNAUTHORIZED'
      );
    }

    next();
  };
};

export const requireAdmin = authorizeRoles(ROLES.ADMIN);
export const requireCustomer = authorizeRoles(ROLES.CUSTOMER);
