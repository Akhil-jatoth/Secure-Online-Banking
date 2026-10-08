import express from 'express';
import { TransactionController } from '../controllers/transactionController.js';
import { authenticate } from '../middleware/auth.js';
import { transferLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validation.js';
import { transferValidator } from '../validators/transferValidators.js';

const router = express.Router();

router.use(authenticate);

router.get('/', TransactionController.getTransactions);
router.post('/transfer', transferLimiter, transferValidator, validate, TransactionController.transfer);
router.get('/:id', TransactionController.getTransactionById);

export default router;
