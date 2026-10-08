import express from 'express';
import { AdminController } from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';

const router = express.Router();

// Strict RBAC: All admin routes require authenticated user with ADMIN role
router.use(authenticate, requireAdmin);

router.get('/dashboard', AdminController.getDashboard);
router.get('/users', AdminController.getUsers);
router.get('/users/:id', AdminController.getUserById);
router.patch('/accounts/:id/freeze', AdminController.freezeAccount);
router.patch('/accounts/:id/unfreeze', AdminController.unfreezeAccount);
router.get('/transactions', AdminController.getTransactions);
router.get('/audit-logs', AdminController.getAuditLogs);

export default router;
