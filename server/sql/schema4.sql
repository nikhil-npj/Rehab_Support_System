-- ============================================================
-- RehabTrack Schema v4 — AI Insights
-- Run this in Supabase SQL Editor after schema.sql, schema2.sql, schema3.sql
-- ============================================================

CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_profile_id UUID REFERENCES patient_profiles(id),
  physio_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL CHECK (type IN ('trend_summary', 'adherence_risk', 'recommendation')),
  ai_content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'edited', 'rejected')),
  final_content TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
