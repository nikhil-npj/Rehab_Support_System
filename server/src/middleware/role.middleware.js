import { supabase } from '../services/supabase.service.js';

/**
 * Middleware factory — restricts route access to a specific role.
 * Usage: requireRole('physio') or requireRole('patient')
 *
 * Requires requireAuth to have already run (req.user must be set).
 */
export const requireRole = (role) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: No authenticated user' });
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Role check DB error:', error);
        return res.status(500).json({ error: 'Internal Server Error during role check' });
      }

      if (!profile) {
        return res.status(403).json({ error: 'Forbidden: Profile not found' });
      }

      if (profile.role !== role) {
        return res.status(403).json({
          error: `Forbidden: This route requires the '${role}' role. Your role is '${profile.role}'.`
        });
      }

      // Attach role to req for downstream use
      req.userRole = profile.role;
      next();
    } catch (err) {
      console.error('Error in requireRole middleware:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };
};
