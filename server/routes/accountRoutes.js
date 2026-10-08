import express from 'express';
import { AccountController } from '../controllers/accountController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', AccountController.getAccounts);
router.post('/open', AccountController.openAccount);
router.get('/:id', AccountController.getAccountById);
router.get('/:id/balance', AccountController.getAccountBalance);

export default router;
