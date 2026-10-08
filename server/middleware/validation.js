import { validationResult } from 'express-validator';
import { ApiResponse } from '../utils/apiResponse.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    return ApiResponse.badRequest(
      res,
      'Validation failed. Please check the input fields.',
      'VALIDATION_ERROR',
      formattedErrors
    );
  }
  next();
};
