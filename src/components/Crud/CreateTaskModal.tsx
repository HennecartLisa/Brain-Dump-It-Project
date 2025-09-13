import { useState } from 'react';
import { Button, Dropdown, DropdownItem, Label, Modal, ModalBody, ModalFooter, ModalHeader, Datepicker, TextInput } from 'flowbite-react';
import { TASK_EFFORT_TYPE } from '../../types/db-types/taskEffortType';
import { IMPORTANCE_TYPE } from '../../types/db-types/importanceType';
import { useUserData } from '../../context/UserDataContext';

type CreateTaskModalProps = {
  open: boolean;
  onClose: () => void;
  listId: string;
  isRoutineMode?: boolean; // if true, hide plan/assign/repeat fields
  onCreated?: () => void;
};

export default function CreateTaskModal({ open, onClose, listId, isRoutineMode = false, onCreated }: CreateTaskModalProps) {
  const userDataContext = useUserData();
  const createTask = userDataContext?.createTask;
  const [name, setName] = useState('');
  const [selectedEffort, setSelectedEffort] = useState<typeof TASK_EFFORT_TYPE[keyof typeof TASK_EFFORT_TYPE]>(TASK_EFFORT_TYPE.MODERATE);
  const [selectedPriority, setSelectedPriority] = useState<typeof IMPORTANCE_TYPE[keyof typeof IMPORTANCE_TYPE]>(IMPORTANCE_TYPE.MEDIUM);
  const [plannedDate, setPlannedDate] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    if (!createTask) {
      console.error('UserDataContext not available');
      return;
    }
    
    setSaving(true);
    try {
      // Use UserDataContext createTask which handles both API call and state update
      await createTask(name.trim(), listId);
      
      // Task is now created and added to local state automatically
      onCreated?.();
      setName('');
      setPlannedDate(null);
      onClose();
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={open} onClose={onClose}>
      <ModalHeader>
        <div className="text-base font-semibold text-gray-800">Create Task</div>
      </ModalHeader>
      <ModalBody>
        <div className="flex flex-col gap-3">
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Task name"
            className="text-sm"
          />

          <div className="flex items-center gap-4">
            <div>
              <Label className="text-xs text-gray-500">Task effort</Label>
              <Dropdown label={selectedEffort} inline>
                {Object.values(TASK_EFFORT_TYPE).map((effort) => (
                  <DropdownItem key={effort} onClick={() => setSelectedEffort(effort)}>
                    {effort}
                  </DropdownItem>
                ))}
              </Dropdown>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Priority</Label>
              <Dropdown label={selectedPriority} inline>
                {Object.values(IMPORTANCE_TYPE).map((priority) => (
                  <DropdownItem key={priority} onClick={() => setSelectedPriority(priority)}>
                    {priority}
                  </DropdownItem>
                ))}
              </Dropdown>
            </div>
          </div>

          {!isRoutineMode && (
            <div>
              <Label className="text-xs text-gray-500">Planned date</Label>
              <Datepicker value={plannedDate} onChange={(date: Date | null) => setPlannedDate(date)} />
            </div>
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button onClick={handleSave} disabled={saving || !name.trim()}>Create Task</Button>
        <Button color="gray" onClick={onClose}>Cancel</Button>
      </ModalFooter>
    </Modal>
  );
}


