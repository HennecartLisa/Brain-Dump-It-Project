import { Checkbox, Label, Tooltip } from "flowbite-react";
import { BsThreeDots } from 'react-icons/bs';
import CrudAction from '../Crud/CrudAction';
import type { BrainDumpOption } from "../../types/BrainDumpOptions";
import { TASK_STATUS_TYPE } from '../../types/db-types/taskStatusType';
import type { TaskStatusType } from '../../types/db-types/taskStatusType';
import { useUserData } from '../../context/UserDataContext';

export type UiCheckboxElementProps = {
  id: string;
  label: string;
  description?: string;
  flag?: 1 | 2 | 3; // 1=green=low, 2=orange=medium, 3=red=high
  assignee?: string;
  effort?: number;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  type: "task" | "routine" | "event";
  listTitle?: string;
  brainDumpType?: BrainDumpOption;
  // For task API updates
  listId?: string;
  taskId?: string;
};

export default function UiCheckboxElement({
  id,
  label,
  description,
  assignee,
  flag,
  effort,
  checked = false,
  onChange,
  disabled = false,
  type,
  listTitle = "Item",
  brainDumpType = "NEW_TASK_ROUTINE",
  listId,
  taskId
}: UiCheckboxElementProps) {
  const userDataContext = useUserData();
  const updateTaskStatus = userDataContext?.updateTaskStatus;
  
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return "bg-green-500";
      case 2:
        return "bg-orange-500";
      case 3:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityBgColor = (priority: number) => {
    switch (priority) {
      case 1:
        return "bg-green-50 border-green-200";
      case 2:
        return "bg-orange-50 border-orange-200";
      case 3:
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getPriorityText = (priority: number) => {
    switch (priority) {
      case 1:
        return "Low";
      case 2:
        return "Medium";
      case 3:
        return "High";
      default:
        return "";
    }
  };

  const handleCheckboxChange = async (isChecked: boolean) => {
    // Call the original onChange immediately for instant UI feedback
    onChange?.(isChecked);
    
    // If this is a task and we have the necessary IDs and context, update via API
    if (type === "task" && listId && taskId && updateTaskStatus) {
      const newStatus = isChecked ? TASK_STATUS_TYPE.DONE : TASK_STATUS_TYPE.TO_DO;
      await updateTaskStatus(listId, taskId, newStatus);
    }
  };

  return (
    <div className={`group relative flex items-center space-x-4 rtl:space-x-reverse p-2 rounded-lg border transition-all duration-200 hover:shadow-md hover:scale-[1.02] hover:border-gray-300 ${flag ? getPriorityBgColor(flag) : ''}`}>
      {flag && (
        <div className={`absolute -top-2 -right-2 z-10 px-2 py-1 text-xs font-medium text-white rounded-full shadow-md ${getPriorityColor(flag)}`}>
          {getPriorityText(flag)}
        </div>
      )}
      
      <Checkbox 
        id={id} 
        checked={checked}
        onChange={(e) => handleCheckboxChange(e.target.checked)}
        disabled={disabled}
        className="rounded-full"
      />
      <div className="min-w-0 flex-1">
        <Label 
          className="text-sm font-medium text-gray-900 truncate dark:text-white" 
          htmlFor={id}
        >
          {label}
        </Label>
        {description && (
          <p className="text-sm text-gray-500 truncate dark:text-gray-400">
            {description}
          </p>
        )}
        {assignee && (
          <p className="text-sm text-gray-500 truncate dark:text-gray-400">
            {assignee}
          </p>
        )}
        {effort && (
          <p className="text-xs text-gray-400">
            {effort} min
          </p>
        )}
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <CrudAction
          listTitle={listTitle}
          identificator={taskId || id}
          lable="Name"
          textValue={label}
          brainDumpType={brainDumpType}
          listId={listId}
        />
      </div>
    </div>
  );
} 