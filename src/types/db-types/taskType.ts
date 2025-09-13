import { TASK_STATUS_TYPE } from './taskStatusType.ts';
import { IMPORTANCE_TYPE } from './importanceType.ts';
import { TASK_EFFORT_TYPE } from './taskEffortType.ts';
import type { RepeatType } from './repeatType.ts';
import type { UserType } from './userType.ts';

export type TaskType = {
  id: string;
  name: string;
  taskStatus: typeof TASK_STATUS_TYPE[keyof typeof TASK_STATUS_TYPE];
  importance: typeof IMPORTANCE_TYPE[keyof typeof IMPORTANCE_TYPE];
  taskEffort?: typeof TASK_EFFORT_TYPE[keyof typeof TASK_EFFORT_TYPE];
  deadline?: Date;
  repeat?: RepeatType;
  lastActiveAt: Date;
  createdAt: Date;
  daysDone: number;
  createdBy?: UserType;
  assignedUser?: UserType;
  assignedAt?: Date;
  completedAt?: Date;
};
