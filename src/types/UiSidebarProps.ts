export type ViewType = 'my-account' | 'my-brain' | 'projects' | 'my-village' | 'history';

export interface UiSidebarProps {
  onViewChange?: (view: ViewType) => void;
  activeView?: ViewType;
}
