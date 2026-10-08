import express from 'express';
import { StatementController } from '../controllers/statementController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', StatementController.getStatementSummary);
router.get('/download', StatementController.downloadStatement);

export default router;
