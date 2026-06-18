import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { supabase } from '../services/supabase.service.js';

const router = Router();

/**
 * Helper — generate a random 8-character alphanumeric password
 */
function generateTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * @route   POST /api/patients
 * @desc    Physio creates a new patient account + profile
 * @access  Protected — physio role only
 */
router.post('/', requireAuth, requireRole('physio'), async (req, res) => {
  const { name, email, injury_type, notes } = req.body;
  const physioId = req.user.id;

  if (!name || !email || !injury_type) {
    return res.status(400).json({ error: 'name, email, and injury_type are required' });
  }

  const tempPassword = generateTempPassword();

  try {
    // 1. Create auth user via Admin API (bypasses email confirmation)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    });

    if (authError) {
      console.error('Auth admin createUser error:', authError);
      return res.status(400).json({ error: authError.message });
    }

    const newUserId = authData.user.id;

    // 2. Insert into profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{ id: newUserId, name, role: 'patient', phone: null }]);

    if (profileError) {
      console.error('Profile insert error:', profileError);
      // Attempt cleanup: delete the created auth user
      await supabase.auth.admin.deleteUser(newUserId);
      return res.status(400).json({ error: profileError.message });
    }

    // 3. Insert into patient_profiles
    const { data: patientProfile, error: patientError } = await supabase
      .from('patient_profiles')
      .insert([{
        user_id: newUserId,
        physio_id: physioId,
        injury_type,
        notes: notes || null,
      }])
      .select()
      .single();

    if (patientError) {
      console.error('Patient profile insert error:', patientError);
      return res.status(400).json({ error: patientError.message });
    }

    return res.status(201).json({
      patient_profile: patientProfile,
      credentials: {
        email,
        temp_password: tempPassword,
      },
    });
  } catch (err) {
    console.error('Unexpected error creating patient:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @route   GET /api/patients
 * @desc    Get all patients belonging to the logged-in physio
 * @access  Protected — physio role only
 */
router.get('/', requireAuth, requireRole('physio'), async (req, res) => {
  const physioId = req.user.id;

  try {
    const { data, error } = await supabase
      .from('patient_profiles')
      .select(`
        id,
        injury_type,
        start_date,
        notes,
        created_at,
        profiles:user_id ( id, name, role )
      `)
      .eq('physio_id', physioId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching patients:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.json(data);
  } catch (err) {
    console.error('Unexpected error fetching patients:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @route   GET /api/patients/:id
 * @desc    Get single patient details + their rehab plan if assigned
 * @access  Protected — physio role only
 */
router.get('/:id', requireAuth, requireRole('physio'), async (req, res) => {
  const { id } = req.params;
  const physioId = req.user.id;

  try {
    // Fetch patient profile (only if belonging to this physio)
    const { data: patient, error: patientError } = await supabase
      .from('patient_profiles')
      .select(`
        id,
        injury_type,
        start_date,
        notes,
        created_at,
        profiles:user_id ( id, name, role )
      `)
      .eq('id', id)
      .eq('physio_id', physioId)
      .maybeSingle();

    if (patientError) {
      return res.status(400).json({ error: patientError.message });
    }

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found or does not belong to you' });
    }

    // Fetch rehab plan + exercises
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
      .eq('patient_profile_id', id)
      .maybeSingle();

    if (planError) {
      console.error('Plan fetch error:', planError);
    }

    return res.json({ patient, plan: plan || null });
  } catch (err) {
    console.error('Unexpected error fetching patient detail:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
