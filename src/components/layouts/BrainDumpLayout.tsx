import { Card, Dropdown, DropdownItem, FloatingLabel, Checkbox, Tooltip } from 'flowbite-react';
import { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, Accordion, AccordionPanel, AccordionTitle, AccordionContent, Button } from "flowbite-react";
import { HiEye } from 'react-icons/hi';
import { VOCAB } from '../../vocal';
import { useAuth } from '../../auth/useAuth';
import { BRAIN_DUMP_OPTIONS, type BrainDumpOption } from '../../types/BrainDumpOptions';
import UiBannerMessage from '../ui/UiBannerMessage';
import ComfortModeModal, { type ComfortModeSettings } from '../ui/ComfortModeModal';
import { getUserLists as fetchUserLists, getUserLists, getUserGroups } from '../../api/supabaseApi';
import { useUserData } from '../../context/UserDataContext';
import type { UserGroup } from '../../types/db-types/userGroupType';



export default function BrainDumpLayout() {
    const [openModal, setOpenModal] = useState(false);
    const [activeAccordion, setActiveAccordion] = useState(0);
    const [firstOptionSelected, setFirstOptionSelected] = useState(false);
    const [listTitle, setListTitle] = useState("");
    const [banner, setBanner] = useState<any>(null);
    const { user } = useAuth();
    const userDataContext = useUserData();
    const addList = userDataContext?.addList;
    const addTaskToList = userDataContext?.addTaskToList;
    const createList = userDataContext?.createList;
    const createTask = userDataContext?.createTask;
    const updateListGroup = userDataContext?.updateListGroup;

    const [comfortModeOpen, setComfortModeOpen] = useState(false);
    const [comfortSettings, setComfortSettings] = useState<ComfortModeSettings>({
        colorScheme: 'default',
        textSize: 100,
        typography: 'default'
    });

    const [selectedBrainDumpOption, setSelectedBrainDumpOption] = useState<BrainDumpOption | null>(null);
    const [taskName, setTaskName] = useState("");
    const [selectedListId, setSelectedListId] = useState<string>("");
    const [userLists, setUserLists] = useState<any[]>([]);
    const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

    const handleOpenModal = async (option?: BrainDumpOption) => {
      setOpenModal(true);
      setActiveAccordion(0);
      setFirstOptionSelected(false);
      setSelectedGroups([]);
      if (option) {
        setSelectedBrainDumpOption(option);
        
        if (option === BRAIN_DUMP_OPTIONS.NEW_TASK) {
          await fetchUserLists();
        }
        
        if (option === BRAIN_DUMP_OPTIONS.NEW_LIST || option === BRAIN_DUMP_OPTIONS.NEW_ROUTINE) {
          await fetchUserGroups();
        }
      } else {
        setSelectedBrainDumpOption(null);
      }
    };
  
    const handleFirstOptionClick = () => {
      setFirstOptionSelected(true);
      setActiveAccordion(1);
    };

    const handleCreateList = async (name: any, userId: any, isRoutine: any) => {
      if (!createList) {
        setBanner({ type: "failure", message: "UserDataContext not available" });
        return;
      }

      try {
        await createList(name, isRoutine);
        setBanner({ type: "success", message: "List created successfully." });
        
        if (selectedGroups.length > 0 && updateListGroup) {
          if (userDataContext?.refreshData) {
            await userDataContext.refreshData();
            
            const latestList = userDataContext.lists[userDataContext.lists.length - 1];
            if (latestList) {
              for (const groupId of selectedGroups) {
                try {
                  await updateListGroup(latestList.id, groupId, "Active");
                } catch (error) {
                  console.error(`Failed to assign group ${groupId} to list:`, error);
                }
              }
            }
          }
        }
      } catch (error) {
        setBanner({ type: "failure", message: error instanceof Error ? error.message : "Failed to create list" });
      }
    };

    const handleCreateTask = async (name: any, listId: any) => {
      if (!createTask) {
        setBanner({ type: "failure", message: "UserDataContext not available" });
        return;
      }

      try {
        await createTask(name, listId);
        setBanner({ type: "success", message: "Task created successfully." });
      } catch (error) {
        setBanner({ type: "failure", message: error instanceof Error ? error.message : "Failed to create task" });
      }
    };

    const fetchUserLists = async () => {
      if (user) {
        const { data, error } = await getUserLists();
        if (error) {
          setBanner({ type: "failure", message: error });
        } else {
          setUserLists((data as any[]) || []);
        }
      }
    };

    const fetchUserGroups = async () => {
      if (user) {
        const { data, error } = await getUserGroups();
        if (error) {
          setBanner({ type: "failure", message: error });
        } else {
          setUserGroups((data as UserGroup[]) || []);
        }
      }
    };

    const handleComfortModeOpen = () => {
      setComfortModeOpen(true);
    };

    const handleComfortModeClose = () => {
      setComfortModeOpen(false);
    };

    const handleComfortModeSettings = (settings: ComfortModeSettings) => {
      setComfortSettings(settings);
      setBanner({ type: "success", message: "Comfort mode settings saved successfully!" });
    };
    return (
    <>
      {banner && (
        <UiBannerMessage
          message={banner.message}
          color={banner.type === "success" ? "success" : "failure"}
          onClose={() => setBanner(null)}
        />
      )}
      <div className="flex justify-end items-center gap-3 mb-4">
        <Dropdown label={VOCAB.BRAIN_DUMP} className="">
            <DropdownItem onClick={() => handleOpenModal(BRAIN_DUMP_OPTIONS.NEW_LIST)}>
                {VOCAB.NEW_LIST}
            </DropdownItem>
            <DropdownItem onClick={() => handleOpenModal(BRAIN_DUMP_OPTIONS.NEW_ROUTINE)}>
                {VOCAB.NEW_ROUTINE}
            </DropdownItem>
            <DropdownItem onClick={() => handleOpenModal(BRAIN_DUMP_OPTIONS.NEW_TASK)}>
                {VOCAB.NEW_TASK}
            </DropdownItem>
            <DropdownItem onClick={() => handleOpenModal(BRAIN_DUMP_OPTIONS.NEW_TRACKER)}>
                {VOCAB.NEW_TRACKER}
            </DropdownItem>
            <DropdownItem onClick={() => handleOpenModal(BRAIN_DUMP_OPTIONS.NEW_PROJECT)}>
                {VOCAB.NEW_PROJECT}
            </DropdownItem>
        </Dropdown>
        
        <Tooltip content="Adjust visual settings for better accessibility">
          <Button
            color="purple"
            size="lg"
            onClick={handleComfortModeOpen}
            className="flex items-center gap-2 font-semibold text-lg px-6 py-3"
          >
            <HiEye className="h-5 w-5" />
            Comfort Mode
          </Button>
        </Tooltip>
      </div>
      <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <ModalHeader>{VOCAB.BRAIN_DUMP}</ModalHeader>
        <ModalBody>
          {selectedBrainDumpOption === BRAIN_DUMP_OPTIONS.NEW_LIST && (
          <div className="mb-6">
                <div className="flex flex-col gap-3">
                  <FloatingLabel
                    variant="standard"
                    label="List title"
                    placeholder="Enter list title"
                    value={listTitle ?? ""}
                    onChange={e => setListTitle?.(e.target.value)}
                  />
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Assign to groups (optional)</label>
                    <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-1">
                      {userGroups.map((group) => (
                        <div key={group.group_id} className="flex items-center">
                          <Checkbox
                            id={`group-${group.group_id}`}
                            checked={selectedGroups.includes(group.group_id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedGroups([...selectedGroups, group.group_id]);
                              } else {
                                setSelectedGroups(selectedGroups.filter(id => id !== group.group_id));
                              }
                            }}
                          />
                          <label htmlFor={`group-${group.group_id}`} className="ml-2 text-sm text-gray-700">
                            {group.group_name}
                          </label>
                        </div>
                      ))}
                      {userGroups.length === 0 && (
                        <p className="text-sm text-gray-500">No groups available</p>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    color="blue"
                    onClick={async () => {
                      if (listTitle.trim() !== "" && user) {
                        try {
                          await handleCreateList(listTitle, user.id, false);
                          setListTitle("");
                          setSelectedGroups([]);
                          setOpenModal(false);
                        } catch (error: any) {
                          setBanner({ type: "failure", message: error?.message || "Failed to create list." });
                        }
                      }
                    }}
                    disabled={listTitle.trim() === ""}
                  >
                    {"Create "+VOCAB[selectedBrainDumpOption ?? "NEW"]}
                  </Button>
                </div>
          </div>
          )}

          {selectedBrainDumpOption === BRAIN_DUMP_OPTIONS.NEW_ROUTINE && (
          <div className="mb-6">
                <div className="flex flex-col gap-3">
                  <FloatingLabel
                    variant="standard"
                    label="Routine title"
                    placeholder="Enter routine title"
                    value={listTitle ?? ""}
                    onChange={e => setListTitle?.(e.target.value)}
                  />
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Assign to groups (optional)</label>
                    <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-1">
                      {userGroups.map((group) => (
                        <div key={group.group_id} className="flex items-center">
                          <Checkbox
                            id={`routine-group-${group.group_id}`}
                            checked={selectedGroups.includes(group.group_id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedGroups([...selectedGroups, group.group_id]);
                              } else {
                                setSelectedGroups(selectedGroups.filter(id => id !== group.group_id));
                              }
                            }}
                          />
                          <label htmlFor={`routine-group-${group.group_id}`} className="ml-2 text-sm text-gray-700">
                            {group.group_name}
                          </label>
                        </div>
                      ))}
                      {userGroups.length === 0 && (
                        <p className="text-sm text-gray-500">No groups available</p>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    color="blue"
                    onClick={async () => {
                      if (listTitle.trim() !== "" && user) {
                        try {
                          await handleCreateList(listTitle, user.id, true);
                          setListTitle("");
                          setSelectedGroups([]);
                          setOpenModal(false);
                        } catch (error: any) {
                          setBanner({ type: "failure", message: error?.message || "Failed to create routine list." });
                        }
                      }
                    }}
                    disabled={listTitle.trim() === ""}
                  >
                    {"Create "+VOCAB[selectedBrainDumpOption ?? "NEW"]}
                  </Button>
                </div>
          </div>
          )}
          
          {selectedBrainDumpOption === BRAIN_DUMP_OPTIONS.NEW_TASK && (
          <div className="mb-6">
                <div className="flex flex-col gap-3">
                  <FloatingLabel
                    variant="standard"
                    label="Task name"
                    placeholder="Enter task name"
                    value={taskName}
                    onChange={e => setTaskName(e.target.value)}
                  />
                  <Dropdown label={selectedListId ? userLists.find(list => list.id === selectedListId)?.title || userLists.find(list => list.id === selectedListId)?.name || "Select list" : "Select list"} className="w-full">
                    {userLists.map((list: any) => (
                      <DropdownItem key={list.id} onClick={() => setSelectedListId(list.id)}>
                        {list.title || list.name || 'Untitled List'}
                      </DropdownItem>
                    ))}
                  </Dropdown>
                  <Button
                    color="blue"
                    onClick={async () => {
                      if (taskName.trim() !== "" && selectedListId && user) {
                        try {
                          await handleCreateTask(taskName, selectedListId);
                          setTaskName("");
                          setSelectedListId("");
                          setOpenModal(false);
                        } catch (error: any) {
                          setBanner({ type: "failure", message: error?.message || "Failed to create task." });
                        }
                      }
                    }}
                    disabled={taskName.trim() === "" || !selectedListId}
                  >
                    {"Create "+VOCAB[selectedBrainDumpOption ?? "NEW"]}
                  </Button>
                </div>
          </div>
          )}
        </ModalBody>
      </Modal>

      <ComfortModeModal
        isOpen={comfortModeOpen}
        onClose={handleComfortModeClose}
        onSave={handleComfortModeSettings}
      />
    </>
  );
}
