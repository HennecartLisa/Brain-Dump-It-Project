import { Button } from "flowbite-react";
import { FaPlus } from 'react-icons/fa';
import type { UiButtonCreateProps } from "../../types/UiButtonCreateProps";
import { VOCAB } from "../../vocal";

export default function UiButtonCreate({ actionType, onClick, className = "" }: UiButtonCreateProps) {
  const getButtonText = () => {
    switch (actionType) {
      case "NEW_LIST":
        return "Create List";
      case "NEW_ROUTINE":
        return "Create Routine";
      case "NEW_TASK":
        return "Create Task";
      case "NEW_TRACKER":
        return "Create Tracker";
      case "NEW_PROJECT":
        return "Create Project";
      case "NEW_TASK_ROUTINE":
        return "Create Task";
      default:
        return "Create";
    }
  };

  return (
    <Button 
      className={`flex items-center space-x-2 text-sm font-medium px-4 py-2 ${className}`}
      onClick={onClick}
    >
      <FaPlus className="text-base" />
      <span>{getButtonText()}</span>
    </Button>
  );
} 