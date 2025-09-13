import type { ListType } from './listType.ts';
import type { GroupType } from './groupType.ts';

export type UserType = {
  id: string;
  lists?: ListType[];
  groups?: GroupType[];
};
