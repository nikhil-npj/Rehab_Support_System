import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { supabase } from '../services/supabase.service.js';

const router = Router();

/**
 * @route   POST /api/plans
 * @desc    Physio creates a rehab plan for a patient
 * @access  Protected — physio role only
 */
router.post('/', requireAuth, requireRole('physio'), async (req, res) => {
  const { patient_profile_id, dietary_notes, exercises } = req.body;
  const physioId = req.user.id;

  if (!patient_profile_id || !Array.isArray(exercises) || exercises.length === 0) {
    return res.status(400).json({ error: 'patient_profile_id and at least one exercise are required' });
  }

  try {
    // 1. Create the rehab plan
    const { data: plan, error: planError } = await supabase
      .from('rehab_plans')
      .insert([{
        patient_profile_id,
        physio_id: physioId,
        dietary_notes: dietary_notes || null,
      }])
      .select()
      .single();

    if (planError) {
      console.error('Error creating rehab plan:', planError);
      return res.status(400).json({ error: planError.message });
    }

    // 2. Insert all exercises for this plan
    const exerciseRows = exercises.map((ex) => ({
      rehab_plan_id: plan.id,
      exercise_id: ex.exercise_id,
      sets: ex.sets ?? 3,
      reps: ex.reps ?? 10,
      frequency: ex.frequency ?? 'Daily',
      duration_seconds: ex.duration_seconds ?? 30,
      notes: ex.notes ?? null,
    }));

    const { data: planExercises, error: exError } = await supabase
      .from('rehab_plan_exercises')
      .insert(exerciseRows)
      .select();

    if (exError) {
      console.error('Error inserting plan exercises:', exError);
      return res.status(400).json({ error: exError.message });
    }

    return res.status(201).json({ plan, exercises: planExercises });
  } catch (err) {
    console.error('Unexpected error creating plan:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @route   GET /api/plans/:patient_profile_id
 * @desc    Get rehab plan with exercises for a given patient profile
 * @access  Protected
 */
router.get('/:patient_profile_id', requireAuth, async (req, res) => {
  const { patient_profile_id } = req.params;

  try {
    const { data: plan, error } = await supabase
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
      .eq('patient_profile_id', patient_profile_id)
      .maybeSingle();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(plan || null);
  } catch (err) {
    console.error('Unexpected error fetching plan:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
