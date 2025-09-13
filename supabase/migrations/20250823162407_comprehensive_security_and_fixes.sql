ALTER TABLE task ENABLE ROW LEVEL SECURITY;
ALTER TABLE list ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_task ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_member ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_group ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_user_role ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE repeat ENABLE ROW LEVEL SECURITY;

ALTER TABLE task_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE general_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE importance ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_effort ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role ENABLE ROW LEVEL SECURITY;
ALTER TABLE periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own tasks" ON task
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own tasks" ON task
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own tasks" ON task
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own tasks" ON task
    FOR DELETE USING (auth.uid() = created_by);

CREATE POLICY "Users can read their own lists" ON list
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own lists" ON list
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own lists" ON list
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own lists" ON list
    FOR DELETE USING (auth.uid() = created_by);

CREATE POLICY "Users can read their own groups" ON groups
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own groups" ON groups
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own groups" ON groups
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own groups" ON groups
    FOR DELETE USING (auth.uid() = created_by);

CREATE POLICY "Users can read list_task for their lists" ON list_task
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM list 
            WHERE list.id = list_task.list_id 
            AND list.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can insert list_task for their lists" ON list_task
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM list 
            WHERE list.id = list_task.list_id 
            AND list.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can delete list_task for their lists" ON list_task
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM list 
            WHERE list.id = list_task.list_id 
            AND list.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can read group_member for their groups" ON group_member
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM groups 
            WHERE groups.id = group_member.group_id 
            AND groups.created_by = auth.uid()
        )
    );

CREATE POLICY "Group creators can manage members" ON group_member
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM groups 
            WHERE groups.id = group_member.group_id 
            AND groups.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can read list_group for their content" ON list_group
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM list 
            WHERE list.id = list_group.list_id 
            AND list.created_by = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM groups 
            WHERE groups.id = list_group.group_id 
            AND groups.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can manage list_group for their content" ON list_group
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM list 
            WHERE list.id = list_group.list_id 
            AND list.created_by = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM groups 
            WHERE groups.id = list_group.group_id 
            AND groups.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can read list_user_role for their lists or themselves" ON list_user_role
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM list 
            WHERE list.id = list_user_role.list_id 
            AND list.created_by = auth.uid()
        )
    );

CREATE POLICY "List creators can manage user roles" ON list_user_role
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM list 
            WHERE list.id = list_user_role.list_id 
            AND list.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can read task_user for their tasks or assignments" ON task_user
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM task 
            WHERE task.id = task_user.task_id 
            AND task.created_by = auth.uid()
        )
    );

CREATE POLICY "Task creators and assigned users can manage assignments" ON task_user
    FOR ALL USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM task 
            WHERE task.id = task_user.task_id 
            AND task.created_by = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can read task_status" ON task_status
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read general_status" ON general_status
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read importance" ON importance
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read task_effort" ON task_effort
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read user_status" ON user_status
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read user_role" ON user_role
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read periods" ON periods
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read all repeat patterns" ON repeat
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own repeat patterns" ON repeat
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update built-in repeat patterns" ON repeat
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can delete their own repeat patterns" ON repeat
    FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;

DROP POLICY IF EXISTS "Authenticated users can read profiles" ON profiles;
CREATE POLICY "Authenticated users can read profiles" ON profiles
    FOR SELECT TO authenticated USING (true);


INSERT INTO profiles (id, display_name, created_at, updated_at)
SELECT 
    u.id,
    'User_' || SUBSTRING(u.id::text, 1, 8) as display_name,  -- Temporary display name
    u.created_at,
    NOW()
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
