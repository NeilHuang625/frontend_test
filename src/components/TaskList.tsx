// src/components/TaskList.tsx
import React from "react";
import { Task } from "../types";

interface Props {
  tasks: Task[];
  onCancel: (taskId: string) => void;
}

const TaskList: React.FC<Props> = ({ tasks, onCancel }) => {
  if (tasks.length === 0) {
    return <p className="text-gray-500">No tasks yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="flex justify-between items-center border p-2 rounded"
        >
          <div>
            <div className="font-medium">{task.filename}</div>
            <div className="text-sm text-gray-600">
              Status: {task.status}
              {task.retries > 0 && (
                <span className="text-yellow-500 ml-2">
                  (Retry {task.retries})
                </span>
              )}
            </div>
          </div>
          {["pending", "processing"].includes(task.status) && (
            <button
              type="button"
              className="text-sm text-red-500"
              onClick={() => onCancel(task.id)}
            >
              Cancel
            </button>
          )}
        </li>
      ))}
    </ul>
  );
};

export default TaskList;
