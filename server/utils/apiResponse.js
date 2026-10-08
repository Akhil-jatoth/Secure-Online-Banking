export class ApiResponse {
  static success(res, message = 'Success', data = {}, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(res, message = 'An error occurred', statusCode = 400, errorCode = 'ERROR', errors = []) {
    return res.status(statusCode).json({
      success: false,
      message,
      errorCode,
      errors: errors.length > 0 ? errors : undefined,
    });
  }

  static unauthorized(res, message = 'Unauthorized access', errorCode = 'UNAUTHORIZED') {
    return this.error(res, message, 401, errorCode);
  }

  static forbidden(res, message = 'Forbidden: Insufficient privileges', errorCode = 'FORBIDDEN') {
    return this.error(res, message, 403, errorCode);
  }

  static notFound(res, message = 'Resource not found', errorCode = 'NOT_FOUND') {
    return this.error(res, message, 404, errorCode);
  }

  static badRequest(res, message = 'Bad request', errorCode = 'BAD_REQUEST', errors = []) {
    return this.error(res, message, 400, errorCode, errors);
  }

  static serverError(res, message = 'Internal server error', errorCode = 'SERVER_ERROR') {
    return this.error(res, message, 500, errorCode);
  }
}
