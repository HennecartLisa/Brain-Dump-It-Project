import { IMPORTANCE_TYPE } from './importanceType.ts';
import type { TaskType } from './taskType.ts';
import type { GroupType } from './groupType.ts';
import type { RepeatType } from './repeatType.ts';
import type { UserType } from './userType.ts';

export type ListType = {
  id: string;
  name: string;
  importance: typeof IMPORTANCE_TYPE[keyof typeof IMPORTANCE_TYPE];
  repeat?: RepeatType;
  createdBy?: UserType;
  createdAt: Date;
  lastActiveAt: Date;
  isRoutine: boolean;
  tasks?: TaskType[];
  groups?: GroupType[];
};
