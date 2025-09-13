import { Accordion, AccordionContent, AccordionPanel, AccordionTitle, Button, Datepicker, Dropdown, DropdownItem, Label, Modal, ModalBody, ModalFooter, ModalHeader, TextInput, Checkbox } from 'flowbite-react';
import { useState, useEffect } from "react";
import { BsThreeDots } from 'react-icons/bs';
import { HiOutlineCalendar, HiOutlineClock } from 'react-icons/hi';
import { VOCAB } from '../../vocal';
import type { CrudActionProps } from '../../types/CrudElement';
import UiTimePicker from '../ui/UiTimePicker';
import { useUserData } from '../../context/UserDataContext';
import { TASK_EFFORT_TYPE } from '../../types/db-types/taskEffortType';
import { IMPORTANCE_TYPE } from '../../types/db-types/importanceType';
import { getUserGroups, getListGroups, getTaskUsers } from '../../api/supabaseApi';
import type { UserGroup } from '../../types/db-types/userGroupType';

export default function CrudAction({identificator, lable, textValue = "", listTitle, brainDumpType, listId}: CrudActionProps) {
    const userDataContext = useUserData();
    const updateTask = userDataContext?.updateTask;
    const updateListWithAPI = userDataContext?.updateListWithAPI;
    const deleteListWithAPI = userDataContext?.deleteListWithAPI;
    const deleteTaskWithAPI = userDataContext?.deleteTaskWithAPI;
    const updateListGroup = userDataContext?.updateListGroup;
    const removeListGroup = userDataContext?.removeListGroup;
    const updateTaskUser = userDataContext?.updateTaskUser;
    const [openModal, setOpenModal] = useState(false);
    const [val, setVal] = useState(textValue);
    const [timeValue, setTimeValue] = useState("00:05");
    const [plannedDate, setPlannedDate] = useState<Date | null>(null);
    const [selectedEffort, setSelectedEffort] = useState<typeof TASK_EFFORT_TYPE[keyof typeof TASK_EFFORT_TYPE]>(TASK_EFFORT_TYPE.MODERATE);
    const [selectedPriority, setSelectedPriority] = useState<typeof IMPORTANCE_TYPE[keyof typeof IMPORTANCE_TYPE]>(IMPORTANCE_TYPE.MEDIUM);
    const [isLoading, setIsLoading] = useState(false);
    
    const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
    const [currentListGroups, setCurrentListGroups] = useState<string[]>([]);
    
    const [availableUsers, setAvailableUsers] = useState<Array<{id: string, display_name: string}>>([]);
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [currentTaskUsers, setCurrentTaskUsers] = useState<Array<{id: string, user: {id: string, display_name: string}, status: {name: string}}>>([]);
    
    const isList = brainDumpType === "NEW_LIST" || brainDumpType === "NEW_ROUTINE";
    const isRoutineTask = brainDumpType === "NEW_TASK_ROUTINE";
    const isTask = brainDumpType === "NEW_TASK" || brainDumpType === "NEW_TASK_ROUTINE";

    const fetchUserGroups = async () => {
      try {
        const { data, error } = await getUserGroups();
        if (error) {
          console.error('Failed to fetch user groups:', error);
        } else {
          setUserGroups((data as UserGroup[]) || []);
        }
      } catch (error) {
        console.error('Error fetching user groups:', error);
      }
    };

    const fetchCurrentListGroups = async () => {
      if (!isList || !identificator) return;
      
      try {
        const { data, error } = await getListGroups(identificator);
        if (error) {
          console.error('Failed to fetch list groups:', error);
        } else {
          const groupIds = (data || []).map((lg: any) => lg.group.id);
          setCurrentListGroups(groupIds);
          setSelectedGroups(groupIds);
        }
      } catch (error) {
        console.error('Error fetching list groups:', error);
      }
    };

    const fetchAvailableUsers = async () => {
      if (!isTask || !listId) return;
      
      try {
        const { data: listGroups, error: listGroupsError } = await getListGroups(listId);
        if (listGroupsError) {
          console.error('Failed to fetch list groups for users:', listGroupsError);
          return;
        }

        const allUsers: Array<{id: string, display_name: string}> = [];
        (listGroups || []).forEach((lg: any) => {
          (lg.members || []).forEach((member: any) => {
            if (member.status === 'Accepted' && !allUsers.find(u => u.id === member.user_id)) {
              allUsers.push({
                id: member.user_id,
                display_name: member.display_name
              });
            }
          });
        });

        setAvailableUsers(allUsers);
      } catch (error) {
        console.error('Error fetching available users:', error);
      }
    };

    const fetchCurrentTaskUsers = async () => {
      if (!isTask || !identificator) return;
      
      try {
        const { data, error } = await getTaskUsers(identificator);
        if (error) {
          console.error('Failed to fetch task users:', error);
        } else {
          setCurrentTaskUsers(data || []);
        }
      } catch (error) {
        console.error('Error fetching task users:', error);
      }
    };

    useEffect(() => {
      if (openModal && isList) {
        fetchUserGroups();
        fetchCurrentListGroups();
      }
      if (openModal && isTask) {
        fetchAvailableUsers();
        fetchCurrentTaskUsers();
      }
    }, [openModal, isList, isTask, identificator, listId]);

    const updateGroupAssignments = async (listId: string) => {
      try {
        const groupsToAdd = selectedGroups.filter(groupId => !currentListGroups.includes(groupId));
        
        const groupsToRemove = currentListGroups.filter(groupId => !selectedGroups.includes(groupId));

        console.log('Updating group assignments:', {
          listId,
          groupsToAdd,
          groupsToRemove,
          selectedGroups,
          currentListGroups,
          userGroups: userGroups.map(g => ({ id: g.group_id, name: g.group_name }))
        });
        
        console.log('Full user groups data:', userGroups);

        for (const groupId of groupsToAdd) {
          try {
            console.log(`Attempting to assign group ${groupId} to list ${listId}`);
            if (updateListGroup) {
              await updateListGroup(listId, groupId, "Active");
              console.log(`Successfully assigned group ${groupId} to list`);
            } else {
              console.error('UserDataContext updateListGroup not available');
            }
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`Failed to add group ${groupId} to list:`, error);
          }
        }

        for (const groupId of groupsToRemove) {
          try {
            if (removeListGroup) {
              await removeListGroup(listId, groupId);
            } else {
              console.error('UserDataContext removeListGroup not available');
            }
          } catch (error) {
            console.error(`Failed to remove group ${groupId} from list:`, error);
          }
        }
      } catch (error) {
        console.error('Error updating group assignments:', error);
      }
    };

    const assignUserToTask = async (taskId: string) => {
      if (!selectedUser) return;
      
      try {
        if (updateTaskUser) {
          await updateTaskUser(taskId, selectedUser, "Pending");
          console.log(`Successfully assigned user to task`);
          fetchCurrentTaskUsers();
        } else {
          console.error('UserDataContext updateTaskUser not available');
        }
      } catch (error) {
        console.error('Error assigning user to task:', error);
      }
    };

    return (
        <>
        <Button className="bg-transparent border-none p-2 text-gray-600 hover:bg-transparent hover:text-black focus:outline-none" onClick={() => setOpenModal(true)}>
        <BsThreeDots size={20} />
        </Button>

        <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <ModalHeader>
          <div className="text-base font-semibold text-gray-800">{listTitle}</div>
        </ModalHeader>
        <ModalBody>
              <TextInput
                id={identificator}
                value={val}
                onChange={(event) => setVal(event.target.value)}
                className="text-sm"
              />
              
              {isList && (
                <div className="space-y-2 mt-3">
                  <label className="text-sm font-medium text-gray-700">Assign to groups</label>
                  <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-1">
                    {userGroups.map((group) => (
                      <div key={group.group_id} className="flex items-center">
                        <Checkbox
                          id={`edit-group-${group.group_id}`}
                          checked={selectedGroups.includes(group.group_id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedGroups([...selectedGroups, group.group_id]);
                            } else {
                              setSelectedGroups(selectedGroups.filter(id => id !== group.group_id));
                            }
                          }}
                        />
                        <label htmlFor={`edit-group-${group.group_id}`} className="ml-2 text-sm text-gray-700">
                          {group.group_name}
                        </label>
                      </div>
                    ))}
                    {userGroups.length === 0 && (
                      <p className="text-sm text-gray-500">No groups available</p>
                    )}
                  </div>
                </div>
              )}
              
              {isTask && (
                <div className="space-y-2 mt-3">
                  <label className="text-sm font-medium text-gray-700">Assign to user</label>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Select a user...</option>
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.display_name}
                      </option>
                    ))}
                  </select>
                  
                  {currentTaskUsers.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Currently assigned:</p>
                      <div className="space-y-1">
                        {currentTaskUsers.map((taskUser) => (
                          <div key={taskUser.id} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                            <span>{taskUser.user.display_name}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              taskUser.status.name === 'Accepted' ? 'bg-green-100 text-green-800' :
                              taskUser.status.name === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {taskUser.status.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {!isList && (
                <div className="flex items-center gap-2 mt-2">
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
                {!isRoutineTask && (
                  <div>
                    <Label className="text-xs text-gray-500">Planned date</Label>
                    <Datepicker
                      value={plannedDate}
                      onChange={(date: Date | null) => setPlannedDate(date)}
                      className="flex items-center gap-2"
                    />
                  </div>
                )}
                </div>
              )}
              <div className="flex items-center gap-2 mt-2">
              <Dropdown label={selectedPriority} inline>
                {Object.values(IMPORTANCE_TYPE).map((priority) => (
                  <DropdownItem key={priority} onClick={() => setSelectedPriority(priority)}>
                    {priority}
                  </DropdownItem>
                ))}
              </Dropdown>
              </div>
        <div>  
      </div>
          </ModalBody>
          <ModalFooter>
            <div className="flex w-full items-center">
            <div className="flex gap-2">
              <Button 
                onClick={async () => {
                  if (isList) {
                    if (!updateListWithAPI) {
                      console.error('updateListWithAPI function not available');
                      return;
                    }
                    
                    setIsLoading(true);
                    try {
                      await updateListWithAPI(identificator, {
                        name: val,
                        importance: selectedPriority
                      });
                      
                      await updateGroupAssignments(identificator);
                      
                      setOpenModal(false);
                    } catch (error) {
                      console.error('Failed to update list:', error);
                    } finally {
                      setIsLoading(false);
                    }
                  } else {
                    if (!updateTask) {
                      console.error('updateTask function not available');
                      return;
                    }
                    
                    setIsLoading(true);
                    try {
                      await updateTask(identificator, {
                        name: val,
                        taskEffort: selectedEffort,
                        plannedDate: isRoutineTask ? undefined : plannedDate || undefined,
                        priority: selectedPriority
                      });
                      
                      if (selectedUser) {
                        await assignUserToTask(identificator);
                      }
                      
                      setOpenModal(false);
                    } catch (error) {
                      console.error('Failed to update task:', error);
                    } finally {
                      setIsLoading(false);
                    }
                  }
                }}
                disabled={isLoading || (isList ? !updateListWithAPI : !updateTask)}
              >
                {isLoading ? 'Saving...' : VOCAB.SAVE}
              </Button>
              <Button color="gray" onClick={() => setOpenModal(false)}>
                {VOCAB.CANCEL}
              </Button>
            </div>
            <div className="flex-1" />
            <Button color="red" onClick={async () => {
              if (isList && deleteListWithAPI) {
                setIsLoading(true);
                try {
                  await deleteListWithAPI(identificator);
                } finally {
                  setIsLoading(false);
                  setOpenModal(false);
                }
              } else if (!isList && deleteTaskWithAPI && listId) {
                setIsLoading(true);
                try {
                  await deleteTaskWithAPI(listId, identificator);
                } finally {
                  setIsLoading(false);
                  setOpenModal(false);
                }
              } else {
                setOpenModal(false);
              }
            }}>
              {VOCAB.DELETE}
            </Button>
          </div>
        </ModalFooter>
      </Modal>
        </>
    );
}