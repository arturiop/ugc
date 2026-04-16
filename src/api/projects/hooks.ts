import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";

import { queryKeys } from "@/api/queryKeys";
import {
    approveMarketplaceScenes,
    createAndSubmitMarketplaceProject,
    createProject,
    deleteProject,
    extractMarketplaceListing,
    getProject,
    listProjects,
    ProjectResponse,
} from "./index";

type ProjectQueryOptions = Omit<UseQueryOptions<ProjectResponse>, "queryKey" | "queryFn" | "enabled">;

export function useProjects() {
    return useQuery({
        queryKey: queryKeys.projects.list(),
        queryFn: ({ signal }) => listProjects(signal),
    });
}

export function useProject(projectId: string | null | undefined, options?: ProjectQueryOptions) {
    return useQuery({
        queryKey: projectId ? queryKeys.projects.detail(projectId) : queryKeys.projects.detail(""),
        queryFn: ({ signal }) => getProject(projectId as string, signal),
        enabled: Boolean(projectId && projectId !== "null" && projectId !== "undefined"),
        ...options,
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

export function useCreateAndSubmitMarketplaceProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createAndSubmitMarketplaceProject,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.list() });
            if (data?.project_id) {
                queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(data.project_id) });
                queryClient.invalidateQueries({ queryKey: queryKeys.projects.storyboard(data.project_id) });
            }
            if (data?.project_short_id) {
                queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(data.project_short_id) });
                queryClient.invalidateQueries({ queryKey: queryKeys.projects.storyboard(data.project_short_id) });
            }
        },
    });
}

export function useExtractMarketplaceListing() {
    return useMutation({
        mutationFn: ({ productUrl }: { productUrl: string }) => extractMarketplaceListing({ product_url: productUrl }),
    });
}

export function useApproveMarketplaceScenes(projectId: string | null | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ sceneIndices }: { sceneIndices: number[] }) =>
            approveMarketplaceScenes(projectId as string, { scene_indices: sceneIndices }),
        onSuccess: () => {
            if (!projectId) return;
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.storyboard(projectId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.list() });
        },
    });
}
