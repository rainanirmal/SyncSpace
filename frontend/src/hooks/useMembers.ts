import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMembers, addMember, updateMemberRole, removeMember } from '../api/projects';
import type { ProjectMember, ProjectMemberRole } from '../types';

export const memberKeys = {
  all: (projectId: string) => ['projects', projectId, 'members'] as const,
};

export const useMembersQuery = (projectId: string | undefined) => {
  return useQuery<ProjectMember[]>({
    queryKey: memberKeys.all(projectId!),
    queryFn: () => getMembers(projectId!),
    enabled: !!projectId,
  });
};

export const useAddMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      email,
      role,
    }: {
      projectId: string;
      email: string;
      role: ProjectMemberRole;
    }) => addMember(projectId, email, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: memberKeys.all(variables.projectId) });
    },
  });
};

export const useUpdateMemberRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      userId,
      newRole,
    }: {
      projectId: string;
      userId: string;
      newRole: ProjectMemberRole;
    }) => updateMemberRole(projectId, userId, newRole),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: memberKeys.all(variables.projectId) });
    },
  });
};

export const useRemoveMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) =>
      removeMember(projectId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: memberKeys.all(variables.projectId) });
    },
  });
};
