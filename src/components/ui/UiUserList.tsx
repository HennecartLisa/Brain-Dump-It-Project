import { List } from 'flowbite-react';
import UiUserElement from './UiUserElement';
import { VOCAB } from '../../vocal';
import type { GroupMember } from '../../types/db-types/groupMemberType';

interface UiUserListProps {
  users: GroupMember[];
  emptyMessage?: string;
  showDeleteButtons?: boolean;
  showLeaveButtons?: boolean;
  onDeleteUser?: (userId: string) => Promise<void>;
  onLeaveUser?: (userId: string) => Promise<void>;
  deletingUserId?: string;
  leavingUserId?: string;
  currentUserId?: string;
}

export default function UiUserList({ 
  users, 
  emptyMessage = VOCAB.NO_MEMBERS_FOUND,
  showDeleteButtons = false,
  showLeaveButtons = false,
  onDeleteUser,
  onLeaveUser,
  deletingUserId,
  leavingUserId,
  currentUserId
}: UiUserListProps) {
  if (users.length === 0) {
    return (
      <div className="text-gray-500 text-sm p-4 text-center">
        {emptyMessage}
      </div>
    );
  }

  return (
    <List unstyled className="w-full space-y-2">
      {users.map((user) => (
        <UiUserElement
          key={user.user_id}
          id={user.user_id}
          displayName={user.display_name}
          role={user.role_name as any}
          status={user.status as any}
          score={user.score}
          joinedAt={user.joined_at}
          lastActiveAt={user.last_active_at}
          showDeleteButton={showDeleteButtons && user.user_id !== currentUserId}
          showLeaveButton={showLeaveButtons && user.user_id === currentUserId}
          onDelete={onDeleteUser}
          onLeave={onLeaveUser}
          isDeleting={deletingUserId === user.user_id}
          isLeaving={leavingUserId === user.user_id}
        />
      ))}
    </List>
  );
}
