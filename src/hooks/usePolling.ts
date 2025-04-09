import { useRef, useEffect } from "react";
import { getTaskStatus } from "../services/mockApi";
import { Task } from "../types";

export const usePolling = (
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
) => {
  const pollingRefs = useRef<Record<string, number>>({});
  const tasksRef = useRef<Task[]>(tasks);

  // 💡 让最新 tasks 始终同步到 ref 中
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  const startPolling = (taskId: string) => {
    const poll = async (retries = 0) => {
      const currentTask = tasksRef.current.find((t) => t.id === taskId);
      if (
        !currentTask ||
        ["success", "failed", "cancelled"].includes(currentTask.status)
      ) {
        clearInterval(pollingRefs.current[taskId]);
        delete pollingRefs.current[taskId];
        return;
      }

      try {
        const res = await getTaskStatus(taskId);

        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: res.status } : t))
        );

        if (["success", "failed"].includes(res.status)) {
          clearInterval(pollingRefs.current[taskId]);
          delete pollingRefs.current[taskId];
        }
      } catch {
        if (retries < 3) {
          setTimeout(() => poll(retries + 1), 2000);
          setTasks((prev) =>
            prev.map((t) =>
              t.id === taskId ? { ...t, retries: retries + 1 } : t
            )
          );
        } else {
          setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, status: "failed" } : t))
          );
          clearInterval(pollingRefs.current[taskId]);
          delete pollingRefs.current[taskId];
        }
      }
    };

    const interval = setInterval(() => poll(), 3000);
    pollingRefs.current[taskId] = interval;
  };

  const cancelPolling = (taskId: string) => {
    clearInterval(pollingRefs.current[taskId]);
    delete pollingRefs.current[taskId];
  };

  useEffect(() => {
    return () => {
      Object.values(pollingRefs.current).forEach(clearInterval);
    };
  }, []);

  return { startPolling, cancelPolling };
};
