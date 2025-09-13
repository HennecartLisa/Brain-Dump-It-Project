import './App.css'
import { useState, useEffect } from 'react';

import UiSidebar from './components/sidebar/UiSidebar.tsx';
import { useAuth } from './auth/useAuth.ts';
import SignForm from './components/logSign/SingForm.tsx';
import { VOCAB } from './vocal';
import RoutineBoardLayout from './components/layouts/RoutineBoardLayout.tsx';
import BrainDumpLayout from './components/layouts/BrainDumpLayout.tsx';
import ChallengesBoardLayout from './components/layouts/ChallengesBoardLayout.tsx';
import MealPlannerBoardLayout from './components/layouts/MealPlannerBoardLayout.tsx';
import CalendarBoardLayout from './components/layouts/CalendarBoardLayout.tsx';
import DayBoardLayout from './components/layouts/DayBoardLayout.tsx';
import TaskBoardLayout from './components/layouts/TaskBoardLayout.tsx';
import EmotionalWeatherBoardLayout from './components/layouts/EmotionalWeatherBoardLayout.tsx';
import AddUserToVillageLayout from './components/layouts/addUserToVillageLayout.tsx';
import VillageLayout from './components/layouts/villageLayout.tsx';
import NewVillageLayout from './components/layouts/newVillageLayout.tsx';
import { UserDataProvider } from './context/UserDataContext.tsx';
import { getUserGroups, createMyVillageGroup, addUserToGroup, deleteUserFromGroup, anonymizeUser } from './api/supabaseApi';
import DeleteAccountModal from './components/ui/DeleteAccountModal.tsx';
import UiButton from './components/ui/UiButton.tsx';
import UiBannerMessage from './components/ui/UiBannerMessage.tsx';
import type { UserGroup } from './types/db-types/userGroupType';
import type { ViewType } from './types/UiSidebarProps';
import type { BannerMessage } from './types/BannerMessageType';
import { BANNER_MESSAGE_TYPE } from './types/db-types/bannerMessageType';

function App() {
  const { user, loading, signOut } = useAuth();
  const [activeView, setActiveView] = useState<ViewType>('my-brain');
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [banner, setBanner] = useState<BannerMessage | null>(null);

  useEffect(() => {
    if (user && activeView === 'my-village') {
      fetchGroups();
    }
  }, [user, activeView]);

  const fetchGroups = async () => {
    setGroupsLoading(true);
    try {
      const result = await getUserGroups();
      if (result.data) {
        setGroups(result.data);
        
        const myVillageGroup = result.data.find(group => group.group_name === VOCAB.MY_VILLAGE_GROUP);
        if (myVillageGroup && myVillageGroup.members.length === 0 && user) {
        }
        
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setGroupsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setBanner(null);
    
    try {
      const result = await anonymizeUser();
      
      if (result.error) {
        setBanner({ 
          type: BANNER_MESSAGE_TYPE.FAILURE, 
          message: result.error || VOCAB.DELETE_PROFILE_ERROR 
        });
      } else {
        setBanner({ 
          type: BANNER_MESSAGE_TYPE.SUCCESS, 
          message: VOCAB.DELETE_PROFILE_SUCCESS 
        });
        
        setDeleteModalOpen(false);
        setTimeout(() => {
          signOut();
        }, 2000); 
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setBanner({ 
        type: BANNER_MESSAGE_TYPE.FAILURE, 
        message: VOCAB.DELETE_PROFILE_ERROR 
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <p className="p-4">{VOCAB.LOADING}</p>; 
  }

  if (!user) {
    return <SignForm />;
  }
  
  return (
    <UserDataProvider>
      <div className="flex w-full">
        <div className="w-64 flex-shrink-0">
          <UiSidebar onViewChange={setActiveView} activeView={activeView}></UiSidebar>
        </div>

        <div className="w-[calc(100%-64 rem)]">
          {banner && (
            <UiBannerMessage
              message={banner.message}
              color={banner.type}
              onClose={() => setBanner(null)}
            />
          )}
          <div className="flex flex-col grid grid-cols-12 gap-4">
            {activeView === 'my-account' ? (
              <>
                <div className="col-span-4">
                  <div className="row-span-2">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">My Account - Profile</h3>
                      <p className="text-gray-600">Account settings and profile management coming soon...</p>
                    </div>
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="row-span-2">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">My Account - Preferences</h3>
                      <p className="text-gray-600">User preferences and settings coming soon...</p>
                    </div>
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="row-span-2">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">My Account - Security</h3>
                      <div className="space-y-4">
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                          <h4 className="font-medium text-red-800 mb-2">Danger Zone</h4>
                          <p className="text-red-700 text-sm mb-3">
                            Once you delete your account, there is no going back. Please be certain.
                          </p>
                          <UiButton 
                            variant="danger"
                            onClick={() => setDeleteModalOpen(true)}
                          >
                            {VOCAB.DELETE_PROFILE_BUTTON}
                          </UiButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : activeView === 'my-brain' ? (
              <>
                <div className="col-span-4">
                  <div className="row-span-2">
                    <ChallengesBoardLayout></ChallengesBoardLayout>
                  </div>
                  <div className="row-span-2">
                    <RoutineBoardLayout></RoutineBoardLayout>
                  </div>
                  <div className="row-span-2">
                    <MealPlannerBoardLayout></MealPlannerBoardLayout>
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="row-span-2">
                    <CalendarBoardLayout></CalendarBoardLayout>
                  </div>
                  <div className="row-span-2">
                    <DayBoardLayout></DayBoardLayout>
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="row-span-2">
                    <BrainDumpLayout></BrainDumpLayout>
                  </div>
                  <div className="row-span-2">
                    <TaskBoardLayout></TaskBoardLayout>
                  </div>
                  <div className="row-span-2">
                    <EmotionalWeatherBoardLayout></EmotionalWeatherBoardLayout>
                  </div>
                </div>
              </>
            ) : activeView === 'projects' ? (
              <>
                <div className="col-span-4">
                  <div className="row-span-2">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">Projects - Active</h3>
                      <p className="text-gray-600">Active projects coming soon...</p>
                    </div>
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="row-span-2">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">Projects - Planning</h3>
                      <p className="text-gray-600">Project planning tools coming soon...</p>
                    </div>
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="row-span-2">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">Projects - Archive</h3>
                      <p className="text-gray-600">Completed projects coming soon...</p>
                    </div>
                  </div>
                </div>
              </>
            ) : activeView === 'my-village' ? (
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
                                const result = await addUserToGroup(groupId, userId);
                                if (result.error) {
                                  console.error('Failed to add user to group:', result.error);
                                } else {
                                  await fetchGroups();
                                }
                              } catch (error) {
                                console.error('Error adding user to group:', error);
                              }
                            }}
                            onDeleteUserFromGroup={async (groupId, userId) => {
                              try {
                                const result = await deleteUserFromGroup(groupId, userId);
                                if (result.error) {
                                  console.error('Failed to delete user from group:', result.error);
                                } else {
                                  await fetchGroups();
                                }
                              } catch (error) {
                                console.error('Error deleting user from group:', error);
                              }
                            }}
                            onLeaveGroup={async (groupId, userId) => {
                              try {
                                const result = await deleteUserFromGroup(groupId, userId);
                                if (result.error) {
                                  console.error('Failed to leave group:', result.error);
                                } else {
                                  await fetchGroups();
                                }
                              } catch (error) {
                                console.error('Error leaving group:', error);
                              }
                            }}
                          />
                        ) : (
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-600 mb-4">My Village group not found</p>
                            <button 
                              onClick={async () => {
                                try {
                                  const result = await createMyVillageGroup();
                                  if (result.data?.success) {
                                    await fetchGroups();
                                  } else {
                                    console.error('Failed to create My Village group:', result.error);
                                  }
                                } catch (error) {
                                  console.error('Error creating My Village group:', error);
                                }
                              }}
                              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              Create My Village Group
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
                                    const result = await addUserToGroup(groupId, userId);
                                    if (result.error) {
                                      console.error('Failed to add user to group:', result.error);
                                    } else {
                                      await fetchGroups();
                                    }
                                  } catch (error) {
                                    console.error('Error adding user to group:', error);
                                  }
                                }}
                                onDeleteUserFromGroup={async (groupId, userId) => {
                                  try {
                                    const result = await deleteUserFromGroup(groupId, userId);
                                    if (result.error) {
                                      console.error('Failed to delete user from group:', result.error);
                                    } else {
                                      await fetchGroups();
                                    }
                                  } catch (error) {
                                    console.error('Error deleting user from group:', error);
                                  }
                                }}
                                onLeaveGroup={async (groupId, userId) => {
                                  try {
                                    const result = await deleteUserFromGroup(groupId, userId);
                                    if (result.error) {
                                      console.error('Failed to leave group:', result.error);
                                    } else {
                                      await fetchGroups();
                                    }
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
            ) : activeView === 'history' ? (
              <>
                <div className="col-span-4">
                  <div className="row-span-2">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">History - Recent Activity</h3>
                      <p className="text-gray-600">Recent activity history coming soon...</p>
                    </div>
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="row-span-2">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">History - Statistics</h3>
                      <p className="text-gray-600">Usage statistics coming soon...</p>
                    </div>
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="row-span-2">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">History - Archive</h3>
                      <p className="text-gray-600">Historical data archive coming soon...</p>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
      
      <DeleteAccountModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        isLoading={deleteLoading}
      />
    </UserDataProvider>
  )
}

export default App
