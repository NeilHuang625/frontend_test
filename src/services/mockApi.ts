// src/services/mockApi.ts

export type TaskStatus = "pending" | "processing" | "success" | "failed";

interface TaskRecord {
  id: string;
  status: TaskStatus;
  timer?: number;
}

const mockTasks: Record<string, TaskRecord> = {};

const randomStatus = (): TaskStatus => {
  return Math.random() > 0.8 ? "failed" : "success";
};

export function startMockUpload(): Promise<{ taskId: string }> {
  return new Promise((resolve) => {
    const taskId = `task_${Date.now()}`;
    mockTasks[taskId] = {
      id: taskId,
      status: "pending",
    };

    // Simulate long-running task
    const timeout = setTimeout(() => {
      const finalStatus = randomStatus();
      mockTasks[taskId].status = finalStatus;
    }, 5000 + Math.random() * 5000); // 5–10s

    mockTasks[taskId].timer = timeout;

    resolve({ taskId });
  });
}

export function getTaskStatus(taskId: string): Promise<{ status: TaskStatus }> {
  return new Promise((resolve, reject) => {
    if (!mockTasks[taskId]) {
      reject(new Error("Task not found"));
    } else {
      // Random chance of network failure. 90% likely to succeed
      if (Math.random() < 0.1) {
        reject(new Error("Network error"));
      } else {
        const status = mockTasks[taskId].status;
        if (status === "failed") {
          reject(new Error("Task failed"));
        } else {
          resolve({ status });
        }
      }
    }
  });
}

export function cancelMockTask(taskId: string): void {
  const task = mockTasks[taskId];
  if (task?.timer) {
    clearTimeout(task.timer);
    task.status = "failed";
  }
}
