import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import {
  generateInsight,
  getPendingInsights,
  reviewInsight,
  getApprovedInsights,
} from '../controllers/insights.controller.js';

const router = Router();

// Physio routes
router.post('/generate', requireAuth, requireRole('physio'), generateInsight);
router.get('/pending', requireAuth, requireRole('physio'), getPendingInsights);
router.put('/:id/review', requireAuth, requireRole('physio'), reviewInsight);

// Patient routes
router.get('/approved', requireAuth, requireRole('patient'), getApprovedInsights);

export default router;
