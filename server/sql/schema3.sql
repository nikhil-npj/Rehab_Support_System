-- ============================================================
-- RehabTrack Schema v3
-- Run this in Supabase SQL Editor after schema2.sql
-- ============================================================

-- Daily logs: one row per patient per day
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_profile_id UUID REFERENCES patient_profiles(id),
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  pain_level INT CHECK (pain_level BETWEEN 1 AND 10),
  mobility_level INT CHECK (mobility_level BETWEEN 1 AND 10),
  adherence_score NUMERIC,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(patient_profile_id, log_date)
);

-- Exercise completion log for each daily log
CREATE TABLE exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_log_id UUID REFERENCES daily_logs(id),
  exercise_id UUID REFERENCES exercises(id),
  completed BOOLEAN DEFAULT FALSE
);

-- Recovery score per patient per day (computed metric)
CREATE TABLE recovery_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_profile_id UUID REFERENCES patient_profiles(id),
  score_date DATE NOT NULL DEFAULT CURRENT_DATE,
  score NUMERIC NOT NULL,
  pain_level INT,
  mobility_level INT,
  adherence_score NUMERIC,
  UNIQUE(patient_profile_id, score_date)
);
