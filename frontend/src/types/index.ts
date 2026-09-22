export interface User {
  _id: string;
  username: string;
  email: string;
  fullName?: string;
  avatar?: string;
  isEmailVerified: boolean;
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

export interface ProjectMember {
  _id?: string;
  user: User;
  project: string;
  role: 'ADMIN' | 'PROJECT_MANAGER' | 'MEMBER';
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
  status: 'TODO' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'COMPLETED';
  attachments?: TaskAttachment[];
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
