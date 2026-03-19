import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/api/queryKeys";
import { getProjectStoryboard, StoryboardResponse, updateProjectStoryboard, StoryboardUpdateRequest } from "./index";

export function useProjectStoryboard(projectId: string | null | undefined) {
    return useQuery<StoryboardResponse>({
        queryKey: projectId ? queryKeys.projects.storyboard(projectId) : queryKeys.projects.storyboard(""),
        queryFn: ({ signal }) => getProjectStoryboard(projectId as string, signal),
        enabled: Boolean(projectId),
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
