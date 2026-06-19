import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { supabase } from '../services/supabase.service.js';

const router = Router();

/**
 * Helper — get patient_profile for logged-in user
 */
async function getPatientProfile(userId) {
  const { data, error } = await supabase
    .from('patient_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  return { data, error };
}

/**
 * POST /api/logs
 * Submit or update today's daily log
 */
router.post('/', requireAuth, requireRole('patient'), async (req, res) => {
  const { pain_level, mobility_level, exercise_completions } = req.body;

  if (!pain_level || !mobility_level) {
    return res.status(400).json({ error: 'pain_level and mobility_level are required' });
  }

  try {
    const { data: patientProfile, error: ppError } = await getPatientProfile(req.user.id);
    if (ppError) return res.status(400).json({ error: ppError.message });
    if (!patientProfile) return res.status(404).json({ error: 'Patient profile not found' });

    const today = new Date().toISOString().split('T')[0];
    const completions = Array.isArray(exercise_completions) ? exercise_completions : [];

    // Calculate adherence score
    const totalExercises = completions.length;
    const completedCount = completions.filter((e) => e.completed).length;
    const adherence_score = totalExercises > 0
      ? Math.round((completedCount / totalExercises) * 100)
      : 0;

    // Upsert daily_log
    const { data: dailyLog, error: logError } = await supabase
      .from('daily_logs')
      .upsert(
        {
          patient_profile_id: patientProfile.id,
          log_date: today,
          pain_level,
          mobility_level,
          adherence_score,
        },
        { onConflict: 'patient_profile_id,log_date' }
      )
      .select()
      .single();

    if (logError) {
      console.error('Daily log upsert error:', logError);
      return res.status(400).json({ error: logError.message });
    }

    // Replace exercise_logs
    if (completions.length > 0) {
      await supabase.from('exercise_logs').delete().eq('daily_log_id', dailyLog.id);

      const exerciseLogRows = completions.map((ex) => ({
        daily_log_id: dailyLog.id,
        exercise_id: ex.exercise_id,
        completed: ex.completed,
      }));

      const { error: exLogError } = await supabase.from('exercise_logs').insert(exerciseLogRows);
      if (exLogError) {
        console.error('Exercise log insert error:', exLogError);
        return res.status(400).json({ error: exLogError.message });
      }
    }

    // Calculate recovery score (0-100)
    const rawScore =
      (mobility_level * 0.4) +
      ((10 - pain_level) * 0.4) +
      ((adherence_score / 100) * 10 * 0.2);
    const recovery_score = Math.round(rawScore * 10);

    // Upsert recovery_score
    await supabase.from('recovery_scores').upsert(
      {
        patient_profile_id: patientProfile.id,
        score_date: today,
        score: recovery_score,
        pain_level,
        mobility_level,
        adherence_score,
      },
      { onConflict: 'patient_profile_id,score_date' }
    );

    return res.json({ daily_log: dailyLog, adherence_score, recovery_score });
  } catch (err) {
    console.error('Error submitting log:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET /api/logs/today
 * Returns today's daily_log + exercise_logs if they exist
 */
router.get('/today', requireAuth, requireRole('patient'), async (req, res) => {
  try {
    const { data: patientProfile, error: ppError } = await getPatientProfile(req.user.id);
    if (ppError) return res.status(400).json({ error: ppError.message });
    if (!patientProfile) return res.status(404).json({ error: 'Patient profile not found' });

    const today = new Date().toISOString().split('T')[0];

    const { data: dailyLog, error: logError } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('patient_profile_id', patientProfile.id)
      .eq('log_date', today)
      .maybeSingle();

    if (logError) return res.status(400).json({ error: logError.message });

    if (!dailyLog) {
      return res.json({ daily_log: null, exercise_logs: [] });
    }

    const { data: exerciseLogs, error: exError } = await supabase
      .from('exercise_logs')
      .select('*')
      .eq('daily_log_id', dailyLog.id);

    if (exError) return res.status(400).json({ error: exError.message });

    return res.json({ daily_log: dailyLog, exercise_logs: exerciseLogs || [] });
  } catch (err) {
    console.error("Error fetching today's log:", err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
