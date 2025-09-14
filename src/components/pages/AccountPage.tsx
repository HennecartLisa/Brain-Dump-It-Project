import UiButton from '../ui/UiButton';
import UiBasicPlaceholder from '../ui/UiBasicPlaceholder';
import { VOCAB } from '../../vocal';

interface AccountPageProps {
  onDeleteModalOpen: () => void;
}

export default function AccountPage({ onDeleteModalOpen }: AccountPageProps) {
  return (
    <>
      <UiBasicPlaceholder 
        title={VOCAB.MY_ACCOUNT_PROFILE}
        description={VOCAB.ACCOUNT_SETTINGS_COMING_SOON}
      />
      <UiBasicPlaceholder 
        title={VOCAB.MY_ACCOUNT_PREFERENCES}
        description={VOCAB.USER_PREFERENCES_COMING_SOON}
      />
      <div className="col-span-4">
        <div className="row-span-2">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">{VOCAB.MY_ACCOUNT_SECURITY}</h3>
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-medium text-red-800 mb-2">{VOCAB.DANGER_ZONE}</h4>
                <p className="text-red-700 text-sm mb-3">
                  {VOCAB.DELETE_ACCOUNT_WARNING}
                </p>
                <UiButton 
                  variant="danger"
                  onClick={onDeleteModalOpen}
                >
                  {VOCAB.DELETE_PROFILE_BUTTON}
                </UiButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
