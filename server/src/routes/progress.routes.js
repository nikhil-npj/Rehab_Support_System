import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { supabase } from '../services/supabase.service.js';

const router = Router();

/**
 * GET /api/progress
 * Returns last 14 days of recovery_scores for the logged-in patient
 */
router.get('/', requireAuth, requireRole('patient'), async (req, res) => {
  try {
    const { data: patientProfile, error: ppError } = await supabase
      .from('patient_profiles')
      .select('id')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (ppError) return res.status(400).json({ error: ppError.message });
    if (!patientProfile) return res.status(404).json({ error: 'Patient profile not found' });

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
    const startDate = fourteenDaysAgo.toISOString().split('T')[0];

    const { data: scores, error: scoreError } = await supabase
      .from('recovery_scores')
      .select('score_date, score, pain_level, mobility_level, adherence_score')
      .eq('patient_profile_id', patientProfile.id)
      .gte('score_date', startDate)
      .order('score_date', { ascending: true });

    if (scoreError) return res.status(400).json({ error: scoreError.message });

    return res.json(scores || []);
  } catch (err) {
    console.error('Error fetching progress:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
