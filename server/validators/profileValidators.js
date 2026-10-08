import { body } from 'express-validator';

export const updateProfileValidator = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
  body('phoneNumber')
    .optional()
    .trim()
    .isLength({ min: 7, max: 20 }).withMessage('Please enter a valid phone number'),
  body('address')
    .optional()
    .isObject().withMessage('Address must be an object'),
];
