export interface ApiResponseEnvelope<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  fullName?: string;
  avatar?: string;
  isEmailVerified: boolean;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  createdBy: string;
  members?: number;
  createdAt: string;
  updatedAt: string;
}

export type ProjectMemberRole = 'admin' | 'project_admin' | 'member';

export interface ProjectMember {
  _id?: string;
  user: User;
  project: string;
  role: ProjectMemberRole | 'ADMIN' | 'PROJECT_MANAGER' | 'MEMBER';
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskAttachment {
  url: string;
  mimetype: string;
  size: number;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  project: string;
  assignedTo?: User;
  assignedBy?: string;
  status: string;
  attachments?: TaskAttachment[];
  subtasks?: SubTask[];
  createdAt: string;
  updatedAt: string;
}

export interface SubTask {
  _id: string;
  title: string;
  task: string;
  isCompleted: boolean;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  assignedTo?: string;
  status?: string;
}

export interface UpdateSubtaskPayload {
  title?: string;
  isCompleted?: boolean;
}
