import express from 'express';
import { ProfileController } from '../controllers/profileController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { updateProfileValidator } from '../validators/profileValidators.js';

const router = express.Router();

router.use(authenticate);

router.get('/', ProfileController.getProfile);
router.put('/', updateProfileValidator, validate, ProfileController.updateProfile);

export default router;
