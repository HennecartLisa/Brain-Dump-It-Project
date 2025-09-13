import { ListItem, Button } from 'flowbite-react';
import type { UserStatusType } from '../../types/db-types/userStatusType';
import type { UserRoleType } from '../../types/db-types/userRoleType';

interface UiUserElementProps {
  id: string;
  displayName: string;
  role: UserRoleType;
  status: UserStatusType;
  score: number;
  joinedAt: string;
  lastActiveAt: string;
  showDeleteButton?: boolean;
  showLeaveButton?: boolean;
  onDelete?: (userId: string) => Promise<void>;
  onLeave?: (userId: string) => Promise<void>;
  isDeleting?: boolean;
  isLeaving?: boolean;
}

export default function UiUserElement({
  id,
  displayName,
  role,
  status,
  score,
  joinedAt,
  lastActiveAt,
  showDeleteButton = false,
  showLeaveButton = false,
  onDelete,
  onLeave,
  isDeleting = false,
  isLeaving = false
}: UiUserElementProps) {
  const getStatusColor = (status: UserStatusType): string => {
    switch (status) {
      case 'Accepted':
        return 'text-green-600';
      case 'Pending':
        return 'text-yellow-600';
      case 'Rejected':
        return 'text-red-600';
      case 'Inactive':
        return 'text-gray-500';
      case 'Removed':
        return 'text-red-500';
      default:
        return 'text-gray-600';
    }
  };

  const getRoleColor = (role: UserRoleType): string => {
    switch (role) {
      case 'Admin':
        return 'text-purple-600 font-semibold';
      case 'Member':
        return 'text-blue-600';
      case 'Guest':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete(id);
    }
  };

  const handleLeave = async () => {
    if (onLeave) {
      await onLeave(id);
    }
  };

  return (
    <ListItem className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
      <div className="flex-1">
        <div className="font-medium text-gray-900">{displayName}</div>
        <div className="text-sm text-gray-500">
          <span className={`${getRoleColor(role)}`}>{role}</span>
          <span className="mx-2">•</span>
          <span className={`${getStatusColor(status)}`}>{status}</span>
          <span className="mx-2">•</span>
          <span className="text-gray-600">Score: {score}</span>
        </div>
      </div>
      {showDeleteButton && onDelete && (
        <Button
          onClick={handleDelete}
          disabled={isDeleting}
          color="red"
          size="xs"
          className="ml-2"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      )}
      {showLeaveButton && onLeave && (
        <Button
          onClick={handleLeave}
          disabled={isLeaving}
          color="yellow"
          size="xs"
          className="ml-2"
        >
          {isLeaving ? 'Leaving...' : 'Leave village'}
        </Button>
      )}
    </ListItem>
  );
}
