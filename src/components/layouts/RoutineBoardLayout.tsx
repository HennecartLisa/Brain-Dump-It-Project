import { Accordion, AccordionContent, AccordionPanel, AccordionTitle, List, ListItem, Tooltip } from 'flowbite-react';
import '../../App'
import { useState, useEffect } from 'react';
import CrudAction from '../Crud/CrudAction';
import { useUserData } from '../../context/UserDataContext';
import type { TaskType } from '../../types/db-types/taskType';
import { TASK_EFFORT_TYPE } from '../../types/db-types/taskEffortType';
import { TASK_STATUS_TYPE } from '../../types/db-types/taskStatusType';
import { IMPORTANCE_TYPE } from '../../types/db-types/importanceType';
import { BANNER_MESSAGE_TYPE } from '../../types/db-types/bannerMessageType';
import { BRAIN_DUMP_OPTIONS } from '../../types/BrainDumpOptions';
import { VOCAB } from '../../vocal';
import UiCheckboxElement from '../ui/UiCheckboxElement';
import UiButtonCreate from '../ui/UiButtonCreate';
import CreateTaskModal from '../Crud/CreateTaskModal';
import { getListGroups, getTaskUsers } from '../../api/supabaseApi';

export default function RoutineBoardLayout() {
  const [banner, setBanner] = useState< { type: typeof BANNER_MESSAGE_TYPE.SUCCESS | typeof BANNER_MESSAGE_TYPE.FAILURE; message: string } | null>(null);
  const userDataContext = useUserData();
  const lists = userDataContext?.lists || [];
  const loading = userDataContext?.loading || false;
  const error = userDataContext?.error || null;

  useEffect(() => {
    if (error) {
      setBanner({ type: BANNER_MESSAGE_TYPE.FAILURE, message: error });
    }
  }, [error]);

  const getEffortNumber = (effort?: TaskEffortType): number | undefined => {
    if (!effort) return undefined;
    const effortMap: Record<TaskEffortType, number> = {
      [TASK_EFFORT_TYPE.VERY_QUICK]: 1,
      [TASK_EFFORT_TYPE.QUICK]: 2,
      [TASK_EFFORT_TYPE.MODERATE]: 3,
      [TASK_EFFORT_TYPE.CONSIDERABLE]: 4,
      [TASK_EFFORT_TYPE.LONG]: 5,
      [TASK_EFFORT_TYPE.VERY_LONG]: 6,
    };
    return effortMap[effort];
  };

  const getTaskStats = (listId: string) => {
    const list = lists.find(l => l.id === listId);
    const tasks = list?.tasks || [];
    const completedTasks = tasks.filter(task => task.taskStatus === TASK_STATUS_TYPE.DONE).length;
    const totalTasks = tasks.length;
    return { completed: completedTasks, total: totalTasks };
  };

  const [createForListId, setCreateForListId] = useState<string | null>(null);
  const [listGroups, setListGroups] = useState<Record<string, any[]>>({});
  const [taskUsers, setTaskUsers] = useState<Record<string, any[]>>({});

  useEffect(() => {
    const fetchListGroups = async () => {
      const groupsData: Record<string, any[]> = {};
      for (const list of lists) {
        try {
          const result = await getListGroups(list.id);
          if (result.data) {
            groupsData[list.id] = result.data;
          }
        } catch (error) {
          console.error(`Failed to fetch groups for list ${list.id}:`, error);
        }
      }
      setListGroups(groupsData);
    };

    const fetchTaskUsers = async () => {
      const usersData: Record<string, any[]> = {};
      for (const list of lists) {
        for (const task of list.tasks || []) {
          try {
            const result = await getTaskUsers(task.id);
            if (result.data) {
              usersData[task.id] = result.data;
            }
          } catch (error) {
            console.error(`Failed to fetch users for task ${task.id}:`, error);
          }
        }
      }
      setTaskUsers(usersData);
    };

    if (lists.length > 0) {
      fetchListGroups();
      fetchTaskUsers();
    }
  }, [lists]);

  if (loading) {
    return (
      <div className="w-full p-4">
        <p>{VOCAB.LOADING_LISTS_TASKS}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {lists.filter(list => list.isRoutine).length > 0 ? (
        <Accordion>
          {lists.filter(list => list.isRoutine).map((list: any) => {
            const { completed, total } = getTaskStats(list.id);
            const tasks = list.tasks || [];
            return (
              <AccordionPanel key={list.id}>
                <div className="relative group">
                  <AccordionTitle className="text-lg font-semibold">
                    <div className="w-full flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span>{list.title || list.name || VOCAB.UNTITLED_ROUTINE}</span>
                          {listGroups[list.id] && listGroups[list.id].length > 0 && (
                            <div className="flex gap-1">
                              {listGroups[list.id].map((listGroup: any) => (
                                <Tooltip
                                  key={listGroup.id}
                                  content={
                                    <div className="text-sm">
                                      <div className="font-semibold mb-1">{listGroup.group.name}</div>
                                      <div className="space-y-1">
                                        {listGroup.members
                                          .filter((member: any) => member.status === 'Accepted')
                                          .map((member: any) => (
                                            <div key={member.user_id} className="text-xs">
                                              {member.display_name} ({member.role_name})
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                  }
                                  placement="top"
                                >
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 cursor-help">
                                    {listGroup.group.name}
                                  </span>
                                </Tooltip>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 font-normal mt-1">
                          {completed}/{total} tasks done
                        </div>
                      </div>
                    </div>
                  </AccordionTitle>
                  <div className="absolute top-1/2 right-12 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                    <CrudAction
                      listTitle={list.title || list.name || VOCAB.UNTITLED_ROUTINE}
                      identificator={list.id}
                      lable="Name"
                      textValue={list.title || list.name || VOCAB.UNTITLED_ROUTINE}
                      brainDumpType="NEW_ROUTINE"
                    />
                  </div>
                </div>
                <AccordionContent>
                  <List unstyled className="w-full space-y-2">
                    {tasks.map((task: TaskType) => (
                      <ListItem key={task.id}>
                        <UiCheckboxElement
                          id={`${list.id}-${task.id}`}
                          label={task.name}
                          description={undefined} // Task type doesn't have description
                          assignee={taskUsers[task.id]?.[0]?.user?.display_name || undefined}
                          flag={task.importance === IMPORTANCE_TYPE.HIGH ? 3 : task.importance === IMPORTANCE_TYPE.MEDIUM ? 2 : 1}
                          effort={getEffortNumber(task.taskEffort)}
                          type="routine"
                          checked={task.taskStatus === TASK_STATUS_TYPE.DONE}
                          listId={list.id}
                          taskId={task.id}
                        />
                      </ListItem>
                    ))}
                    {tasks.length === 0 && (
                      <div className="text-gray-500 text-sm p-4 text-center">
                        {VOCAB.NO_TASKS_IN_ROUTINE}
                      </div>
                    )}
                  </List>
                  <div className="mt-4">
                    <UiButtonCreate actionType={BRAIN_DUMP_OPTIONS.NEW_TASK} onClick={() => setCreateForListId(list.id)} />
                  </div>
                </AccordionContent>
              </AccordionPanel>
            );
          })}
        </Accordion>
      ) : (
        <div>{VOCAB.NO_ROUTINE_LISTS_FOUND}</div>
      )}
      <CreateTaskModal open={!!createForListId} onClose={() => setCreateForListId(null)} listId={createForListId || ''} isRoutineMode={true} />
    </div>
  );
}