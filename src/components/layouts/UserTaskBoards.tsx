import { useEffect, useState } from "react";
import TaskBoardLayout, { Task } from "./TaskBoardLayout";
import { useAuth } from "../../auth/useAuth";

export default function UserTaskBoards() {
  const [lists, setLists] = useState<any[]>([]);
  const { session } = useAuth();

  useEffect(() => {
    async function fetchLists() {
      const res = await fetch("/functions/v1/get-user-lists", {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      const data = await res.json();
      setLists(data.lists || []);
    }
    if (session?.access_token) fetchLists();
  }, [session]);

  return (
    <div className="flex flex-wrap gap-4">
      {lists.map((list) => (
        <TaskBoardLayout
          key={list.id}
          title={list.title || "Untitled List"}
          tasks={list.tasks as Task[] || []}
        />
      ))}
    </div>
  );
}



