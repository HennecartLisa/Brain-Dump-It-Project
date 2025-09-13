# BrainDump

A React + Supabase app to help manage tasks, routines, groups, and accessibility preferences.

## 1) Prerequisites
- Node.js 20+
- Supabase CLI if you want to create migrations or functions

## 2) Environment Setup
Create a `.env.local` file in the project root with your Supabase credentials:

```zsh
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 3) Install & Run
```zsh
npm install
npm run dev
```

Then open the printed local URL http://localhost:...

Supabase CLI:
```bash
# optional: run local stack if you use CLI
supabase start

# apply migrations
supabase migration push

# deploy functions (adjust function name)
supabase functions deploy get-user-lists
```

## 4) API Layer (Frontend)
All frontend API calls are centralized in `src/api/supabaseApi.ts`. Each returns `{ data?, error? }`.

### Lists
- `getUserLists(): Promise<ApiResponse<List[]>>`
- `createList(name: string, userId: string, isRoutine?: boolean)`
- `modifyList(listId: string, updates: { name?: string; importance?: ImportanceType; })`
- `deleteList(listId: string)`

### Tasks
- `getListTasks(listId: string): Promise<ApiResponse<Task[]>>`
- `createTask(name: string, listId: string, repeatId?, importanceId?, lastActiveAt?)`
- `modifyTaskStatus(taskId: string, status: TaskStatusType)`
- `modifyTask(taskId: string, updates: { name?; taskEffort?; plannedDate?: Date; priority?: ImportanceType; })`
- `deleteTask(taskId: string)`

### Challenges & Themes & Comfort Mode
- `getChallengeTypes()` / `createChallengeType({ name, description, points })`
- `getThemes()`
- `getComfortMode()` / `updateComfortMode({ themeId?, typography1?, typography2?, scaling? })`

### Profiles & Account Management
- `getProfileByUsername(username: string)`
- `setupNewUser(displayName: string)`
- `anonymizeUser()` - Delete user account and anonymize all personal data

### Groups & Assignments
- `getUserGroups()`
- `createGroup(groupName: string)` / `createMyVillageGroup()`
- `addUserToGroup(groupId: string, userId: string)` / `deleteUserFromGroup(groupId: string, userId: string)`
- `updateGroupMemberStatus(groupId: string, userId: string, status: 'Accepted' | 'Rejected' | 'Inactive' | 'Removed')`
- `getListGroups(listId: string)` / `updateListGroup(listId: string, groupId: string, status: string)` / `removeListGroup(listId: string, groupId: string)`
- `getTaskUsers(taskId: string)` / `updateTaskUser(taskId: string, userId: string, status: string)`

## 5) Edge Functions (Backend)
All edge functions are located in `supabase/functions/` and run on Supabase's serverless platform.

### User Management
- `setup-new-user` - Creates user profile and default group on signup
- `get-user-groups-` - Fetches all groups the user is a member of
- `add-user-to-group` / `delete-user-from-group` - Group membership management
- `update-group-member-status` - Updates member status in groups
- `anonymize-user` - Deletes user account and anonymizes all personal data (GDPR compliance)

### Data Management
- `create-list` / `modify-list` / `delete-list` - List CRUD operations
- `create-task` / `modify-task` / `delete-task` - Task CRUD operations
- `modify-task-status` - Updates task status (To Do, Done, etc.)
- `get-list-tasks` / `get-user-lists` - Data fetching operations
- `update-list-group` / `remove-list-group` - List-group associations
- `get-task-user` / `update-task-user` - Task-user assignments

### Batch Operations (Automated Daily at 1:00 AM)
- `batch-all-todo-tasks-from-yesterday-to-today` - Moves past "To Do" tasks to today's date
- `batch-set-status-to-inactive-users` - Sets users to "Inactive" after 6 months of inactivity
- `batch-anonymise-inactive-users` - Anonymizes users inactive for 1+ year (GDPR compliance)
- `batch-undo-tasks-routine` - Resets "Done" tasks in routine lists back to "To Do"

### Reference Data
- `get-challenge-types` / `create-challenge-type` - Challenge type management
- `get-themes` - Theme data for UI customization
- `get-comfort-mode` / `update-comfort-mode` - Accessibility settings
- `get-profile-by-username` - Username availability checking
