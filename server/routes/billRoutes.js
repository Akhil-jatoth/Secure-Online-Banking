import express from 'express';
import { BillController } from '../controllers/billController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { payBillValidator } from '../validators/billValidators.js';

const router = express.Router();

router.use(authenticate);

router.get('/', BillController.getBills);
router.post('/pay', payBillValidator, validate, BillController.payBill);

export default router;
