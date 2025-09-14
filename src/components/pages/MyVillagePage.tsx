import AddUserToVillageLayout from '../layouts/addUserToVillageLayout';
import VillageLayout from '../layouts/villageLayout';
import NewVillageLayout from '../layouts/newVillageLayout';
import { VOCAB } from '../../vocal';
import type { UserGroup } from '../../types/db-types/userGroupType';

interface MyVillagePageProps {
  groups: UserGroup[];
  groupsLoading: boolean;
  user: any;
  fetchGroups: () => Promise<void>;
  addUserToGroup: (groupId: string, userId: string) => Promise<void>;
  deleteUserFromGroup: (groupId: string, userId: string) => Promise<void>;
  createMyVillageGroup: () => Promise<void>;
}

export default function MyVillagePage({ 
  groups, 
  groupsLoading, 
  user, 
  fetchGroups, 
  addUserToGroup, 
  deleteUserFromGroup, 
  createMyVillageGroup 
}: MyVillagePageProps) {
  return (
    <>
      <div className="col-span-4">
        <div>
          <AddUserToVillageLayout />
        </div>
        <div>
          {groupsLoading ? (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">{VOCAB.LOADING}</p>
            </div>
          ) : (
            (() => {
              const myVillageGroup = groups.find(group => group.group_name === VOCAB.MY_VILLAGE_GROUP);
              return myVillageGroup ? (
                <VillageLayout
                  groupId={myVillageGroup.group_id}
                  groupName={myVillageGroup.group_name}
                  score={myVillageGroup.score}
                  members={myVillageGroup.members}
                  isCollapsible={false}
                  myVillageMembers={myVillageGroup.members}
                  currentUserId={user?.id}
                  onAddUserToGroup={async (groupId, userId) => {
                    try {
                      await addUserToGroup(groupId, userId);
                      await fetchGroups();
                    } catch (error) {
                      console.error('Error adding user to group:', error);
                    }
                  }}
                  onDeleteUserFromGroup={async (groupId, userId) => {
                    try {
                      await deleteUserFromGroup(groupId, userId);
                      await fetchGroups();
                    } catch (error) {
                      console.error('Error deleting user from group:', error);
                    }
                  }}
                  onLeaveGroup={async (groupId, userId) => {
                    try {
                      await deleteUserFromGroup(groupId, userId);
                      await fetchGroups();
                    } catch (error) {
                      console.error('Error leaving group:', error);
                    }
                  }}
                />
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-4">{VOCAB.MY_VILLAGE_GROUP_NOT_FOUND}</p>
                  <button 
                    onClick={async () => {
                      try {
                        await createMyVillageGroup();
                        await fetchGroups();
                      } catch (error) {
                        console.error('Error creating My Village group:', error);
                      }
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    {VOCAB.CREATE_MY_VILLAGE_GROUP}
                  </button>
                </div>
              );
            })()
          )}
        </div>
      </div>
      <div className="col-span-4">
        <div>
          {groupsLoading ? (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">{VOCAB.LOADING}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groups
                .filter(group => group.group_name !== VOCAB.MY_VILLAGE_GROUP)
                .map(group => {
                  const myVillageGroup = groups.find(g => g.group_name === VOCAB.MY_VILLAGE_GROUP);
                  return (
                    <VillageLayout
                      key={group.group_id}
                      groupId={group.group_id}
                      groupName={group.group_name}
                      score={group.score}
                      members={group.members}
                      isCollapsible={true}
                      myVillageMembers={myVillageGroup?.members || []}
                      currentUserId={user?.id}
                      onAddUserToGroup={async (groupId, userId) => {
                        try {
                          await addUserToGroup(groupId, userId);
                          await fetchGroups();
                        } catch (error) {
                          console.error('Error adding user to group:', error);
                        }
                      }}
                      onDeleteUserFromGroup={async (groupId, userId) => {
                        try {
                          await deleteUserFromGroup(groupId, userId);
                          await fetchGroups();
                        } catch (error) {
                          console.error('Error deleting user from group:', error);
                        }
                      }}
                      onLeaveGroup={async (groupId, userId) => {
                        try {
                          await deleteUserFromGroup(groupId, userId);
                          await fetchGroups();
                        } catch (error) {
                          console.error('Error leaving group:', error);
                        }
                      }}
                    />
                  );
                })
              }
              {groups.filter(group => group.group_name !== VOCAB.MY_VILLAGE_GROUP).length === 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">{VOCAB.NO_GROUPS_FOUND}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="col-span-4">
        <div>
          <NewVillageLayout onGroupCreated={fetchGroups} />
        </div>
      </div>
    </>
  );
}
