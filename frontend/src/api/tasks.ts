import axiosClient from './axiosClient';
import type {
  ApiResponseEnvelope,
  Task,
  SubTask,
  UpdateTaskPayload,
  UpdateSubtaskPayload,
} from '../types';

export const getTasks = async (
  projectId: string
): Promise<Task[]> => {
  const response = await axiosClient.get<ApiResponseEnvelope<Task[]>>(
    `/projects/${projectId}/tasks`
  );
  return response.data.data;
};

export const createTask = async (
  projectId: string,
  title: string,
  description?: string,
  assignedTo?: string,
  status?: string,
  files?: File[]
): Promise<Task> => {
  if (files && files.length > 0) {
    const formData = new FormData();
    formData.append('title', title);
    if (description) formData.append('description', description);
    if (assignedTo) formData.append('assignedTo', assignedTo);
    if (status) formData.append('status', status);

    files.forEach((file) => {
      formData.append('attachments', file);
    });

    const response = await axiosClient.post<ApiResponseEnvelope<Task>>(
      `/projects/${projectId}/tasks`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  }

  const response = await axiosClient.post<ApiResponseEnvelope<Task>>(
    `/projects/${projectId}/tasks`,
    { title, description, assignedTo, status }
  );
  return response.data.data;
};

export const getTaskById = async (
  projectId: string,
  taskId: string
): Promise<Task> => {
  const response = await axiosClient.get<ApiResponseEnvelope<Task>>(
    `/projects/${projectId}/tasks/${taskId}`
  );
  return response.data.data;
};

export const updateTask = async (
  projectId: string,
  taskId: string,
  updates: UpdateTaskPayload
): Promise<Task> => {
  const response = await axiosClient.put<ApiResponseEnvelope<Task>>(
    `/projects/${projectId}/tasks/${taskId}`,
    updates
  );
  return response.data.data;
};

export const deleteTask = async (
  projectId: string,
  taskId: string
): Promise<Task> => {
  const response = await axiosClient.delete<ApiResponseEnvelope<Task>>(
    `/projects/${projectId}/tasks/${taskId}`
  );
  return response.data.data;
};

export const createSubtask = async (
  projectId: string,
  taskId: string,
  title: string
): Promise<SubTask> => {
  const response = await axiosClient.post<ApiResponseEnvelope<SubTask>>(
    `/projects/${projectId}/tasks/${taskId}/subtasks`,
    { title }
  );
  return response.data.data;
};

export const updateSubtask = async (
  projectId: string,
  subTaskId: string,
  updates: UpdateSubtaskPayload
): Promise<SubTask> => {
  const response = await axiosClient.put<ApiResponseEnvelope<SubTask>>(
    `/projects/${projectId}/tasks/subtasks/${subTaskId}`,
    updates
  );
  return response.data.data;
};

export const deleteSubtask = async (
  projectId: string,
  subTaskId: string
): Promise<SubTask> => {
  const response = await axiosClient.delete<ApiResponseEnvelope<SubTask>>(
    `/projects/${projectId}/tasks/subtasks/${subTaskId}`
  );
  return response.data.data;
};
