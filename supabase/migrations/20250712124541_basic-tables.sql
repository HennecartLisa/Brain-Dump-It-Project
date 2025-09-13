-- Create the status table for the tasks
CREATE TABLE task_status (
    id SERIAL PRIMARY KEY, -- Auto-incrementing unique ID for each
    name VARCHAR(50) NOT NULL UNIQUE -- The name of the status, which must be unique
);

-- Insert the initial statuses
INSERT INTO task_status (name) VALUES 
('To Do'),
('Done'),
('Active'),
('Inactive'),
('Reported'),
('In progress'),
('On hold');

-- Create the status table for the groups, lists and routines
CREATE TABLE general_status (
    id SERIAL PRIMARY KEY, -- Auto-incrementing unique ID for each
    name VARCHAR(50) NOT NULL UNIQUE -- The name of the status, which must be unique
);

-- Insert the initial statuses
INSERT INTO general_status (name) VALUES 
('Active'),
('Inactive');

-- Create the importance of a task, list or routine
CREATE TABLE importance (
    id SERIAL PRIMARY KEY, -- Auto-incrementing unique ID for each
    name VARCHAR(50) NOT NULL UNIQUE, -- The name of the importance, which must be unique
    value integer not null -- value of the importance
);

-- Insert the initial importance names
INSERT INTO importance (name, value) VALUES 
('Low', 1),
('Medium', 2),
('High', 3);

-- Create the task affort table
CREATE TABLE task_effort (
    id SERIAL PRIMARY KEY, -- Auto-incrementing unique ID for each
    label VARCHAR(50) NOT NULL UNIQUE, -- The lable of the effort, which must be unique
    minutes integer not null check (minutes > 0) -- The approximative number of minutes it takes
);

-- Insert the initial statuses
INSERT INTO task_effort (label, minutes) VALUES 
('Very Quick', 5), -- 5 minutes
('Quick', 15), -- 15 minutes
('Moderate', 30), -- Half an hour
('Considerable', 60), -- One hour
('Long', 120), -- Two hours
('Very Long', 240); -- Four hours

-- Create the status table for the users
CREATE TABLE user_status (
    id SERIAL PRIMARY KEY, -- Auto-incrementing unique ID for each status
    name VARCHAR(50) NOT NULL UNIQUE -- The name of the status, which must be unique
);

-- Insert the initial statuses
INSERT INTO user_status (name) VALUES 
('Pending'),
('Accepted'),
('Rejected'),
('Inactive'),
('Removed');

-- Create the roles table for the users
CREATE TABLE user_role (
    id SERIAL PRIMARY KEY, -- Auto-incrementing unique ID for each
    name VARCHAR(50) NOT NULL UNIQUE -- The name of the roles, which must be unique
);

-- Insert the initial roles
INSERT INTO user_role (name) VALUES 
('member'),
('admin');

-- Create the period table
CREATE TABLE periods (
    id SERIAL PRIMARY KEY, -- Auto-incrementing unique ID for each
    name VARCHAR(50) NOT NULL UNIQUE, -- The name of the periods, which must be unique
    nb_days integer not null -- number of day the period counts
);

-- Insert the initial periods
INSERT INTO periods (name, nb_days) VALUES 
('daily',1),
('weekly',7),
('monthly', 30),
('quarterly', 90),
('yearly', 365),
('custom', 0);

-- Table to define repeat logic that can be reused by tasks or lists
CREATE TABLE repeat (
    id SERIAL PRIMARY KEY,                          -- Unique repeat ID
    label TEXT NOT NULL UNIQUE,                     -- Human-readable label ("Every Monday", "Every 3 days")
    periods_id integer references periods(id) on delete set null, -- Periods, such as Daily
    interval_value INTEGER NOT NULL DEFAULT 1,      -- e.g., every 3 days
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- Optional (0 = Sunday)
    day_of_month INTEGER CHECK (day_of_month BETWEEN 1 AND 31), -- Optional
    is_builtin BOOLEAN NOT NULL DEFAULT false,      -- Whether it’s a suggested default
    created_at TIMESTAMP DEFAULT now()
);


-- Create the groups table that will hold the goup names, scores and timestamps
CREATE TABLE groups (
    id uuid primary key default gen_random_uuid(), -- Unique long string id
    name text not null,
    score numeric default 0 not null,
    created_by uuid references auth.users(id) on delete set null,
    general_status_id integer references general_status(id) on delete set null,
    created_at timestamp default now(),
    last_active_at timestamp default now()
);

CREATE TABLE group_member (
    group_id uuid references groups(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    role_id integer references user_role(id) on delete restrict,
    user_status_id integer references user_status(id) on delete set null,
    score numeric default 0 not null,
    joined_at timestamp default now(),
    last_active_at timestamp default now(),
    primary key (group_id, user_id)
);

CREATE TABLE task (
    id uuid primary key default gen_random_uuid(), -- Unique long string id
    name text not null default 'New Task',
    task_status_id integer not null default 1 references task_status(id) on delete restrict, -- FK to taks status table with the default set as To Do
    importance_id integer not null default 1 references importance(id) on delete restrict, -- FK to taks status set as default to 'Low'
    task_effort_id integer references task_effort(id) on delete set null, -- FK to taks effort, no default
    deadline date,
    repeat_id INTEGER REFERENCES repeat(id) ON DELETE SET NULL,
    last_active_at timestamp default now(),
    created_at timestamp default now()
);

-- Create the list table, which stores a list of tasks
CREATE TABLE list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique list ID
    name TEXT NOT NULL DEFAULT 'New List',         -- Default name for new lists
    importance_id INTEGER NOT NULL DEFAULT 1 REFERENCES importance(id) ON DELETE RESTRICT, -- FK to importance
    repeat_id INTEGER REFERENCES repeat(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- User who created the list
    created_at TIMESTAMP DEFAULT now(),
    last_active_at TIMESTAMP DEFAULT now()
);

-- Create the list_task table to associate tasks with lists
CREATE TABLE list_task (
    list_id UUID REFERENCES list(id) ON DELETE CASCADE,  -- FK to list
    task_id UUID REFERENCES task(id) ON DELETE CASCADE,  -- FK to task
    PRIMARY KEY (list_id, task_id)                       -- Composite key
);

-- Create the list_group table to associate lists with groups
CREATE TABLE list_group (
    list_id UUID REFERENCES list(id) ON DELETE CASCADE,   -- FK to list
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE, -- FK to group
    general_status_id INTEGER NOT NULL DEFAULT 1 REFERENCES general_status(id) ON DELETE RESTRICT, -- FK to status (default Active)
    PRIMARY KEY (list_id, group_id)
);

-- Create the list_user_role table for user-specific list sharing
CREATE TABLE list_user_role (
    list_id UUID REFERENCES list(id) ON DELETE CASCADE,            -- FK to list
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,      -- FK to user
    user_role_id INTEGER NOT NULL DEFAULT 2 REFERENCES user_role(id) ON DELETE RESTRICT, -- FK to role (default admin)
    user_status_id INTEGER NOT NULL DEFAULT 1 REFERENCES user_status(id) ON DELETE RESTRICT, -- FK to user_status (default Pending)
    general_status_id INTEGER NOT NULL DEFAULT 1 REFERENCES general_status(id) ON DELETE RESTRICT, -- FK to status (default Active)
    score numeric default 0 not null,
    PRIMARY KEY (list_id, user_id)
);

-- Table to assign a task to a user with status
CREATE TABLE task_user (
    task_id UUID REFERENCES task(id) ON DELETE CASCADE,     -- Task reference
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Assigned user
    user_status_id INTEGER NOT NULL DEFAULT 1 REFERENCES user_status(id) ON DELETE RESTRICT, -- Pending by default
    assigned_at TIMESTAMP DEFAULT now(),
    completed_at TIMESTAMP,
    PRIMARY KEY (task_id, user_id)
);

