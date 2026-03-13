import { Router } from 'express';
import {
  listPharmacies,
  createPharmacy,
  updatePharmacy,
  deletePharmacy,
} from '../controllers/pharmacyController';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.get('/', requireAuth, listPharmacies);
router.post('/', requireAuth, requireRole('manager'), createPharmacy);
router.patch('/:id', requireAuth, requireRole('manager'), updatePharmacy);
router.delete('/:id', requireAuth, requireRole('manager'), deletePharmacy);

export default router;
