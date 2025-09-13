import { Accordion, AccordionContent, AccordionPanel, AccordionTitle, Button, Dropdown, DropdownItem } from 'flowbite-react';
import { useState, useEffect } from 'react';
import UiUserList from '../ui/UiUserList';
import type { GroupMember } from '../../types/db-types/groupMemberType';
import { VOCAB } from '../../vocal';

interface VillageLayoutProps {
  groupId: string;
  groupName: string;
  score: number;
  members: GroupMember[];
  isCollapsible?: boolean;
  onAddUserToGroup?: (groupId: string, userId: string) => Promise<void>;
  onDeleteUserFromGroup?: (groupId: string, userId: string) => Promise<void>;
  onLeaveGroup?: (groupId: string, userId: string) => Promise<void>;
  myVillageMembers?: GroupMember[];
  currentUserId?: string;
}

export default function VillageLayout({ 
  groupId,
  groupName, 
  score, 
  members, 
  isCollapsible = false,
  onAddUserToGroup,
  onDeleteUserFromGroup,
  onLeaveGroup,
  myVillageMembers = [],
  currentUserId
}: VillageLayoutProps) {
  const [isOpen, setIsOpen] = useState(!isCollapsible);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string>('');
  const [leavingUserId, setLeavingUserId] = useState<string>('');

  const isMyVillage = groupName === VOCAB.MY_VILLAGE_GROUP;

  const availableUsers = myVillageMembers.filter(
    villageMember => !members.some(groupMember => groupMember.user_id === villageMember.user_id)
  );

  useEffect(() => {
    if (selectedUserId && !availableUsers.some(user => user.user_id === selectedUserId)) {
      setSelectedUserId('');
    }
  }, [selectedUserId, availableUsers]);

  const handleAddUser = async () => {
    if (!selectedUserId || !onAddUserToGroup) return;
    
    setIsAddingUser(true);
    try {
      await onAddUserToGroup(groupId, selectedUserId);
      setSelectedUserId('');
    } catch (error) {
      console.error('Error adding user to group:', error);
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!onDeleteUserFromGroup) return;
    
    setDeletingUserId(userId);
    try {
      await onDeleteUserFromGroup(groupId, userId);
    } catch (error) {
      console.error('Error deleting user from group:', error);
    } finally {
      setDeletingUserId('');
    }
  };

  const handleLeaveGroup = async (userId: string) => {
    if (!onLeaveGroup) return;
    
    setLeavingUserId(userId);
    try {
      await onLeaveGroup(groupId, userId);
    } catch (error) {
      console.error('Error leaving group:', error);
    } finally {
      setLeavingUserId('');
    }
  };

  const content = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{groupName}</h3>
          <p className="text-sm text-gray-500">Score: {score}</p>
        </div>
      </div>
      
      <UiUserList 
        users={members} 
        showDeleteButtons={true}
        showLeaveButtons={true}
        onDeleteUser={handleDeleteUser}
        onLeaveUser={handleLeaveGroup}
        deletingUserId={deletingUserId}
        leavingUserId={leavingUserId}
        currentUserId={currentUserId}
      />
      
      {isMyVillage && members.length === 0 && onAddUserToGroup && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 mb-3">
            You are not a member of your own "My Village" group. Click below to join.
          </p>
          <Button
            onClick={async () => {
              try {
                const currentUser = JSON.parse(localStorage.getItem('sb-ejgvjjhkfmpelzmmlkbg-auth-token') || '{}');
                const userId = currentUser?.user?.id;
                if (userId) {
                  await onAddUserToGroup(groupId, userId);
                } else {
                  console.error('Could not get current user ID');
                }
              } catch (error) {
                console.error('Error adding user to group:', error);
              }
            }}
            color="yellow"
            size="sm"
          >
            Join My Village Group
          </Button>
        </div>
      )}

      {!isMyVillage && availableUsers.length > 0 && onAddUserToGroup && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 mb-3">
            Invite someone from your village to this group:
          </p>
          <div className="flex gap-2">
            <Dropdown
              label={selectedUserId ? availableUsers.find(m => m.user_id === selectedUserId)?.display_name || 'Select user' : 'Select user'}
              dismissOnClick={false}
              className="flex-1"
            >
              {availableUsers.map((member) => (
                <DropdownItem
                  key={member.user_id}
                  onClick={() => setSelectedUserId(member.user_id)}
                >
                  {member.display_name}
                </DropdownItem>
              ))}
            </Dropdown>
            <Button
              onClick={handleAddUser}
              disabled={!selectedUserId || isAddingUser}
              color="blue"
              size="sm"
            >
              {isAddingUser ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  if (isCollapsible) {
    return (
      <div className="w-full p-4 bg-white border border-gray-200 rounded-lg shadow" style={{width: '100%'}}>
        <Accordion>
          <AccordionPanel>
            <AccordionTitle 
              className="text-lg font-semibold"
              onClick={() => setIsOpen(!isOpen)}
            >
              <div className="w-full flex items-center justify-between">
                <div className="flex-1">
                  <div>{groupName}</div>
                  <div className="text-sm text-gray-500 font-normal mt-1">
                    {members.length} member{members.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </AccordionTitle>
            <AccordionContent>
              {content}
            </AccordionContent>
          </AccordionPanel>
        </Accordion>
      </div>
    );
  }

  return (
    <div className="w-full p-4 bg-white border border-gray-200 rounded-lg shadow" style={{width: '100%'}}>
      {content}
    </div>
  );
}
