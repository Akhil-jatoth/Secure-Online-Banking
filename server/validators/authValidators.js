import { body } from 'express-validator';

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^~_\-+=<>.,/|\\])[A-Za-z\d@$!%*?&#^~_\-+=<>.,/|\\]{8,}$/;

export const registerValidator = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Invalid email address format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .matches(strongPasswordRegex)
    .withMessage('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('phoneNumber')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .isLength({ min: 7, max: 20 }).withMessage('Please enter a valid phone number'),
  body('dateOfBirth')
    .notEmpty().withMessage('Date of birth is required')
    .isISO8601().withMessage('Date of birth must be a valid date format (YYYY-MM-DD)'),
  body('address')
    .optional()
    .isObject().withMessage('Address must be an object'),
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

export const changePasswordValidator = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .matches(strongPasswordRegex)
    .withMessage('New password must be at least 8 characters and include uppercase, lowercase, number, and special character'),
  body('otp')
    .trim()
    .notEmpty().withMessage('OTP is required for password change')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
];

export const forgotPasswordValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
];

export const resetPasswordValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('otp')
    .trim()
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .matches(strongPasswordRegex)
    .withMessage('Password must be at least 8 characters and include uppercase, lowercase, number, and special character'),
];

export const verifyOtpValidator = [
  body('purpose')
    .notEmpty().withMessage('OTP purpose is required'),
  body('otp')
    .trim()
    .notEmpty().withMessage('OTP code is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
];
