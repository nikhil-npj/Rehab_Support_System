import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { supabase } from '../services/supabase.service.js';

const router = Router();

/**
 * @route   GET /api/patient/plan
 * @desc    Get the logged-in patient's assigned rehab plan
 * @access  Protected — patient role only
 */
router.get('/plan', requireAuth, requireRole('patient'), async (req, res) => {
  try {
    // 1. Get patient_profile for this user
    const { data: patientProfile, error: ppError } = await supabase
      .from('patient_profiles')
      .select('id, physio_id, injury_type, start_date, notes')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (ppError) return res.status(400).json({ error: ppError.message });
    if (!patientProfile) return res.status(404).json({ error: 'Patient profile not found' });

    // 2. Get physio name
    const { data: physioProfile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', patientProfile.physio_id)
      .maybeSingle();

    // 3. Get the rehab plan with exercises joined
    const { data: plan, error: planError } = await supabase
      .from('rehab_plans')
      .select(`
        id,
        dietary_notes,
        created_at,
        rehab_plan_exercises (
          id,
          sets,
          reps,
          frequency,
          duration_seconds,
          notes,
          exercises ( id, name, description, injury_types )
        )
      `)
      .eq('patient_profile_id', patientProfile.id)
      .maybeSingle();

    if (planError) return res.status(400).json({ error: planError.message });

    return res.json({
      patient_profile: patientProfile,
      physio_name: physioProfile?.name || 'Your Physiotherapist',
      plan: plan || null,
    });
  } catch (err) {
    console.error('Error fetching patient plan:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
