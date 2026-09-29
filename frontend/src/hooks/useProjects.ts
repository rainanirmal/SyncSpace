import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../api/projects';
import type { Project } from '../types';

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  detail: (id: string) => [...projectKeys.all, id] as const,
};

export const useProjectsQuery = () => {
  return useQuery<Project[]>({
    queryKey: projectKeys.all,
    queryFn: getProjects,
  });
};

export const useProjectQuery = (projectId: string | undefined) => {
  return useQuery<Project>({
    queryKey: projectKeys.detail(projectId!),
    queryFn: () => getProjectById(projectId!),
    enabled: !!projectId,
  });
};

export const useCreateProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, description }: { name: string; description?: string }) =>
      createProject(name, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
};

export const useUpdateProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      name,
      description,
    }: {
      projectId: string;
      name: string;
      description?: string;
    }) => updateProject(projectId, name, description),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) });
    },
  });
};

export const useDeleteProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
};
