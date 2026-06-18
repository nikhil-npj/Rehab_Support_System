import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { supabase } from '../services/supabase.service.js';

const router = Router();

/**
 * @route   POST /api/auth/profile
 * @desc    Create a user profile row linked to Supabase User ID
 * @access  Protected (Requires Supabase JWT)
 */
router.post('/profile', requireAuth, async (req, res) => {
  const { name, role, phone } = req.body;
  const userId = req.user.id;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  if (!role || (role !== 'patient' && role !== 'physio')) {
    return res.status(400).json({ error: 'Role must be either "patient" or "physio"' });
  }

  try {
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (existingProfile) {
      return res.status(409).json({ error: 'Profile already exists' });
    }

    // Insert profile
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          name,
          role,
          phone: phone || null
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase DB error inserting profile:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json(data);
  } catch (error) {
    console.error('Internal server error inserting profile:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Protected (Requires Supabase JWT)
 */
router.get('/me', requireAuth, async (req, res) => {
  const userId = req.user.id;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Supabase DB error fetching profile:', error);
      return res.status(400).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    return res.json(data);
  } catch (error) {
    console.error('Internal server error fetching profile:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
