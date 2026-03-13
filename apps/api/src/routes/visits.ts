import { Router } from 'express';
import { getPharmacyVisits, createVisit } from '../controllers/visitController';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.get('/pharmacy/:pharmacyId', requireAuth, getPharmacyVisits);
router.post('/', requireAuth, requireRole('seller'), createVisit);

export default router;
