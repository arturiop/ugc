import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";

import { queryKeys } from "@/api/queryKeys";
import { getProjectStoryboard, StoryboardResponse, updateProjectStoryboard, StoryboardUpdateRequest } from "./index";

type ProjectStoryboardQueryOptions = Omit<UseQueryOptions<StoryboardResponse>, "queryKey" | "queryFn" | "enabled">;

export function useProjectStoryboard(projectId: string | null | undefined, options?: ProjectStoryboardQueryOptions) {
    return useQuery<StoryboardResponse>({
        queryKey: projectId ? queryKeys.projects.storyboard(projectId) : queryKeys.projects.storyboard(""),
        queryFn: ({ signal }) => getProjectStoryboard(projectId as string, signal),
        enabled: Boolean(projectId),
        ...options,
    });
}

export function useUpdateProjectStoryboard(projectId: string | null | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (updates: StoryboardUpdateRequest) => updateProjectStoryboard(projectId as string, updates),
        onSuccess: () => {
            if (!projectId) return;
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.storyboard(projectId) });
        },
    });
}
