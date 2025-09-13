import { Button } from 'flowbite-react';
import { useState } from 'react';
import { createGroup } from '../../api/supabaseApi';
import { VOCAB } from '../../vocal';
import UiTextInput from '../ui/UiTextInput';
import UiBannerMessage from '../ui/UiBannerMessage';
import type { BannerMessage } from '../../types/BannerMessageType';
import { BANNER_MESSAGE_TYPE } from '../../types/db-types/bannerMessageType';

interface NewVillageLayoutProps {
  onGroupCreated?: () => void;
}

export default function NewVillageLayout({ onGroupCreated }: NewVillageLayoutProps) {
  const [showForm, setShowForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<BannerMessage | null>(null);

  const isGroupNameValid = groupName.trim().length > 0 && groupName.trim() !== VOCAB.MY_VILLAGE_GROUP;

  const handleCreateGroup = async () => {
    if (!isGroupNameValid) return;

    setLoading(true);
    setBanner(null);

    try {
      const result = await createGroup(groupName.trim());
      
      if (result.data?.success) {
        setBanner({ type: BANNER_MESSAGE_TYPE.SUCCESS, message: 'Group created successfully!' });
        setGroupName('');
        setShowForm(false);
        
        if (onGroupCreated) {
          onGroupCreated();
        }
      } else {
        setBanner({ type: BANNER_MESSAGE_TYPE.FAILURE, message: result.error || 'Failed to create group' });
      }
    } catch (error: any) {
      setBanner({ type: BANNER_MESSAGE_TYPE.FAILURE, message: error?.message || 'Failed to create group' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setGroupName('');
    setBanner(null);
  };

  return (
    <div className="w-full p-4 bg-white border border-gray-200 rounded-lg shadow" style={{width: '100%'}}>
      <div className="space-y-4">
        {!showForm ? (
          <Button
            onClick={() => setShowForm(true)}
            className="w-full"
            color="blue"
          >
            Create New Group
          </Button>
        ) : (
          <div className="space-y-4">
            <UiTextInput
              id="group-name-input"
              label="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name..."
            />
            
            <div className="flex space-x-2">
              <Button
                onClick={handleCreateGroup}
                disabled={!isGroupNameValid || loading}
                className="flex-1"
                color="blue"
              >
                {loading ? 'Creating...' : 'Create Group'}
              </Button>
              
              <Button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1"
                color="gray"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

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
