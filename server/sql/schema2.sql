-- ============================================================
-- RehabTrack Schema v2
-- Run this in Supabase SQL Editor after schema.sql
-- ============================================================

-- Patient profiles (created by physios on behalf of patients)
CREATE TABLE patient_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  physio_id UUID REFERENCES profiles(id),
  injury_type TEXT NOT NULL,
  start_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Exercise library
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  injury_types TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Rehab plans assigned to patients
CREATE TABLE rehab_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_profile_id UUID REFERENCES patient_profiles(id),
  physio_id UUID REFERENCES profiles(id),
  dietary_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Exercises within a rehab plan
CREATE TABLE rehab_plan_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rehab_plan_id UUID REFERENCES rehab_plans(id),
  exercise_id UUID REFERENCES exercises(id),
  sets INT DEFAULT 3,
  reps INT DEFAULT 10,
  frequency TEXT DEFAULT 'Daily',
  duration_seconds INT DEFAULT 30,
  notes TEXT
);

-- ============================================================
-- Seed: 15 common physiotherapy exercises
-- ============================================================

INSERT INTO exercises (name, description, injury_types) VALUES
  (
    'Quad Sets',
    'Lie flat on your back with your leg straight. Tighten the quadriceps muscle by pressing the back of your knee down toward the floor. Hold for 5 seconds, then relax. Repeat.',
    ARRAY['ACL', 'disc_bulge']
  ),
  (
    'Straight Leg Raise',
    'Lie on your back. Keep one leg straight and raise it to the height of the opposite bent knee. Hold 2 seconds at the top, then slowly lower. Builds quad strength without stressing the knee joint.',
    ARRAY['ACL']
  ),
  (
    'Heel Slides',
    'Lie on your back with legs straight. Slowly slide your heel toward your buttocks by bending your knee as far as comfortable, then slide back. Great for restoring knee flexion range of motion.',
    ARRAY['ACL', 'ankle_sprain']
  ),
  (
    'Short Arc Quads',
    'Lie on your back with a rolled towel under the injured knee. Straighten the knee fully by lifting the heel off the floor, hold 5 seconds, then slowly lower. Targets the end-range quad strength.',
    ARRAY['ACL']
  ),
  (
    'Glute Bridges',
    'Lie on your back with knees bent and feet flat. Squeeze your glutes and lift your hips off the floor until your body forms a straight line from shoulders to knees. Hold 2 seconds, then lower slowly.',
    ARRAY['ACL', 'disc_bulge', 'shoulder']
  ),
  (
    'Clamshells',
    'Lie on your side with hips and knees bent at 45°. Keep feet together and rotate the top knee upward like a clamshell opening, without rolling the pelvis back. Strengthens hip abductors and external rotators.',
    ARRAY['ACL', 'disc_bulge']
  ),
  (
    'Calf Raises',
    'Stand near a wall or chair for balance. Rise up onto your toes as high as you can, hold briefly, then slowly lower. Can be done on one or both legs. Strengthens the calf muscles and improves ankle stability.',
    ARRAY['ankle_sprain', 'ACL']
  ),
  (
    'Ankle Alphabet',
    'Sit in a chair with your foot elevated. Using only your ankle (not your leg), trace each letter of the alphabet in the air. This exercise improves ankle range of motion and proprioception.',
    ARRAY['ankle_sprain']
  ),
  (
    'Towel Toe Curls',
    'Sit in a chair with a small towel flat on the floor. Use your toes to scrunch the towel toward you, then spread it back out. Strengthens intrinsic foot muscles and improves ankle support.',
    ARRAY['ankle_sprain']
  ),
  (
    'Single Leg Balance',
    'Stand on one foot near a wall or chair for safety. Try to balance for 30 seconds. Progress by closing your eyes or standing on a folded towel for an unstable surface. Improves proprioception after ankle injury.',
    ARRAY['ankle_sprain', 'ACL']
  ),
  (
    'Shoulder Pendulum',
    'Lean forward, supporting yourself with your non-injured arm on a table. Let your injured arm hang freely and swing it gently in small circles (clockwise and counterclockwise). Relieves shoulder joint compression.',
    ARRAY['shoulder']
  ),
  (
    'Wall Slides',
    'Stand with your back flat against a wall. With your arms at shoulder height and elbows bent 90°, slowly slide your arms overhead as far as comfortable, then lower back down. Improves shoulder mobility and posture.',
    ARRAY['shoulder', 'disc_bulge']
  ),
  (
    'Doorway Chest Stretch',
    'Stand in a doorway and place your forearms on the door frame. Gently lean forward until you feel a stretch across your chest and the front of your shoulders. Holds 30 seconds. Counteracts forward shoulder posture.',
    ARRAY['shoulder']
  ),
  (
    'Bird Dog',
    'Start on hands and knees (tabletop position). Simultaneously extend your right arm forward and your left leg behind you, keeping your back flat and core engaged. Hold 3 seconds, then alternate sides. Stabilises the lumbar spine.',
    ARRAY['disc_bulge', 'ACL']
  ),
  (
    'Hamstring Stretch (Supine)',
    'Lie on your back. Lift one leg and hold behind the thigh. Gently straighten the knee until you feel a stretch in the back of the thigh. Hold 30 seconds. Relieves tension on the lumbar discs and sciatic nerve.',
    ARRAY['disc_bulge', 'ACL']
  );
