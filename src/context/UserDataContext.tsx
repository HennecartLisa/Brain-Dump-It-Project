import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

import { useAuth } from '../auth/useAuth';

import { 
  getUserLists, 
  getListTasks, 
  modifyTaskStatus, 
  modifyTask,
  modifyList, 
  deleteList as apiDeleteList,
  createList as apiCreateList,
  createTask as apiCreateTask,
  deleteTask as apiDeleteTask,
  updateListGroup as apiUpdateListGroup,
  removeListGroup as apiRemoveListGroup,
  updateTaskUser as apiUpdateTaskUser
} from '../api/supabaseApi';

import type { ListType } from '../types/db-types/listType';
import type { TaskType } from '../types/db-types/taskType';
import { TASK_STATUS_TYPE } from '../types/db-types/taskStatusType';
import { TASK_EFFORT_TYPE } from '../types/db-types/taskEffortType';
import { IMPORTANCE_TYPE } from '../types/db-types/importanceType';

type TaskStatusType = typeof TASK_STATUS_TYPE[keyof typeof TASK_STATUS_TYPE];
type TaskEffortType = typeof TASK_EFFORT_TYPE[keyof typeof TASK_EFFORT_TYPE];
type ImportanceType = typeof IMPORTANCE_TYPE[keyof typeof IMPORTANCE_TYPE];

import { API_ERROR_MESSAGES } from '../constants/apiMessages';

interface UserDataContextType {
  lists: ListType[];
  loading: boolean;
  error: string | null;
  
  refreshData: () => Promise<void>;
  
  // List management
  addList: (list: ListType) => void;
  updateList: (listId: string, updatedList: Partial<ListType>) => void;
  removeList: (listId: string) => void;
  deleteListWithAPI: (listId: string) => Promise<void>;
  
  // Task management
  addTaskToList: (listId: string, task: TaskType) => void;
  updateTaskInList: (listId: string, taskId: string, updatedTask: Partial<TaskType>) => void;
  removeTaskFromList: (listId: string, taskId: string) => void;
  deleteTaskWithAPI?: (listId: string, taskId: string) => Promise<void>;
  
  // API functions
  updateTaskStatus: (listId: string, taskId: string, status: TaskStatusType) => Promise<void>;
  updateTask: (taskId: string, updates: {
    name?: string;
    taskEffort?: TaskEffortType;
    plannedDate?: Date;
    priority?: ImportanceType;
  }) => Promise<void>;
  updateListWithAPI: (listId: string, updates: {
    name?: string;
    importance?: ImportanceType;
  }) => Promise<void>;
  
  createList: (name: string, isRoutine?: boolean) => Promise<void>;
  createTask: (name: string, listId: string) => Promise<void>;
  deleteTask: (listId: string, taskId: string) => Promise<void>;
  updateListGroup: (listId: string, groupId: string, status: string) => Promise<void>;
  removeListGroup: (listId: string, groupId: string) => Promise<void>;
  updateTaskUser: (taskId: string, userId: string, status: string) => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

interface UserDataProviderProps {
  children: ReactNode;
}

export function UserDataProvider({ children }: UserDataProviderProps) {
  const [lists, setLists] = useState<ListType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();

  const fetchUserData = async () => {
    if (!user) {
      setLists([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const listsResponse = await getUserLists();
      
      if (listsResponse.error) {
        throw new Error(listsResponse.error);
      }

      const userLists = listsResponse.data || [];
      
      if (userLists.length === 0) {
        setLists([]);
        return;
      }
      
      // Get tasks for each list
      const listsWithTasks = await Promise.all(
        userLists.map(async (list: any) => {
          const tasksResponse = await getListTasks(list.id);
          
          if (tasksResponse.error) {
            // Just log error, don't break the whole thing
            console.error('Failed to fetch tasks for list:', list.id);
          }
          
          return {
            ...list,
            tasks: tasksResponse.data || []
          };
        })
      );

      setLists(listsWithTasks);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : API_ERROR_MESSAGES.FAILED_TO_FETCH_USER_DATA;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await fetchUserData();
  };

  const addList = (list: ListType) => {
    setLists(prev => [...prev, list]);
  };

  const updateList = (listId: string, updatedList: Partial<ListType>) => {
    setLists(prev => prev.map(list => 
      list.id === listId ? { ...list, ...updatedList } : list
    ));
  };

  const removeList = (listId: string) => {
    setLists(prev => prev.filter(list => list.id !== listId));
  };

  const deleteListWithAPI = async (listId: string) => {
    try {
      const response = await apiDeleteList(listId);
      if (response.error) {
        throw new Error(response.error);
      }
      removeList(listId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : API_ERROR_MESSAGES.SERVER_ERROR;
      setError(errorMessage);
    }
  };

  const addTaskToList = (listId: string, task: TaskType) => {
    setLists(prev => prev.map(list =>
      list.id === listId 
        ? { ...list, tasks: [...(list.tasks || []), task] } 
        : list 
    ));
  };

  const updateTaskInList = (listId: string, taskId: string, updatedTask: Partial<TaskType>) => {
    setLists(prev => prev.map(list =>
      list.id === listId
        ? {
            ...list, 
            tasks: (list.tasks || []).map(task =>
              task.id === taskId ? { ...task, ...updatedTask } : task
            )
          }
        : list 
    ));
  };

  const removeTaskFromList = (listId: string, taskId: string) => {
    setLists(prev => prev.map(list =>
      list.id === listId
        ? { ...list, tasks: (list.tasks || []).filter(task => task.id !== taskId) } 
        : list 
    ));
  };

  const updateTaskStatus = async (listId: string, taskId: string, status: TaskStatusType) => {
    try {
      const response = await modifyTaskStatus(taskId, status);
      
      if (response.error) {
        setError(response.error);
        return;
      }

      setLists(prev => prev.map(list =>
        list.id === listId
          ? {
              ...list, 
              tasks: (list.tasks || []).map(task =>
                task.id === taskId 
                  ? { ...task, taskStatus: status, lastActiveAt: new Date() } 
                  : task 
              )
            }
          : list 
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : API_ERROR_MESSAGES.FAILED_TO_UPDATE_TASK_STATUS;
      setError(errorMessage);
    }
  };

  const deleteTaskWithAPI = async (listId: string, taskId: string) => {
    try {
      const response = await apiDeleteTask(taskId);
      if (response.error) {
        throw new Error(response.error);
      }
      removeTaskFromList(listId, taskId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : API_ERROR_MESSAGES.SERVER_ERROR;
      setError(errorMessage);
    }
  };

  const createList = async (name: string, isRoutine: boolean = false) => {
    try {
      if (!name || name.trim().length === 0) {
        setError('List name cannot be empty');
        return;
      }

      if (!user) {
        setError('User must be authenticated to create lists');
        return;
      }

      const response = await apiCreateList(name, user.id, isRoutine);
      
      if (response.error) {
        setError(response.error);
        return;
      }

      const newList: ListType = {
        ...response.data!,
        tasks: []
      };
      
      setLists(prev => [...prev, newList]);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : API_ERROR_MESSAGES.FAILED_TO_CREATE_LIST;
      setError(errorMessage);
    }
  };

  const createTask = async (
    name: string, 
    listId: string
  ) => {
    try {
      if (!name || name.trim().length === 0) {
        setError('Task name cannot be empty');
        return;
      }

      if (!listId) {
        setError('List ID is required');
        return;
      }

      if (!user) {
        setError('User must be authenticated to create tasks');
        return;
      }

      const targetList = lists.find(list => list.id === listId);
      if (!targetList) {
        setError('List not found');
        return;
      }

      const response = await apiCreateTask(
        name,
        listId,
        undefined,
        undefined,
        undefined
      );
      
      if (response.error) {
        setError(response.error);
        return;
      }

      const newTask: TaskType = response.data!;
      addTaskToList(listId, newTask);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : API_ERROR_MESSAGES.FAILED_TO_CREATE_TASK;
      setError(errorMessage);
    }
  };

  const deleteTask = async (listId: string, taskId: string) => {
    try {
      if (!taskId) {
        setError('Task ID is required');
        return;
      }

      if (!listId) {
        setError('List ID is required');
        return;
      }

      if (!user) {
        setError('User must be authenticated to delete tasks');
        return;
      }

      const targetList = lists.find(list => list.id === listId);
      if (!targetList) {
        setError('List not found');
        return;
      }

      const targetTask = targetList.tasks?.find(task => task.id === taskId);
      if (!targetTask) {
        setError('Task not found');
        return;
      }

      const response = await apiDeleteTask(taskId);
      
      if (response.error) {
        setError(response.error);
        return;
      }

      removeTaskFromList(listId, taskId);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : API_ERROR_MESSAGES.SERVER_ERROR;
      setError(errorMessage);
    }
  };

  const updateListGroup = async (listId: string, groupId: string, status: string) => {
    try {
      if (!listId) {
        setError('List ID is required');
        return;
      }

      if (!groupId) {
        setError('Group ID is required');
        return;
      }

      if (!status) {
        setError('Status is required');
        return;
      }

      if (!user) {
        setError('User must be authenticated to update list groups');
        return;
      }

      const targetList = lists.find(list => list.id === listId);
      if (!targetList) {
        setError('List not found');
        return;
      }

      const response = await apiUpdateListGroup(listId, groupId, status);
      
      if (response.error) {
        setError(response.error);
        return;
      }

      setLists(prev => prev.map(list =>
        list.id === listId
          ? {
              ...list,
              lastActiveAt: new Date(),
            }
          : list
      ));
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : API_ERROR_MESSAGES.SERVER_ERROR;
      setError(errorMessage);
    }
  };

  /**
   * Removes a list-group association via API and updates local state
   * 
   * @param listId - The ID of the list to remove from the group
   * @param groupId - The ID of the group to remove the list from
   * 
   * @returns Promise<void> - Resolves when association is removed and state is updated
   * 
   * @throws Sets error state if:
   * - User is not authenticated
   * - List ID or Group ID is invalid
   * - User doesn't have permission to modify the list
   * - API call fails (network error, server error)
   * - Association doesn't exist
   */
  const removeListGroup = async (listId: string, groupId: string) => {
    try {
      if (!listId) {
        setError('List ID is required');
        return;
      }

      if (!groupId) {
        setError('Group ID is required');
        return;
      }

      if (!user) {
        setError('User must be authenticated to remove list groups');
        return;
      }

      const targetList = lists.find(list => list.id === listId);
      if (!targetList) {
        setError('List not found');
        return;
      }

      const response = await apiRemoveListGroup(listId, groupId);
      
      if (response.error) {
        setError(response.error);
        return;
      }

      setLists(prev => prev.map(list =>
        list.id === listId
          ? {
              ...list,
              lastActiveAt: new Date(), 
            }
          : list
      ));
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : API_ERROR_MESSAGES.SERVER_ERROR;
      setError(errorMessage);
    }
  };

  /**
   * Updates or creates a task-user assignment via API and updates local state
   * 
   * @param taskId - The ID of the task to assign to the user
   * @param userId - The ID of the user to assign to the task
   * @param status - The status of the assignment (e.g., "Pending", "Accepted", "Completed")
   * 
   * @returns Promise<void> - Resolves when assignment is updated and state is updated
   * 
   * @throws Sets error state if:
   * - User is not authenticated
   * - Task ID or User ID is invalid
   * - User doesn't have permission to modify the task
   * - API call fails (network error, server error, validation error)
   * - Database constraint violations
   */
  const updateTaskUser = async (taskId: string, userId: string, status: string) => {
    try {
      if (!taskId) {
        setError('Task ID is required');
        return;
      }

      if (!userId) {
        setError('User ID is required');
        return;
      }

      if (!status) {
        setError('Status is required');
        return;
      }

      if (!user) {
        setError('User must be authenticated to update task assignments');
        return;
      }

      const targetList = lists.find(list => 
        list.tasks?.some(task => task.id === taskId)
      );
      
      if (!targetList) {
        setError('Task not found');
        return;
      }

      const response = await apiUpdateTaskUser(taskId, userId, status);
      
      if (response.error) {
        setError(response.error);
        return;
      }

      setLists(prev => prev.map(list =>
        list.id === targetList.id
          ? {
              ...list,
              tasks: (list.tasks || []).map(task =>
                task.id === taskId
                  ? {
                      ...task,
                      lastActiveAt: new Date(), 
                    }
                  : task
              )
            }
          : list
      ));
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : API_ERROR_MESSAGES.SERVER_ERROR;
      setError(errorMessage);
    }
  };

  const updateTask = async (taskId: string, updates: {
    name?: string;              
    taskEffort?: TaskEffortType;
    plannedDate?: Date;         
    priority?: ImportanceType;  
  }) => {
    
    try {
      const response = await modifyTask(taskId, updates);
      
      if (response.error) {
        console.error('API error:', response.error);
        setError(response.error);
        return;
      }

      setLists(prev => prev.map(list => ({
        ...list, 
        tasks: (list.tasks || []).map(task =>
          task.id === taskId 
            ? { 
                ...task,
                ...updates,
                lastActiveAt: new Date(),
                ...(updates.priority && { importance: updates.priority }),
                ...(updates.plannedDate && { deadline: updates.plannedDate })
              }
            : task
        )
      })));
      
    } catch (err) {
      console.error('updateTask error:', err);
      const errorMessage = err instanceof Error ? err.message : API_ERROR_MESSAGES.FAILED_TO_MODIFY_TASK;
      setError(errorMessage);
    }
  };

  const updateListWithAPI = async (listId: string, updates: {
    name?: string;              
    importance?: ImportanceType; 
  }) => {
    
    try {
      const response = await modifyList(listId, updates);
      
      if (response.error) {
        console.error('API error:', response.error);
        setError(response.error);
        return;
      }

      setLists(prev => prev.map(list =>
        list.id === listId 
          ? { 
              ...list,
              ...updates,
              lastActiveAt: new Date(),
              ...(updates.importance && { importance: updates.importance })
            }
          : list
      ));
      
    } catch (err) {
      console.error('updateListWithAPI error:', err);
      const errorMessage = err instanceof Error ? err.message : API_ERROR_MESSAGES.FAILED_TO_MODIFY_LIST;
      setError(errorMessage);
    }
  };

  useEffect(() => {
    fetchUserData(); 
  }, [user]); 


  const value = {
    lists,           
    loading,         
    error,           
    
    refreshData,     
    
    addList,         
    updateList,      
    removeList,      
    addTaskToList,   
    updateTaskInList, 
    removeTaskFromList, 
    
    updateTaskStatus, 
    updateTask,      
    updateListWithAPI, 
    deleteListWithAPI,
    deleteTaskWithAPI,
    
    createList,      
    createTask,      
    deleteTask,      
    updateListGroup, 
    removeListGroup, 
    updateTaskUser  
  };

  return (
    <UserDataContext.Provider value={value}>
      {children} 
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserDataContext);
  return context;
}
