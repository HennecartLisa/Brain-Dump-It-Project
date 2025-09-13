export type CrudActionProps = {
  listTitle: string;
  identificator: string;
  lable: string;
  textValue?: string;
  brainDumpType: "NEW_LIST" | "NEW_ROUTINE" | "NEW_TASK" | "NEW_TRACKER" | "NEW_PROJECT" | "NEW_TASK_ROUTINE";
  listId?: string;
}; 