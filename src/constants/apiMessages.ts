// API Error Messages
export const API_ERROR_MESSAGES = {
  // Generic errors
  FAILED_TO_CREATE_LIST: "Failed to create list",
  FAILED_TO_FETCH_LISTS: "Failed to fetch lists", 
  FAILED_TO_CREATE_TASK: "Failed to create task",
  FAILED_TO_FETCH_TASKS: "Failed to fetch tasks",
  FAILED_TO_MODIFY_TASK_STATUS: "Failed to modify task status",
  FAILED_TO_MODIFY_TASK: "Failed to modify task",
  FAILED_TO_MODIFY_LIST: "Failed to modify list",
  FAILED_TO_FETCH_USER_DATA: "Failed to fetch user data",
  FAILED_TO_UPDATE_TASK_STATUS: "Failed to update task status",
  FAILED_TO_FETCH_CHALLENGE_TYPES: "Failed to fetch challenge types",
  FAILED_TO_CREATE_CHALLENGE_TYPE: "Failed to create challenge type",
  FAILED_TO_FETCH_THEMES: "Failed to fetch themes",
  FAILED_TO_FETCH_COMFORT_MODE: "Failed to fetch comfort mode",
  FAILED_TO_UPDATE_COMFORT_MODE: "Failed to update comfort mode",
  FAILED_TO_DELETE_TASK: "Failed to delete task",
  FAILED_TO_UPDATE_LIST_GROUP: "Failed to update list group",
  FAILED_TO_REMOVE_LIST_GROUP: "Failed to remove list group",
  
  // Authentication errors
  FAILED_TO_AUTHENTICATE: "Failed to authenticate user",
  FAILED_TO_CREATE_ACCOUNT: "Failed to create account", 
  FAILED_TO_LOGIN: "Failed to login",
  
  // Validation errors
  DISPLAY_NAME_TAKEN: "Display name is taken",
  PASSWORD_TOO_WEAK: "Password too weak",
  INVALID_INPUT: "Invalid input provided",
  
  // Network/Connection errors
  CONNECTION_FAILED: "Connection failed",
  NETWORK_ERROR: "Network error occurred",
  SERVER_ERROR: "Server error occurred",
} as const;

// API Success Messages  
export const API_SUCCESS_MESSAGES = {
  LIST_CREATED: "List created successfully",
  TASK_CREATED: "Task created successfully", 
  TASK_STATUS_UPDATED: "Task status updated successfully",
  ACCOUNT_CREATED: "Account created. Check your email to verify",
  LOGIN_SUCCESSFUL: "Login successful",
  LOGOUT_SUCCESSFUL: "Logout successful",
} as const;


export type ApiErrorMessage = typeof API_ERROR_MESSAGES[keyof typeof API_ERROR_MESSAGES];
export type ApiSuccessMessage = typeof API_SUCCESS_MESSAGES[keyof typeof API_SUCCESS_MESSAGES];
