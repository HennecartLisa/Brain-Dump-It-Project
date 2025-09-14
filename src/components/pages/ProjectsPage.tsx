import { VOCAB } from '../../vocal';
import UiBasicPlaceholder from '../ui/UiBasicPlaceholder';

export default function ProjectsPage() {
  return (
    <>
      <UiBasicPlaceholder 
        title={VOCAB.PROJECTS_ACTIVE}
        description={VOCAB.ACTIVE_PROJECTS_COMING_SOON}
      />
      <UiBasicPlaceholder 
        title={VOCAB.PROJECTS_PLANNING}
        description={VOCAB.PROJECT_PLANNING_COMING_SOON}
      />
      <UiBasicPlaceholder 
        title={VOCAB.PROJECTS_ARCHIVE}
        description={VOCAB.COMPLETED_PROJECTS_COMING_SOON}
      />
    </>
  );
}
