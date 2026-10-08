import express from 'express';
import { BeneficiaryController } from '../controllers/beneficiaryController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import {
  createBeneficiaryValidator,
  updateBeneficiaryValidator,
} from '../validators/beneficiaryValidators.js';

const router = express.Router();

router.use(authenticate);

router.get('/', BeneficiaryController.getBeneficiaries);
router.post('/', createBeneficiaryValidator, validate, BeneficiaryController.addBeneficiary);
router.put('/:id', updateBeneficiaryValidator, validate, BeneficiaryController.updateBeneficiary);
router.delete('/:id', BeneficiaryController.deleteBeneficiary);

export default router;
