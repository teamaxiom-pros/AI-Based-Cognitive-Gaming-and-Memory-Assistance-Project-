-- ==============================================================================
-- Team Axiom Cognitive Care - Complete Production Supabase Migrations
-- Target: SIH 2026 AI-Based Cognitive Gaming and Memory Assistance Platform
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Linked to Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('patient', 'caregiver', 'admin')),
    language TEXT NOT NULL DEFAULT 'en',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Patient Profiles Table
CREATE TABLE IF NOT EXISTS public.patient_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL,
    name TEXT NOT NULL,
    age INTEGER NOT NULL DEFAULT 68,
    gender TEXT DEFAULT 'Female',
    location TEXT DEFAULT 'Guwahati, Assam',
    region TEXT DEFAULT 'Guwahati, Assam (NER)',
    preferred_language TEXT NOT NULL DEFAULT 'en',
    cognitive_baseline TEXT DEFAULT 'Mild Cognitive Support',
    focus_domain TEXT DEFAULT 'memory',
    interests TEXT[] DEFAULT '{}',
    invite_code TEXT UNIQUE,
    has_completed_assessment BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Patient Caregivers Linking Table
CREATE TABLE IF NOT EXISTS public.patient_caregivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL,
    caregiver_id UUID NOT NULL,
    relationship TEXT NOT NULL DEFAULT 'Family Caregiver',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'revoked')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (patient_id, caregiver_id)
);

-- 4. Assessment Sessions Table
CREATE TABLE IF NOT EXISTS public.assessment_sessions (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    session_number INTEGER NOT NULL DEFAULT 1,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    overall_score INTEGER NOT NULL,
    focus_domain TEXT NOT NULL,
    ai_summary TEXT,
    clinical_notes TEXT,
    recommended_activities TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Assessment Responses Table (Stores raw individual task performance)
CREATE TABLE IF NOT EXISTS public.assessment_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_session_id TEXT NOT NULL,
    task_id TEXT NOT NULL,
    domain TEXT NOT NULL,
    task_title TEXT,
    task_type TEXT,
    expected_answer TEXT,
    patient_answer TEXT,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    score INTEGER NOT NULL DEFAULT 0,
    response_time_ms INTEGER NOT NULL DEFAULT 0,
    hints_used INTEGER NOT NULL DEFAULT 0,
    skipped BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Cognitive Baselines Table (Authoritative Axiom AI Baselines)
CREATE TABLE IF NOT EXISTS public.cognitive_baselines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id TEXT NOT NULL,
    assessment_session_id TEXT,
    overall_score INTEGER NOT NULL,
    focus_domain TEXT NOT NULL,
    memory_score INTEGER NOT NULL,
    attention_score INTEGER NOT NULL,
    executive_function_score INTEGER NOT NULL,
    recognition_score INTEGER NOT NULL,
    domain_scores JSONB DEFAULT '{}'::jsonb,
    raw_ai_baseline JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. AI Recommendations Table
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id TEXT NOT NULL,
    focus_domain TEXT NOT NULL,
    activity TEXT NOT NULL,
    difficulty INTEGER NOT NULL DEFAULT 1,
    performance_snapshot JSONB DEFAULT '{}'::jsonb,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Game Sessions Table
CREATE TABLE IF NOT EXISTS public.game_sessions (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    game_id TEXT NOT NULL,
    game_title TEXT NOT NULL,
    domain TEXT NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    difficulty_tier INTEGER NOT NULL DEFAULT 1,
    score INTEGER NOT NULL DEFAULT 0,
    accuracy FLOAT NOT NULL DEFAULT 0,
    duration_seconds FLOAT NOT NULL DEFAULT 0,
    hints_used INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Daily Routines Table
CREATE TABLE IF NOT EXISTS public.routines (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    time_block TEXT NOT NULL DEFAULT 'Morning',
    scheduled_time TEXT NOT NULL,
    icon TEXT DEFAULT 'Sun',
    recurrence TEXT NOT NULL DEFAULT 'daily',
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Medicines Table
CREATE TABLE IF NOT EXISTS public.medicines (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    schedule TEXT NOT NULL DEFAULT 'Morning',
    time TEXT NOT NULL,
    instructions TEXT,
    purpose TEXT,
    pill_color TEXT DEFAULT 'teal',
    pill_shape TEXT DEFAULT 'round',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    is_taken_today BOOLEAN NOT NULL DEFAULT FALSE,
    taken_at TEXT,
    history_7days BOOLEAN[] DEFAULT '{true, true, true, true, true, true, false}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    title TEXT NOT NULL,
    doctor_name TEXT NOT NULL,
    specialty TEXT NOT NULL DEFAULT 'Neurologist',
    location TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    notes TEXT,
    reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Notifications / Alerts Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    category TEXT NOT NULL DEFAULT 'general',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    scheduled_at TIMESTAMPTZ DEFAULT NOW(),
    read BOOLEAN NOT NULL DEFAULT FALSE,
    action_label TEXT,
    action_route TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Memories Table
CREATE TABLE IF NOT EXISTS public.memories (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    image_url TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Assistant Conversations Table
CREATE TABLE IF NOT EXISTS public.assistant_conversations (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    title TEXT DEFAULT 'Axiom Assistant Chat',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Assistant Messages Table (Persistent Chat History)
CREATE TABLE IF NOT EXISTS public.assistant_messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    patient_id TEXT NOT NULL,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
    content TEXT NOT NULL,
    intent TEXT,
    action_target TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES for High-Performance Queries
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_patient_profiles_user_id ON public.patient_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_patient_profiles_invite_code ON public.patient_profiles(invite_code);
CREATE INDEX IF NOT EXISTS idx_patient_caregivers_patient_id ON public.patient_caregivers(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_caregivers_caregiver_id ON public.patient_caregivers(caregiver_id);
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_patient_id ON public.assessment_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_session_id ON public.assessment_responses(assessment_session_id);
CREATE INDEX IF NOT EXISTS idx_cognitive_baselines_patient_id ON public.cognitive_baselines(patient_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_patient_id ON public.ai_recommendations(patient_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_patient_id ON public.game_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_routines_patient_id ON public.routines(patient_id);
CREATE INDEX IF NOT EXISTS idx_medicines_patient_id ON public.medicines(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_patient_id ON public.notifications(patient_id);
CREATE INDEX IF NOT EXISTS idx_memories_patient_id ON public.memories(patient_id);
CREATE INDEX IF NOT EXISTS idx_assistant_conversations_patient_id ON public.assistant_conversations(patient_id);
CREATE INDEX IF NOT EXISTS idx_assistant_messages_conversation_id ON public.assistant_messages(conversation_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_caregivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cognitive_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_messages ENABLE ROW LEVEL SECURITY;

-- Allow authenticated and service access
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow all for profiles" ON public.profiles;
    CREATE POLICY "Allow all for profiles" ON public.profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for patient_profiles" ON public.patient_profiles;
    CREATE POLICY "Allow all for patient_profiles" ON public.patient_profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for patient_caregivers" ON public.patient_caregivers;
    CREATE POLICY "Allow all for patient_caregivers" ON public.patient_caregivers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for assessment_sessions" ON public.assessment_sessions;
    CREATE POLICY "Allow all for assessment_sessions" ON public.assessment_sessions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for assessment_responses" ON public.assessment_responses;
    CREATE POLICY "Allow all for assessment_responses" ON public.assessment_responses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for cognitive_baselines" ON public.cognitive_baselines;
    CREATE POLICY "Allow all for cognitive_baselines" ON public.cognitive_baselines FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for ai_recommendations" ON public.ai_recommendations;
    CREATE POLICY "Allow all for ai_recommendations" ON public.ai_recommendations FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for game_sessions" ON public.game_sessions;
    CREATE POLICY "Allow all for game_sessions" ON public.game_sessions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for routines" ON public.routines;
    CREATE POLICY "Allow all for routines" ON public.routines FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for medicines" ON public.medicines;
    CREATE POLICY "Allow all for medicines" ON public.medicines FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for appointments" ON public.appointments;
    CREATE POLICY "Allow all for appointments" ON public.appointments FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for notifications" ON public.notifications;
    CREATE POLICY "Allow all for notifications" ON public.notifications FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for memories" ON public.memories;
    CREATE POLICY "Allow all for memories" ON public.memories FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for assistant_conversations" ON public.assistant_conversations;
    CREATE POLICY "Allow all for assistant_conversations" ON public.assistant_conversations FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for assistant_messages" ON public.assistant_messages;
    CREATE POLICY "Allow all for assistant_messages" ON public.assistant_messages FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
END $$;
