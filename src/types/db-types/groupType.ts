import { GENERAL_STATUS_TYPE } from './generalStatusType.ts';
import type { UserType } from './userType.ts';

export type GroupMemberType = {
  user: UserType;
  joinedAt: Date;
  memberScore?: number;
};

export type GroupType = {
  id: string;
  name: string;
  score: number;
  createdBy?: UserType;
  generalStatus?: typeof GENERAL_STATUS_TYPE[keyof typeof GENERAL_STATUS_TYPE];
  createdAt: Date;
  lastActiveAt: Date;
  members?: GroupMemberType[];
};
