import { Router } from 'express';
import {
  listSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from '../controllers/scheduleController';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.get('/', requireAuth, listSchedules);
router.post('/', requireAuth, requireRole('manager'), createSchedule);
router.patch('/:id', requireAuth, updateSchedule);
router.delete('/:id', requireAuth, requireRole('manager'), deleteSchedule);

export default router;
