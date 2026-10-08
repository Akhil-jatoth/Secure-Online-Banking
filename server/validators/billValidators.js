import { body } from 'express-validator';
import { BILL_CATEGORIES } from '../utils/constants.js';

export const payBillValidator = [
  body('accountId')
    .notEmpty().withMessage('Source account is required'),
  body('category')
    .notEmpty().withMessage('Bill category is required')
    .isIn(Object.values(BILL_CATEGORIES)).withMessage('Invalid bill category'),
  body('billerName')
    .trim()
    .notEmpty().withMessage('Biller name is required'),
  body('consumerNumber')
    .trim()
    .notEmpty().withMessage('Consumer / account reference number is required'),
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0.01 }).withMessage('Bill amount must be greater than zero'),
];
