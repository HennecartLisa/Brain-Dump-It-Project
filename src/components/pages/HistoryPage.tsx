import { VOCAB } from '../../vocal';
import UiBasicPlaceholder from '../ui/UiBasicPlaceholder';

export default function HistoryPage() {
  return (
    <>
      <UiBasicPlaceholder 
        title={VOCAB.HISTORY_RECENT_ACTIVITY}
        description={VOCAB.RECENT_ACTIVITY_COMING_SOON}
      />
      <UiBasicPlaceholder 
        title={VOCAB.HISTORY_STATISTICS}
        description={VOCAB.USAGE_STATISTICS_COMING_SOON}
      />
      <UiBasicPlaceholder 
        title={VOCAB.HISTORY_ARCHIVE}
        description={VOCAB.HISTORICAL_DATA_COMING_SOON}
      />
    </>
  );
}
