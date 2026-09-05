export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- Axiom Cognitive Care - Supabase Database Schema
-- Project: NER Dementia Care & AI Cognitive Gaming Assistance
-- Compatible with Supabase PostgreSQL & Publishable / Anon Client Access
-- ==============================================================================

-- 1. Patients Table
CREATE TABLE IF NOT EXISTS public.patients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER,
    gender TEXT,
    stage TEXT DEFAULT 'Early Mild Cognitive Impairment',
    diagnosis_date TEXT,
    language TEXT DEFAULT 'en',
    hometown TEXT,
    current_location TEXT,
    interests TEXT[] DEFAULT '{}',
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relation TEXT,
    cognitive_baseline TEXT,
    focus_domain TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Assessment Sessions Table
CREATE TABLE IF NOT EXISTS public.assessment_sessions (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    overall_score INTEGER NOT NULL,
    focus_domain TEXT NOT NULL,
    domain_scores JSONB DEFAULT '{}'::jsonb,
    task_responses JSONB DEFAULT '[]'::jsonb,
    clinical_notes TEXT,
    recommended_activities TEXT[] DEFAULT '{}',
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Game & Activity Sessions Table
CREATE TABLE IF NOT EXISTS public.game_sessions (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    activity_id TEXT NOT NULL,
    title TEXT NOT NULL,
    score INTEGER NOT NULL,
    accuracy_percent INTEGER NOT NULL,
    duration TEXT NOT NULL,
    status TEXT DEFAULT 'Optimal',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Medicines & Medication Schedule Table
CREATE TABLE IF NOT EXISTS public.medicines (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    time_slot TEXT NOT NULL,
    time TEXT NOT NULL,
    instructions TEXT,
    color TEXT DEFAULT 'teal',
    is_taken_today BOOLEAN DEFAULT FALSE,
    taken_at TEXT,
    history_7days BOOLEAN[] DEFAULT '{true, true, true, true, true, true, false}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Daily Routine Tracker Table
CREATE TABLE IF NOT EXISTS public.routine_items (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    time TEXT NOT NULL,
    time_block TEXT NOT NULL,
    icon TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Alerts & Notifications Table
CREATE TABLE IF NOT EXISTS public.alerts (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    category TEXT DEFAULT 'general',
    is_acknowledged BOOLEAN DEFAULT FALSE,
    action_label TEXT,
    action_route TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Clinical Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    location TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Memory Hub Items Table
CREATE TABLE IF NOT EXISTS public.memories (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'person' | 'place' | 'album'
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    image_url TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow all for patients" ON public.patients;
    CREATE POLICY "Allow all for patients" ON public.patients FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for assessment_sessions" ON public.assessment_sessions;
    CREATE POLICY "Allow all for assessment_sessions" ON public.assessment_sessions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for game_sessions" ON public.game_sessions;
    CREATE POLICY "Allow all for game_sessions" ON public.game_sessions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for medicines" ON public.medicines;
    CREATE POLICY "Allow all for medicines" ON public.medicines FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for routine_items" ON public.routine_items;
    CREATE POLICY "Allow all for routine_items" ON public.routine_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for alerts" ON public.alerts;
    CREATE POLICY "Allow all for alerts" ON public.alerts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for appointments" ON public.appointments;
    CREATE POLICY "Allow all for appointments" ON public.appointments FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for memories" ON public.memories;
    CREATE POLICY "Allow all for memories" ON public.memories FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
END $$;
`;
