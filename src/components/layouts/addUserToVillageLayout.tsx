import { Button } from 'flowbite-react';
import { useState } from 'react';
import { getProfileByUsername, addUserToGroup, getUserGroups } from '../../api/supabaseApi';
import { VOCAB } from '../../vocal';
import UiTextInput from '../ui/UiTextInput';
import UiBannerMessage from '../ui/UiBannerMessage';
import { BANNER_MESSAGE_TYPE } from '../../types/db-types/bannerMessageType';
import type { BannerMessage } from '../../types/BannerMessageType';

export default function AddUserToVillageLayout() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<BannerMessage | null>(null);

  const handleAddUser = async () => {
    if (!username.trim()) {
      setBanner({ type: BANNER_MESSAGE_TYPE.FAILURE, message: 'Please enter a username' });
      return;
    }

    setLoading(true);
    setBanner(null);

    try {
      const profileResult = await getProfileByUsername(username.trim());
      
      if (profileResult.error) {
        setBanner({ type: BANNER_MESSAGE_TYPE.FAILURE, message: profileResult.error });
        return;
      }

      if (!profileResult.data) {
        setBanner({ type: BANNER_MESSAGE_TYPE.FAILURE, message: 'User not found' });
        return;
      }

      const groupsResult = await getUserGroups();
      
      if (groupsResult.error) {
        setBanner({ type: BANNER_MESSAGE_TYPE.FAILURE, message: groupsResult.error });
        return;
      }

      const myVillageGroup = groupsResult.data?.find(group => group.group_name === VOCAB.MY_VILLAGE_GROUP);
      
      if (!myVillageGroup) {
        setBanner({ type: BANNER_MESSAGE_TYPE.FAILURE, message: 'My Village group not found' });
        return;
      }
      
      const addResult = await addUserToGroup(myVillageGroup.group_id, profileResult.data.id);
      
      if (addResult.error) {
        setBanner({ type: BANNER_MESSAGE_TYPE.FAILURE, message: addResult.error });
        return;
      }

      setBanner({ type: BANNER_MESSAGE_TYPE.SUCCESS, message: `Successfully added ${profileResult.data.displayName} to your village!` });
      setUsername('');
      
    } catch (error) {
      setBanner({ type: BANNER_MESSAGE_TYPE.FAILURE, message: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-4 bg-white border border-gray-200 rounded-lg shadow" style={{width: '100%'}}>
      <div className="space-y-4">
        <UiTextInput
          id="username-input"
          label={VOCAB.USER_DISPLAY_NAME}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter display name..."
        />
        
        <Button 
          onClick={handleAddUser}
          disabled={loading || !username.trim()}
          className="w-full"
        >
          {loading ? 'Adding...' : VOCAB.ADD_USER_TO_VILLAGE}
        </Button>

        {banner && (
          <UiBannerMessage
            color={banner.type}
            message={banner.message}
            onClose={() => setBanner(null)}
          />
        )}
      </div>
    </div>
  );
}
