import { supabase } from '../services/supabase.service.js';
import { generatePatientInsight } from '../services/groq.service.js';

// ─── POST /api/insights/generate ─────────────────────────────────────────────
// Physio only: generate an AI insight for a patient and save as pending
export const generateInsight = async (req, res) => {
  try {
    const { patient_profile_id } = req.body;
    const physioId = req.user.id;

    if (!patient_profile_id) {
      return res.status(400).json({ error: 'patient_profile_id is required' });
    }

    // 1. Fetch patient profile + their name from profiles
    const { data: patientProfile, error: profileErr } = await supabase
      .from('patient_profiles')
      .select('id, injury_type, user_id, profiles:user_id(name)')
      .eq('id', patient_profile_id)
      .maybeSingle();

    if (profileErr || !patientProfile) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const patientName = patientProfile.profiles?.name || 'Unknown';
    const injuryType = patientProfile.injury_type;

    // 2. Fetch last 14 days of daily_logs for this patient
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const fromDate = fourteenDaysAgo.toISOString().split('T')[0];

    const { data: dailyLogs, error: logsErr } = await supabase
      .from('daily_logs')
      .select('log_date, pain_level, mobility_level, adherence_score')
      .eq('patient_profile_id', patient_profile_id)
      .gte('log_date', fromDate)
      .order('log_date', { ascending: true });

    if (logsErr) {
      console.error('Error fetching daily logs:', logsErr);
      return res.status(500).json({ error: 'Failed to fetch patient logs' });
    }

    // 3. Fetch last 14 days of recovery_scores
    const { data: recoveryScores, error: recoveryErr } = await supabase
      .from('recovery_scores')
      .select('score_date, score')
      .eq('patient_profile_id', patient_profile_id)
      .gte('score_date', fromDate)
      .order('score_date', { ascending: true });

    if (recoveryErr) {
      console.error('Error fetching recovery scores:', recoveryErr);
      return res.status(500).json({ error: 'Failed to fetch recovery scores' });
    }

    // 4. Validate: must have at least 1 log
    if (!dailyLogs || dailyLogs.length < 1) {
      return res.status(422).json({
        error: 'Not enough data yet. Patient needs to log at least 1 session.',
      });
    }

    // 5. Calculate averages
    const totalSessionsLogged = dailyLogs.length;
    const averageAdherence =
      Math.round(
        dailyLogs.reduce((sum, l) => sum + (l.adherence_score || 0), 0) / totalSessionsLogged
      );
    const avgRecoveryRaw =
      recoveryScores && recoveryScores.length > 0
        ? recoveryScores.reduce((sum, r) => sum + (r.score || 0), 0) / recoveryScores.length
        : 0;
    const averageRecovery = Math.round(avgRecoveryRaw);

    // 6. Call Gemini
    let aiContent;
    try {
      aiContent = await generatePatientInsight({
        patientName,
        injuryType,
        last14DaysLogs: dailyLogs,
        last14DaysRecovery: recoveryScores || [],
        averageAdherence,
        averageRecovery,
        totalSessionsLogged,
      });
    } catch (groqErr) {
      console.error('Groq API error:', groqErr);
      return res.status(502).json({
        error: 'AI generation failed. Please check your GROQ_API_KEY and try again.',
        detail: groqErr.message,
      });
    }

    // 7. Save to ai_insights
    const { data: insight, error: insertErr } = await supabase
      .from('ai_insights')
      .insert({
        patient_profile_id,
        physio_id: physioId,
        type: 'trend_summary',
        ai_content: aiContent,
        status: 'pending',
      })
      .select()
      .single();

    if (insertErr) {
      console.error('Error saving insight:', insertErr);
      return res.status(500).json({ error: 'Failed to save insight' });
    }

    return res.status(201).json(insight);
  } catch (err) {
    console.error('generateInsight error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ─── GET /api/insights/pending ────────────────────────────────────────────────
// Physio only: returns all pending insights for this physio's patients
export const getPendingInsights = async (req, res) => {
  try {
    const physioId = req.user.id;

    const { data: insights, error } = await supabase
      .from('ai_insights')
      .select(`
        id, type, ai_content, status, created_at,
        patient_profiles:patient_profile_id (
          id, injury_type,
          profiles:user_id ( name )
        )
      `)
      .eq('physio_id', physioId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending insights:', error);
      return res.status(500).json({ error: 'Failed to fetch pending insights' });
    }

    return res.status(200).json(insights || []);
  } catch (err) {
    console.error('getPendingInsights error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ─── PUT /api/insights/:id/review ─────────────────────────────────────────────
// Physio only: approve, edit, or reject an insight
export const reviewInsight = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, final_content } = req.body;
    const physioId = req.user.id;

    if (!['approve', 'edit', 'reject'].includes(action)) {
      return res.status(400).json({ error: "action must be 'approve', 'edit', or 'reject'" });
    }

    // Fetch original insight to get ai_content for approve
    const { data: existing, error: fetchErr } = await supabase
      .from('ai_insights')
      .select('ai_content, status')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr || !existing) {
      return res.status(404).json({ error: 'Insight not found' });
    }

    const now = new Date().toISOString();
    let updatePayload = { reviewed_by: physioId, reviewed_at: now };

    if (action === 'approve') {
      updatePayload.status = 'approved';
      updatePayload.final_content = existing.ai_content;
    } else if (action === 'edit') {
      if (!final_content || !final_content.trim()) {
        return res.status(400).json({ error: 'final_content is required for edit action' });
      }
      updatePayload.status = 'edited';
      updatePayload.final_content = final_content.trim();
    } else if (action === 'reject') {
      updatePayload.status = 'rejected';
    }

    const { data: updated, error: updateErr } = await supabase
      .from('ai_insights')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updateErr) {
      console.error('Error updating insight:', updateErr);
      return res.status(500).json({ error: 'Failed to update insight' });
    }

    return res.status(200).json(updated);
  } catch (err) {
    console.error('reviewInsight error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ─── GET /api/insights/approved ───────────────────────────────────────────────
// Patient only: returns approved/edited insights for the logged-in patient
export const getApprovedInsights = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get patient's profile id
    const { data: patientProfile, error: profileErr } = await supabase
      .from('patient_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileErr) {
      console.error('Error fetching patient profile:', profileErr);
      return res.status(500).json({ error: 'Failed to fetch patient profile' });
    }

    if (!patientProfile) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const { data: insights, error } = await supabase
      .from('ai_insights')
      .select('id, type, final_content, status, created_at, reviewed_at')
      .eq('patient_profile_id', patientProfile.id)
      .in('status', ['approved', 'edited'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching approved insights:', error);
      return res.status(500).json({ error: 'Failed to fetch insights' });
    }

    return res.status(200).json(insights || []);
  } catch (err) {
    console.error('getApprovedInsights error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
