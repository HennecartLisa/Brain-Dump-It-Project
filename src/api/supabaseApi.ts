import { supabase } from '../supabaseClient';
import type { ListType } from '../types/db-types/listType';
import type { TaskType } from '../types/db-types/taskType';
import { IMPORTANCE_TYPE } from '../types/db-types/importanceType';
import { TASK_STATUS_TYPE } from '../types/db-types/taskStatusType';
import { TASK_EFFORT_TYPE } from '../types/db-types/taskEffortType';

type TaskStatusType = typeof TASK_STATUS_TYPE[keyof typeof TASK_STATUS_TYPE];
type TaskEffortType = typeof TASK_EFFORT_TYPE[keyof typeof TASK_EFFORT_TYPE];
type ImportanceType = typeof IMPORTANCE_TYPE[keyof typeof IMPORTANCE_TYPE];
import type { ChallengeType } from '../types/db-types/challengeTypeType';
import type { ThemeType } from '../types/db-types/themeType';
import type { ComfortModeType } from '../types/db-types/comfortModeType';
import { API_ERROR_MESSAGES } from '../constants/apiMessages';

export type ApiResponse<T> = {
  data?: T;
  error?: string;
};

const getTaskStatusId = (status: TaskStatusType): number => {
  const statusMap: Record<TaskStatusType, number> = {
    [TASK_STATUS_TYPE.TO_DO]: 1,
    [TASK_STATUS_TYPE.DONE]: 2,
    [TASK_STATUS_TYPE.ACTIVE]: 3,
    [TASK_STATUS_TYPE.INACTIVE]: 4,
    [TASK_STATUS_TYPE.REPORTED]: 5,
    [TASK_STATUS_TYPE.IN_PROGRESS]: 6,
    [TASK_STATUS_TYPE.ON_HOLD]: 7,
  };
  return statusMap[status];
};

const transformDbTaskToTask = (dbTask: any): TaskType => {
  return {
    id: dbTask.id,
    name: dbTask.name,
    taskStatus: dbTask.task_status?.name || TASK_STATUS_TYPE.TO_DO as TaskStatusType,
    importance: dbTask.importance?.name || IMPORTANCE_TYPE.MEDIUM as ImportanceType,
    taskEffort: dbTask.task_effort?.label as TaskEffortType,
    deadline: dbTask.deadline ? new Date(dbTask.deadline) : undefined,
    repeat: dbTask.repeat ? {
      id: dbTask.repeat.id,
      label: dbTask.repeat.label,
      periods: dbTask.repeat.periods?.name || 'Days',
      intervalValue: dbTask.repeat.interval_value,
      dayOfWeek: dbTask.repeat.day_of_week,
      dayOfMonth: dbTask.repeat.day_of_month,
      isBuiltin: dbTask.repeat.is_builtin,
      createdAt: new Date(dbTask.repeat.created_at)
    } : undefined,
    lastActiveAt: new Date(dbTask.last_active_at || Date.now()),
    createdAt: new Date(dbTask.created_at || Date.now()),
    daysDone: dbTask.days_done || 0,
    createdBy: dbTask.created_by_data ? {
      id: dbTask.created_by_data.id,
    } : undefined,
    assignedUser: dbTask.assigned_user_data ? {
      id: dbTask.assigned_user_data.id,
    } : undefined,
    assignedAt: dbTask.assigned_at ? new Date(dbTask.assigned_at) : undefined,
    completedAt: dbTask.completed_at ? new Date(dbTask.completed_at) : undefined,
  };
};

const transformDbListToList = (dbList: any, tasks?: TaskType[]): ListType => {
  return {
    id: dbList.id,
    name: dbList.name,
    importance: dbList.importance_name || dbList.importance || IMPORTANCE_TYPE.MEDIUM as ImportanceType,
    repeat: dbList.repeat_data ? {
      id: dbList.repeat_data.id,
      label: dbList.repeat_data.label,
      periods: dbList.repeat_data.periods_name || 'Days',
      intervalValue: dbList.repeat_data.interval_value,
      dayOfWeek: dbList.repeat_data.day_of_week,
      dayOfMonth: dbList.repeat_data.day_of_month,
      isBuiltin: dbList.repeat_data.is_builtin,
      createdAt: new Date(dbList.repeat_data.created_at)
    } : undefined,
    createdBy: dbList.created_by_data ? {
      id: dbList.created_by_data.id,
    } : undefined,
    createdAt: new Date(dbList.created_at || dbList.createdAt || Date.now()),
    lastActiveAt: new Date(dbList.last_active_at || dbList.lastActiveAt || Date.now()),
    isRoutine: dbList.is_routine || false,
    tasks: tasks || [],
  };
};

export const createList = async (
  name: string,
  userId: string,
  isRoutine?: boolean
): Promise<ApiResponse<ListType>> => {
  try {
    const { data, error } = await supabase.functions.invoke('create-list', {
      body: { name, created_by: userId, is_routine: isRoutine === true }
    });
    
    if (error) {
      return { error: error.message };
    }
    
    const transformedData = data ? transformDbListToList(data.list || data) : undefined;
    
    return { data: transformedData };
  } catch (err) {
    console.error('Error creating list:', err);
    return { error: (err as Error).message || 'Could not create list' };
  }
};

export const getUserLists = async (): Promise<ApiResponse<ListType[]>> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-user-lists');
    
    if (error) {
      return { error: error.message };
    }
    
    const lists = data && data.lists ? data.lists : [];
    const transformedData = lists.map((dbList: any) => transformDbListToList(dbList));
    
    return { data: transformedData };
  } catch (error) {
    return { error: (error as Error)?.message || 'Failed to get lists' };
  }
};

export const deleteList = async (listId: string): Promise<ApiResponse<{ success: boolean }>> => {
  try {
    const { data, error } = await supabase.functions.invoke('delete-list', {
      body: { list_id: listId }
    });
    if (error) {
      return { error: error.message };
    }
    return { data: { success: true } };
  } catch (error: any) {
    return { error: error?.message || API_ERROR_MESSAGES.SERVER_ERROR };
  }
};

export const createTask = async (
  name: string, 
  listId: string, 
  repeatId?: number, 
  importanceId?: number, 
  lastActiveAt?: string
): Promise<ApiResponse<TaskType>> => {
  try {
    const { data, error } = await supabase.functions.invoke('create-task', {
      body: { 
        name, 
        list_id: listId, 
        repeat_id: repeatId, 
        importance_id: importanceId, 
        last_active_at: lastActiveAt 
      }
    });
    
    if (error) {
      return { error: error.message };
    }
    
    const transformedData = data ? transformDbTaskToTask(data.task || data) : undefined;
    
    return { data: transformedData };
  } catch (error: any) {
    console.log('Task creation failed:', error);
    return { error: error.message };
  }
};

export const deleteTask = async (taskId: string): Promise<ApiResponse<{ success: boolean }>> => {
  try {
    const { data, error } = await supabase.functions.invoke('delete-task', {
      body: { task_id: taskId }
    });
    if (error) return { error: error.message };
    return { data: { success: true } };
  } catch (error: any) {
    return { error: error?.message || API_ERROR_MESSAGES.SERVER_ERROR };
  }
};

export const getListTasks = async (listId: string): Promise<ApiResponse<TaskType[]>> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-list-tasks', {
      body: { list_id: listId }
    });
    
    if (error) {
      return { error: error.message };
    }
    
    const tasks = data && data.tasks ? data.tasks : [];
    const transformedData = tasks.map((dbTask: any) => transformDbTaskToTask(dbTask));
    
    return { data: transformedData };
  } catch (error: any) {
    return { error: error?.message || API_ERROR_MESSAGES.FAILED_TO_FETCH_TASKS };
  }
};

export const modifyTaskStatus = async (
  taskId: string, 
  status: TaskStatusType
): Promise<ApiResponse<TaskType>> => {
  try {
    const task_status_id = getTaskStatusId(status);
    
    const { data, error } = await supabase.functions.invoke('modify-task-status', {
      body: { 
        task_id: taskId, 
        task_status_id: task_status_id 
      }
    });
    
    if (error) {
      return { error: error.message };
    }
    
    const transformedData = data?.task ? transformDbTaskToTask(data.task) : undefined;
    
    return { data: transformedData };
  } catch (error: any) {
    return { error: error?.message || API_ERROR_MESSAGES.FAILED_TO_MODIFY_TASK_STATUS };
  }
};

export const modifyTask = async (
  taskId: string,
  updates: {
    name?: string;
    taskEffort?: TaskEffortType;
    plannedDate?: Date;
    priority?: ImportanceType;
  }
): Promise<ApiResponse<TaskType>> => {
  
  try {
    const apiUpdates: {
      task_id: string;
      name?: string;
      task_effort?: TaskEffortType;
      deadline?: string;
      importance?: ImportanceType;
    } = {
      task_id: taskId,
    };

    if (updates.name !== undefined) apiUpdates.name = updates.name;
    if (updates.taskEffort !== undefined) apiUpdates.task_effort = updates.taskEffort;
    if (updates.plannedDate !== undefined) apiUpdates.deadline = updates.plannedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    if (updates.priority !== undefined) apiUpdates.importance = updates.priority;

    const { data, error } = await supabase.functions.invoke('modify-task', {
      body: apiUpdates
    });

    if (error) {
      return { error: error.message };
    }

    const transformedData = data?.task ? transformDbTaskToTask(data.task) : undefined;

    return { data: transformedData };
  } catch (error: any) {
    return { error: error?.message || API_ERROR_MESSAGES.FAILED_TO_MODIFY_TASK };
  }
};

export const modifyList = async (
  listId: string,
  updates: {
    name?: string;
    importance?: ImportanceType;
  }
): Promise<ApiResponse<ListType>> => {
  
  try {
    const apiUpdates: {
      list_id: string;
      name?: string;
      importance?: ImportanceType;
    } = {
      list_id: listId,
    };

    if (updates.name !== undefined) apiUpdates.name = updates.name;
    if (updates.importance !== undefined) apiUpdates.importance = updates.importance;

    const { data, error } = await supabase.functions.invoke('modify-list', {
      body: apiUpdates
    });

    if (error) {
      return { error: error.message };
    }

    const transformedData = data?.list ? transformDbListToList(data.list) : undefined;

    return { data: transformedData };
  } catch (error: any) {
    return { error: error?.message || API_ERROR_MESSAGES.FAILED_TO_MODIFY_LIST };
  }
};

export const getChallengeTypes = async (): Promise<ApiResponse<ChallengeType[]>> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-challenge-types');
    
    if (error) {
      return { error: error.message };
    }
    
    const challengeTypes = data?.challenge_types || [];
    const transformedData = challengeTypes.map((dbChallengeType: any) => ({
      id: dbChallengeType.id,
      name: dbChallengeType.name,
      description: dbChallengeType.description,
      points: dbChallengeType.points,
      createdAt: new Date(dbChallengeType.created_at),
      updatedAt: new Date(dbChallengeType.updated_at)
    }));
    
    return { data: transformedData };
  } catch (error: any) {
    return { error: error?.message || API_ERROR_MESSAGES.FAILED_TO_FETCH_CHALLENGE_TYPES };
  }
};

export const createChallengeType = async (challengeType: {
  name: string;
  description: string;
  points: number;
}): Promise<ApiResponse<ChallengeType>> => {
  try {
    const { data, error } = await supabase.functions.invoke('create-challenge-type', {
      body: challengeType
    });
    
    if (error) {
      return { error: error.message };
    }
    
    const transformedData = data?.challenge_type ? {
      id: data.challenge_type.id,
      name: data.challenge_type.name,
      description: data.challenge_type.description,
      points: data.challenge_type.points,
      createdAt: new Date(data.challenge_type.created_at),
      updatedAt: new Date(data.challenge_type.updated_at)
    } : undefined;
    
    return { data: transformedData };
  } catch (error: any) {
    return { error: error?.message || API_ERROR_MESSAGES.FAILED_TO_CREATE_CHALLENGE_TYPE };
  }
};

export const getThemes = async (): Promise<ApiResponse<ThemeType[]>> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-themes');
    
    if (error) {
      return { error: error.message };
    }
    
    const themes = data?.themes || [];
    const transformedData = themes.map((dbTheme: any) => ({
      id: dbTheme.id,
      typography1: dbTheme.typography_1,
      typography2: dbTheme.typography_2,
      colour1: dbTheme.colour_1,
      colour2: dbTheme.colour_2,
      colour3: dbTheme.colour_3,
      colour4: dbTheme.colour_4,
      colour5: dbTheme.colour_5,
      colour6: dbTheme.colour_6,
      colour7: dbTheme.colour_7,
      createdAt: new Date(dbTheme.created_at),
      updatedAt: new Date(dbTheme.updated_at)
    }));
    
    return { data: transformedData };
  } catch (error: any) {
    return { error: error?.message || API_ERROR_MESSAGES.FAILED_TO_FETCH_THEMES };
  }
};

export const getComfortMode = async (): Promise<ApiResponse<ComfortModeType>> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-comfort-mode');
    
    if (error) {
      return { error: error.message };
    }
    
    const comfortMode = data?.comfort_mode;
    if (!comfortMode) {
      return { error: API_ERROR_MESSAGES.FAILED_TO_FETCH_COMFORT_MODE };
    }
    
    const transformedData = {
      id: comfortMode.id,
      profileId: comfortMode.profile_id,
      themeId: comfortMode.theme_id,
      typography1: comfortMode.typography_1,
      typography2: comfortMode.typography_2,
      scaling: comfortMode.scaling,
      createdAt: new Date(comfortMode.created_at),
      updatedAt: new Date(comfortMode.updated_at),
      theme: comfortMode.theme ? {
        id: comfortMode.theme.id,
        typography1: comfortMode.theme.typography_1,
        typography2: comfortMode.theme.typography_2,
        colour1: comfortMode.theme.colour_1,
        colour2: comfortMode.theme.colour_2,
        colour3: comfortMode.theme.colour_3,
        colour4: comfortMode.theme.colour_4,
        colour5: comfortMode.theme.colour_5,
        colour6: comfortMode.theme.colour_6,
        colour7: comfortMode.theme.colour_7,
        createdAt: new Date(comfortMode.theme.created_at),
        updatedAt: new Date(comfortMode.theme.updated_at)
      } : undefined
    };
    
    return { data: transformedData };
  } catch (error: any) {
    return { error: error?.message || API_ERROR_MESSAGES.FAILED_TO_FETCH_COMFORT_MODE };
  }
};

export const updateComfortMode = async (comfortMode: {
  themeId?: number;
  typography1?: string;
  typography2?: string;
  scaling?: number;
}): Promise<ApiResponse<ComfortModeType>> => {
  try {
    const { data, error } = await supabase.functions.invoke('update-comfort-mode', {
      body: comfortMode
    });
    
    if (error) {
      return { error: error.message };
    }
    
    const updatedComfortMode = data?.comfort_mode;
    if (!updatedComfortMode) {
      return { error: API_ERROR_MESSAGES.FAILED_TO_UPDATE_COMFORT_MODE };
    }
    
    const transformedData = {
      id: updatedComfortMode.id,
      profileId: updatedComfortMode.profile_id,
      themeId: updatedComfortMode.theme_id,
      typography1: updatedComfortMode.typography_1,
      typography2: updatedComfortMode.typography_2,
      scaling: updatedComfortMode.scaling,
      createdAt: new Date(updatedComfortMode.created_at),
      updatedAt: new Date(updatedComfortMode.updated_at),
      theme: updatedComfortMode.theme ? {
        id: updatedComfortMode.theme.id,
        typography1: updatedComfortMode.theme.typography_1,
        typography2: updatedComfortMode.theme.typography_2,
        colour1: updatedComfortMode.theme.colour_1,
        colour2: updatedComfortMode.theme.colour_2,
        colour3: updatedComfortMode.theme.colour_3,
        colour4: updatedComfortMode.theme.colour_4,
        colour5: updatedComfortMode.theme.colour_5,
        colour6: updatedComfortMode.theme.colour_6,
        colour7: updatedComfortMode.theme.colour_7,
        createdAt: new Date(updatedComfortMode.theme.created_at),
        updatedAt: new Date(updatedComfortMode.theme.updated_at)
      } : undefined
    };
    
    return { data: transformedData };
  } catch (error: any) {
    return { error: error?.message || API_ERROR_MESSAGES.FAILED_TO_UPDATE_COMFORT_MODE };
  }
};

export const getProfileByUsername = async (username: string): Promise<ApiResponse<{ id: string; displayName: string; createdAt: Date; updatedAt: Date } | null>> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-profile-by-username', {
      body: { username }
    });

    if (error) {
      return { error: error.message };
    }

    const profile = data?.data;
    if (!profile) {
      return { data: null };
    }

    const transformedProfile = {
      id: profile.id,
      displayName: profile.display_name,
      createdAt: new Date(profile.created_at),
      updatedAt: new Date(profile.updated_at)
    };

    return { data: transformedProfile };
  } catch (error: any) {
    return { error: error?.message || 'Failed to get profile by username' };
  }
};

export const setupNewUser = async (displayName: string): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  try {
    const { data, error } = await supabase.functions.invoke('setup-new-user', {
      body: { display_name: displayName }
    });

    if (error) {
      return { error: error.message };
    }

    return { data: data };
  } catch (error: any) {
    return { error: error?.message || 'Failed to setup new user' };
  }
};

export const getUserGroups = async (): Promise<ApiResponse<Array<{
  group_id: string;
  group_name: string;
  score: number;
  created_at: string;
  last_active_at: string;
  members: Array<{
    user_id: string;
    display_name: string;
    role_name: string;
    score: number;
    joined_at: string;
    last_active_at: string;
    status: string;
  }>;
}>>> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-user-groups');

    if (error) {
      return { error: error.message };
    }

    return { data: data?.data || [] };
  } catch (error: any) {
    return { error: error?.message || 'Failed to get user groups' };
  }
};

export const addUserToGroup = async (groupId: string, userId: string): Promise<ApiResponse<{
  success: boolean;
  message: string;
  data: any;
}>> => {
  try {
    const { data, error } = await supabase.functions.invoke('add-user-to-group', {
      body: { group_id: groupId, user_id: userId }
    });

    if (error) {
      return { error: error.message };
    }

    return { data: data };
  } catch (error: any) {
    return { error: error?.message || 'Failed to add user to group' };
  }
};

export const deleteUserFromGroup = async (groupId: string, userId: string): Promise<ApiResponse<{
  success: boolean;
}>> => {
  try {
    const { data, error } = await supabase.functions.invoke('delete-user-from-group', {
      body: { group_id: groupId, user_id: userId }
    });

    if (error) {
      return { error: error.message };
    }

    return { data: data };
  } catch (error: any) {
    return { error: error?.message || 'Failed to delete user from group' };
  }
};

export const updateGroupMemberStatus = async (groupId: string, userId: string, status: 'Accepted' | 'Rejected' | 'Inactive' | 'Removed'): Promise<ApiResponse<{
  success: boolean;
  message: string;
  data: any;
}>> => {
  try {
    const { data, error } = await supabase.functions.invoke('update-group-member-status', {
      body: { group_id: groupId, user_id: userId, status: status }
    });

    if (error) {
      return { error: error.message };
    }

    return { data: data };
  } catch (error: any) {
    return { error: error?.message || 'Failed to update group member status' };
  }
};

export const createGroup = async (groupName: string): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  try {
    const { data, error } = await supabase.functions.invoke('create-group', {
      body: { group_name: groupName }
    });

    if (error) {
      return { error: error.message };
    }

    return { data: data };
  } catch (error: any) {
    return { error: error?.message || 'Failed to create group' };
  }
};

export const createMyVillageGroup = async (): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  try {
    const { data, error } = await supabase.functions.invoke('setup-new-user', {
      body: { display_name: 'Existing User' }
    });

    if (error) {
      return { error: error.message };
    }

    return { data: data };
  } catch (error: any) {
    return { error: error?.message || 'Failed to create My Village group' };
  }
};

export const updateListGroup = async (listId: string, groupId: string, status: string): Promise<ApiResponse<{
  success: boolean;
  data: any;
}>> => {
  try {
    const { data, error } = await supabase.functions.invoke('update-list-group', {
      body: { list_id: listId, group_id: groupId, status: status }
    });

    if (error) {
      return { error: error.message };
    }

    if (data && data.success === false) {
      return { 
        error: data.error
      };
    }

    return { data: data };
  } catch (error: any) {
    return { error: error?.message || 'Failed to assign group to list' };
  }
};

export const getListGroups = async (listId: string): Promise<ApiResponse<Array<{
  id: string;
  assigned_at: string;
  group: {
    id: string;
    name: string;
    score: number;
  };
  status: {
    id: number;
    name: string;
  };
  members: Array<{
    user_id: string;
    display_name: string;
    role_name: string;
    score: number;
    joined_at: string;
    last_active_at: string;
    status: string;
  }>;
}>>> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-list-groups', {
      body: { list_id: listId }
    });

    if (error) {
      return { error: error.message };
    }

    return { data: data?.data || [] };
  } catch (error: any) {
    return { error: error?.message || 'Failed to get list groups' };
  }
};


export const removeListGroup = async (listId: string, groupId: string): Promise<ApiResponse<{
  success: boolean;
}>> => {
  try {
    const { data, error } = await supabase.functions.invoke('remove-list-group', {
      body: { list_id: listId, group_id: groupId }
    });

    if (error) {
      return { error: error.message };
    }

    return { data: data };
  } catch (error: any) {
    return { error: error?.message || 'Failed to remove group from list' };
  }
};


export const getTaskUsers = async (taskId: string): Promise<ApiResponse<Array<{
  id: string;
  task_id: string;
  user: {
    id: string;
    display_name: string;
  };
  status: {
    id: number;
    name: string;
  };
  assigned_at: string;
  completed_at: string | null;
}>>> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-task-user', {
      body: { task_id: taskId }
    });

    if (error) {
      return { error: error.message };
    }

    return { data: data?.data || [] };
  } catch (error: any) {
    return { error: error?.message || 'Failed to get task users' };
  }
};


export const updateTaskUser = async (taskId: string, userId: string, status: string): Promise<ApiResponse<{
  success: boolean;
  data: any;
}>> => {
  try {
    const { data, error } = await supabase.functions.invoke('update-task-user', {
      body: { task_id: taskId, user_id: userId, status: status }
    });

    if (error) {
      return { error: error.message };
    }


    if (data && data.success === false) {
      return { 
        error: data.error
      };
    }

    return { data: data };
  } catch (error: any) {
    return { error: error?.message || 'Failed to assign user to task' };
  }
};


export const anonymizeUser = async (): Promise<ApiResponse<{
  success: boolean;
  message: string;
  data: {
    anonymized_at: string;
    user_id: string;
  };
}>> => {
  try {
    const { data, error } = await supabase.functions.invoke('anonymize-user');

    if (error) {
      return { error: error.message };
    }

    return { data: data };
  } catch (error: any) {
    return { error: error?.message || 'Failed to anonymize user account' };
  }
};


