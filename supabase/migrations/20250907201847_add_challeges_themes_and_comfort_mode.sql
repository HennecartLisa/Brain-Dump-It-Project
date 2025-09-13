DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'consent_form_agreement') THEN
        ALTER TABLE profiles ADD COLUMN consent_form_agreement TIMESTAMP NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'cookies_date') THEN
        ALTER TABLE profiles ADD COLUMN cookies_date TIMESTAMP NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'max_tasks_effort_per_day') THEN
        ALTER TABLE profiles ADD COLUMN max_tasks_effort_per_day INTEGER NOT NULL DEFAULT 120;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'max_tasks_per_day') THEN
        ALTER TABLE profiles ADD COLUMN max_tasks_per_day INTEGER NOT NULL DEFAULT 10;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'list' AND column_name = 'is_routine') THEN
        ALTER TABLE list ADD COLUMN is_routine BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'task' AND column_name = 'days_done') THEN
        ALTER TABLE task ADD COLUMN days_done INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS challenge_type (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(500) NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

INSERT INTO challenge_type (name, description, points) VALUES 
('Halfway Loaded', 'You have already planned 50% of your daily task limit. Take a moment to check if some tasks could be rescheduled or reassigned.', 30),
('Fully Loaded', 'user has reached 100% of daily capacity for tasks. Could you take some of them?', 50),
('Time Halfway', 'You have already scheduled 50% of your daily time limit for tasks. Reflect on whether some can be delayed or shared.', 30),
('Time Overload', 'user has reached 100% of daily time capacity for tasks. Could you take some of them?', 50),
('Day Off', 'Clear your day completely by reassigning or rescheduling all tasks. Full rest, maximum reward.', 100),
('Plan 5', 'Add at least 5 new tasks that have not been scheduled yet.', 25),
('Early Bird', 'Complete your first task before 9 AM', 15),
('Assign 5', 'Assign 5 unassigned tasks to someone in the household.', 25),
('Cut Low Priority', 'Review low-priority tasks and delete those that do not really need to be done.', 40),
('Quick Win', 'Pick one task that takes 5 minutes or less and do it right now.', 30)
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS theme (
    id SERIAL PRIMARY KEY,
    typography_1 VARCHAR(100),
    typography_2 VARCHAR(100),
    colour_1 VARCHAR(50),
    colour_2 VARCHAR(50),
    colour_3 VARCHAR(50),
    colour_4 VARCHAR(50),
    colour_5 VARCHAR(50),
    colour_6 VARCHAR(50),
    colour_7 VARCHAR(50),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

INSERT INTO theme (typography_1, typography_2, colour_1, colour_2, colour_3, colour_4, colour_5, colour_6, colour_7) VALUES 
('Black and White', 'Open Sans', '#20102C', '#20102C', '#FEFDFB', '#FEFDFB', '#FEFDFB', '#FEFDFB', '#FEFDFB'),
('Contrast', 'Open Sans', '#0432DD', '#20102C', '#ECFBFF', '#F7FFC0', '#E0E7FF', '#FFEDF2', '#FEFDFB')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS comfort_mode (
    id SERIAL PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    theme_id INTEGER NOT NULL DEFAULT 1 REFERENCES theme(id) ON DELETE RESTRICT,
    typography_1 VARCHAR(100),
    typography_2 VARCHAR(100),
    scaling NUMERIC NOT NULL DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    UNIQUE(profile_id)
);

ALTER TABLE challenge_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme ENABLE ROW LEVEL SECURITY;
ALTER TABLE comfort_mode ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read themes" ON theme;
CREATE POLICY "Authenticated users can read themes" ON theme
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can read challenges" ON challenge_type;
CREATE POLICY "Authenticated users can read challenges" ON challenge_type
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can read their own comfort mode" ON comfort_mode;
CREATE POLICY "Users can read their own comfort mode" ON comfort_mode
    FOR SELECT USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can update their own comfort mode" ON comfort_mode;
CREATE POLICY "Users can update their own comfort mode" ON comfort_mode
    FOR UPDATE USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can insert their own comfort mode" ON comfort_mode;
CREATE POLICY "Users can insert their own comfort mode" ON comfort_mode
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

INSERT INTO comfort_mode (profile_id, theme_id, typography_1, typography_2, scaling)
SELECT 
    p.id,
    1, 
    NULL,
    NULL,
    1.0
FROM profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM comfort_mode cm WHERE cm.profile_id = p.id
);


UPDATE list SET is_routine = false WHERE is_routine IS NULL;
