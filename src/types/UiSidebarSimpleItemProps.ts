import type { IconType } from "react-icons";
import type { MouseEventHandler } from "react";

export interface UiSidebarSimpleItemProps {
  name: string;
  reactIcon?: IconType;
  onClick?: MouseEventHandler<HTMLDivElement>;
  isActive?: boolean;
}
