import './App.css'
import { useState, useEffect } from 'react';

import UiSidebar from './components/sidebar/UiSidebar.tsx';
import { useAuth } from './auth/useAuth.ts';
import SignForm from './components/logSign/SingForm.tsx';
import { VOCAB } from './vocal';
import AccountPage from './components/pages/AccountPage';
import MyBrainPage from './components/pages/MyBrainPage';
import ProjectsPage from './components/pages/ProjectsPage';
import MyVillagePage from './components/pages/MyVillagePage';
import HistoryPage from './components/pages/HistoryPage';
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
              <AccountPage onDeleteModalOpen={() => setDeleteModalOpen(true)} />
            ) : activeView === 'my-brain' ? (
              <MyBrainPage />
            ) : activeView === 'projects' ? (
              <ProjectsPage />
            ) : activeView === 'my-village' ? (
              <MyVillagePage 
                groups={groups}
                groupsLoading={groupsLoading}
                user={user}
                fetchGroups={fetchGroups}
                addUserToGroup={async (groupId, userId) => {
                  const result = await addUserToGroup(groupId, userId);
                  if (result.error) {
                    console.error('Failed to add user to group:', result.error);
                  }
                }}
                deleteUserFromGroup={async (groupId, userId) => {
                  const result = await deleteUserFromGroup(groupId, userId);
                  if (result.error) {
                    console.error('Failed to delete user from group:', result.error);
                  }
                }}
                createMyVillageGroup={async () => {
                  const result = await createMyVillageGroup();
                  if (!result.data?.success) {
                    console.error('Failed to create My Village group:', result.error);
                  }
                }}
              />
            ) : activeView === 'history' ? (
              <HistoryPage />
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
