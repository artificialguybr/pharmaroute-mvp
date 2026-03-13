import { Router } from 'express';
import { listSellers, createSeller, updateSeller } from '../controllers/sellerController';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.get('/', requireAuth, requireRole('manager'), listSellers);
router.post('/', requireAuth, requireRole('manager'), createSeller);
router.patch('/:id', requireAuth, requireRole('manager'), updateSeller);

export default router;
