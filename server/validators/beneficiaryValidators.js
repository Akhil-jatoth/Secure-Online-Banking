import { body } from 'express-validator';

export const createBeneficiaryValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Beneficiary name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('accountNumber')
    .trim()
    .notEmpty().withMessage('Account number is required')
    .isLength({ min: 6, max: 34 }).withMessage('Account number must be between 6 and 34 characters'),
  body('bankName')
    .trim()
    .notEmpty().withMessage('Bank name is required'),
  body('routingNumber')
    .trim()
    .notEmpty().withMessage('Routing/IFSC identifier is required'),
  body('nickname')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Nickname cannot exceed 50 characters'),
  body('otp')
    .trim()
    .notEmpty().withMessage('OTP verification code is required to add beneficiary')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
];

export const updateBeneficiaryValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('nickname')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Nickname cannot exceed 50 characters'),
  body('bankName')
    .optional()
    .trim(),
  body('routingNumber')
    .optional()
    .trim(),
];
