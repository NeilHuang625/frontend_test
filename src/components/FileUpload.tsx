import React, { useState } from "react";
import { Task } from "../types";
import { startMockUpload, cancelMockTask } from "../services/mockApi";
import { usePolling } from "../hooks/usePolling";
import TaskList from "./TaskList";

const FileUpload: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { startPolling, cancelPolling } = usePolling(tasks, setTasks);

  const validateFile = (file: File) => {
    const isImageOrPdf =
      file.type === "application/pdf" || file.type.startsWith("image/");
    const isUnder2MB = file.size < 2 * 1024 * 1024;
    return isImageOrPdf && isUnder2MB;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!validateFile(file)) {
      setError("Only PDFs or images under 2MB are allowed.");
      return;
    }

    try {
      const { taskId } = await startMockUpload();
      const newTask: Task = {
        id: taskId,
        filename: file.name,
        status: "pending",
        retries: 0,
      };

      setTasks((prev) => [...prev, newTask]);
      startPolling(taskId);
    } catch {
      setError("Failed to start upload.");
    }
  };

  const cancelTask = (taskId: string) => {
    cancelMockTask(taskId);
    cancelPolling(taskId);
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: "cancelled" } : t))
    );
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-2">Upload a File</h2>
      <label className="block mb-4">
        <span className="sr-only">Choose file</span>
        <input
          type="file"
          accept="application/pdf,image/*"
          onChange={handleFileChange}
          className="mb-4"
        />
      </label>
      {error && <div className="text-red-500">{error}</div>}
      <TaskList tasks={tasks} onCancel={cancelTask} />
    </div>
  );
};

export default FileUpload;
