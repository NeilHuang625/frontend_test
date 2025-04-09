import React, { useState, useRef } from "react";
import { Task } from "../types";
import { startMockUpload, cancelMockTask } from "../services/mockApi";
import { usePolling } from "../hooks/usePolling";
import TaskList from "./TaskList";

const FileUpload: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startPolling, cancelPolling } = usePolling(tasks, setTasks);

  const validateFile = (file: File) => {
    const isImageOrPdf =
      file.type === "application/pdf" || file.type.startsWith("image/");
    const isUnder2MB = file.size < 2 * 1024 * 1024;
    return isImageOrPdf && isUnder2MB;
  };

  const processFile = async (file: File) => {
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  const cancelTask = (taskId: string) => {
    cancelMockTask(taskId);
    cancelPolling(taskId);
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: "cancelled" } : t))
    );
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Upload a File</h2>

      <div
        className={`border-2 border-dashed rounded-lg p-8 mb-4 text-center cursor-pointer transition duration-200 ease-in-out ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <div className="flex flex-col items-center justify-center">
          <svg
            className="w-12 h-12 mb-3 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="mb-2 text-sm text-gray-600">
            <span className="font-semibold">Click to upload</span> or drag and
            drop
          </p>
          <p className="text-xs text-gray-500">PDF or images up to 2MB</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
          {error}
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Upload Tasks</h3>
        <TaskList tasks={tasks} onCancel={cancelTask} />
      </div>
    </div>
  );
};

export default FileUpload;
