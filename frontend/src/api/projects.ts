import axiosClient from './axiosClient';
import type { ApiResponseEnvelope, Project, ProjectMember, ProjectMemberRole } from '../types';

export const getProjects = async (): Promise<any[]> => {
  const response = await axiosClient.get<ApiResponseEnvelope<any[]>>('/projects');
  return response.data.data;
};

export const createProject = async (
  name: string,
  description?: string
): Promise<Project> => {
  const response = await axiosClient.post<ApiResponseEnvelope<Project>>(
    '/projects',
    { name, description }
  );
  return response.data.data;
};

export const getProjectById = async (
  projectId: string
): Promise<Project> => {
  const response = await axiosClient.get<ApiResponseEnvelope<Project>>(
    `/projects/${projectId}`
  );
  return response.data.data;
};

export const updateProject = async (
  projectId: string,
  name: string,
  description?: string
): Promise<Project> => {
  const response = await axiosClient.put<ApiResponseEnvelope<Project>>(
    `/projects/${projectId}`,
    { name, description }
  );
  return response.data.data;
};

export const deleteProject = async (
  projectId: string
): Promise<Project> => {
  const response = await axiosClient.delete<ApiResponseEnvelope<Project>>(
    `/projects/${projectId}`
  );
  return response.data.data;
};

export const getMembers = async (
  projectId: string
): Promise<ProjectMember[]> => {
  const response = await axiosClient.get<ApiResponseEnvelope<ProjectMember[]>>(
    `/projects/${projectId}/members`
  );
  return response.data.data;
};

export const addMember = async (
  projectId: string,
  email: string,
  role: ProjectMemberRole
): Promise<Record<string, unknown>> => {
  const response = await axiosClient.post<ApiResponseEnvelope<Record<string, unknown>>>(
    `/projects/${projectId}/members`,
    { email, role }
  );
  return response.data.data;
};

export const updateMemberRole = async (
  projectId: string,
  userId: string,
  newRole: ProjectMemberRole
): Promise<ProjectMember> => {
  const response = await axiosClient.put<ApiResponseEnvelope<ProjectMember>>(
    `/projects/${projectId}/members/${userId}`,
    { newRole }
  );
  return response.data.data;
};

export const removeMember = async (
  projectId: string,
  userId: string
): Promise<Record<string, unknown>> => {
  const response = await axiosClient.delete<ApiResponseEnvelope<Record<string, unknown>>>(
    `/projects/${projectId}/members/${userId}`
  );
  return response.data.data;
};
