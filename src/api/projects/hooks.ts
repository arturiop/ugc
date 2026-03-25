import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/api/queryKeys";
import { createProject, deleteProject, getProject, listProjects } from "./index";

export function useProjects() {
    return useQuery({
        queryKey: queryKeys.projects.list(),
        queryFn: ({ signal }) => listProjects(signal),
    });
}

export function useProject(projectId: string | null | undefined) {
    return useQuery({
        queryKey: projectId ? queryKeys.projects.detail(projectId) : queryKeys.projects.detail(""),
        queryFn: ({ signal }) => getProject(projectId as string, signal),
        enabled: Boolean(projectId && projectId !== "null" && projectId !== "undefined"),
    });
}

export function useCreateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createProject,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.list() });
            if (data?.short_id) {
                queryClient.setQueryData(queryKeys.projects.detail(data.short_id), data);
            }
            if (data?.uuid) {
                queryClient.setQueryData(queryKeys.projects.detail(data.uuid), data);
            }
        },
    });
}

export function useDeleteProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ projectId }: { projectId: string }) => deleteProject(projectId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.list() });
            queryClient.removeQueries({ queryKey: queryKeys.projects.detail(variables.projectId) });
        },
    });
}
