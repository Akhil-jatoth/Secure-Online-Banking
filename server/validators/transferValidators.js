import { body } from 'express-validator';

export const transferValidator = [
  body('fromAccountId')
    .notEmpty().withMessage('Source account is required'),
  body('toAccountNumber')
    .optional({ checkFalsy: true })
    .isString().withMessage('Destination account number must be a string')
    .trim(),
  body('beneficiaryId')
    .optional({ checkFalsy: true })
    .isString().withMessage('Beneficiary ID must be a string'),
  body('amount')
    .notEmpty().withMessage('Transfer amount is required')
    .isFloat({ min: 0.01 }).withMessage('Transfer amount must be a positive number greater than zero'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Description cannot exceed 200 characters'),
  body('otp')
    .trim()
    .notEmpty().withMessage('OTP verification code is required for fund transfer')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
];
