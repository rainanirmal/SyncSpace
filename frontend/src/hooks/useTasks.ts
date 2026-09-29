import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  createSubtask,
  updateSubtask,
  deleteSubtask,
} from '../api/tasks';
import type { Task } from '../types';

export const taskKeys = {
  all: (projectId: string) => ['projects', projectId, 'tasks'] as const,
  detail: (projectId: string, taskId: string) => ['projects', projectId, 'tasks', taskId] as const,
};

export const useTasksQuery = (projectId: string | undefined) => {
  return useQuery<Task[]>({
    queryKey: taskKeys.all(projectId!),
    queryFn: () => getTasks(projectId!),
    enabled: !!projectId,
  });
};

export const useTaskQuery = (projectId: string | undefined, taskId: string | null) => {
  return useQuery<Task>({
    queryKey: taskKeys.detail(projectId!, taskId!),
    queryFn: () => getTaskById(projectId!, taskId!),
    enabled: !!projectId && !!taskId,
  });
};

export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      title,
      description,
      assignedTo,
      status,
      files,
    }: {
      projectId: string;
      title: string;
      description?: string;
      assignedTo?: string;
      status?: string;
      files?: File[];
    }) => createTask(projectId, title, description, assignedTo, status, files),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all(variables.projectId) });
    },
  });
};

/**
 * Optimistic update mutation for task status drag-and-drop with rollback on error.
 */
export const useUpdateTaskStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      taskId,
      status,
    }: {
      projectId: string;
      taskId: string;
      status: string;
    }) => updateTask(projectId, taskId, { status }),

    onMutate: async ({ projectId, taskId, status }) => {
      const listKey = taskKeys.all(projectId);

      // Cancel outgoing refetches so they don't overwrite optimistic state
      await queryClient.cancelQueries({ queryKey: listKey });

      // Snapshot previous tasks list
      const previousTasks = queryClient.getQueryData<Task[]>(listKey);

      // Optimistically update status in query cache
      queryClient.setQueryData<Task[]>(listKey, (oldTasks) => {
        if (!oldTasks) return [];
        return oldTasks.map((t) => (t._id === taskId ? { ...t, status } : t));
      });

      return { previousTasks, projectId, taskId };
    },

    onError: (_err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.all(variables.projectId), context.previousTasks);
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.projectId, variables.taskId) });
    },
  });
};

export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, taskId }: { projectId: string; taskId: string }) =>
      deleteTask(projectId, taskId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all(variables.projectId) });
    },
  });
};

/**
 * Optimistic update mutation for subtask completion toggles with rollback on error.
 */
export const useToggleSubtaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      subTaskId,
      isCompleted,
    }: {
      projectId: string;
      taskId: string;
      subTaskId: string;
      isCompleted: boolean;
    }) => updateSubtask(projectId, subTaskId, { isCompleted }),

    onMutate: async ({ projectId, taskId, subTaskId, isCompleted }) => {
      const detailKey = taskKeys.detail(projectId, taskId);
      const listKey = taskKeys.all(projectId);

      // Cancel outgoing refetches for task detail and tasks list
      await queryClient.cancelQueries({ queryKey: detailKey });
      await queryClient.cancelQueries({ queryKey: listKey });

      // Snapshot previous data
      const previousTask = queryClient.getQueryData<Task>(detailKey);
      const previousTasks = queryClient.getQueryData<Task[]>(listKey);

      // Optimistically update subtask in task detail cache
      queryClient.setQueryData<Task>(detailKey, (oldTask) => {
        if (!oldTask) return oldTask as any;
        const updatedSubtasks = (oldTask.subtasks || []).map((st) =>
          st._id === subTaskId ? { ...st, isCompleted } : st
        );
        return { ...oldTask, subtasks: updatedSubtasks };
      });

      // Optimistically update subtask in tasks list cache if subtasks present
      queryClient.setQueryData<Task[]>(listKey, (oldTasks) => {
        if (!oldTasks) return [];
        return oldTasks.map((t) => {
          if (t._id === taskId && t.subtasks) {
            return {
              ...t,
              subtasks: t.subtasks.map((st) =>
                st._id === subTaskId ? { ...st, isCompleted } : st
              ),
            };
          }
          return t;
        });
      });

      return { previousTask, previousTasks, projectId, taskId };
    },

    onError: (_err, variables, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(
          taskKeys.detail(variables.projectId, variables.taskId),
          context.previousTask
        );
      }
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.all(variables.projectId), context.previousTasks);
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.detail(variables.projectId, variables.taskId),
      });
      queryClient.invalidateQueries({ queryKey: taskKeys.all(variables.projectId) });
    },
  });
};

export const useCreateSubtaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      taskId,
      title,
    }: {
      projectId: string;
      taskId: string;
      title: string;
    }) => createSubtask(projectId, taskId, title),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.detail(variables.projectId, variables.taskId),
      });
      queryClient.invalidateQueries({ queryKey: taskKeys.all(variables.projectId) });
    },
  });
};

export const useDeleteSubtaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      subTaskId,
    }: {
      projectId: string;
      taskId: string;
      subTaskId: string;
    }) => deleteSubtask(projectId, subTaskId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.detail(variables.projectId, variables.taskId),
      });
      queryClient.invalidateQueries({ queryKey: taskKeys.all(variables.projectId) });
    },
  });
};
