import type { IconType } from "react-icons";

export interface UiSidebarCollapseItemProps {
  name: string;
  reactIcon: IconType;
  items: { [key: string]: string }; // key is the name and value the link associated
}
