import express from 'express';
import authRoutes from './authRoutes.js';
import accountRoutes from './accountRoutes.js';
import transactionRoutes from './transactionRoutes.js';
import beneficiaryRoutes from './beneficiaryRoutes.js';
import billRoutes from './billRoutes.js';
import statementRoutes from './statementRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import profileRoutes from './profileRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    system: 'Aegis Secure Online Banking Simulation API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

router.use('/auth', authRoutes);
router.use('/accounts', accountRoutes);
router.use('/transactions', transactionRoutes);
router.use('/beneficiaries', beneficiaryRoutes);
router.use('/bills', billRoutes);
router.use('/statements', statementRoutes);
router.use('/notifications', notificationRoutes);
router.use('/profile', profileRoutes);
router.use('/admin', adminRoutes);

export default router;
