import type { GroupMember } from './groupMemberType';

export interface UserGroup {
  group_id: string;
  group_name: string;
  score: number;
  created_at: string;
  last_active_at: string;
  members: GroupMember[];
}
