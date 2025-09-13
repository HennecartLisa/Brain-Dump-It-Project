export type UiButtonCreateProps = {
  actionType: "NEW_LIST" | "NEW_ROUTINE" | "NEW_TASK" | "NEW_TRACKER" | "NEW_PROJECT" | "NEW_TASK_ROUTINE";
  onClick?: () => void;
  className?: string;
}; 