import express from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validation.js';
import {
  registerValidator,
  loginValidator,
  changePasswordValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  verifyOtpValidator,
} from '../validators/authValidators.js';

const router = express.Router();

router.post('/register', authLimiter, registerValidator, validate, AuthController.register);
router.post('/login', authLimiter, loginValidator, validate, AuthController.login);
router.post('/logout', authenticate, AuthController.logout);
router.get('/me', authenticate, AuthController.getMe);
router.post('/request-otp', optionalAuthenticate, AuthController.requestOTP);
router.post('/verify-otp', optionalAuthenticate, verifyOtpValidator, validate, AuthController.verifyOTP);
router.post('/forgot-password', authLimiter, forgotPasswordValidator, validate, AuthController.forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordValidator, validate, AuthController.resetPassword);
router.post('/change-password', authenticate, changePasswordValidator, validate, AuthController.changePassword);

export default router;
