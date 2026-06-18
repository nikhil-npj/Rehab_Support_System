import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { supabase } from '../services/supabase.service.js';

const router = Router();

/**
 * @route   GET /api/exercises
 * @desc    Get all exercises, with optional ?injury_type= filter
 * @access  Protected
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    let query = supabase
      .from('exercises')
      .select('*')
      .order('name', { ascending: true });

    if (req.query.injury_type) {
      // Filter: injury_types array contains the requested type
      query = query.contains('injury_types', [req.query.injury_type]);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching exercises:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.json(data);
  } catch (err) {
    console.error('Unexpected error fetching exercises:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
