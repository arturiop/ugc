import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/api/queryKeys";
import { getProjectStoryboard, StoryboardResponse } from "./index";

export function useProjectStoryboard(projectId: string | null | undefined) {
    return useQuery<StoryboardResponse>({
        queryKey: projectId ? queryKeys.projects.storyboard(projectId) : queryKeys.projects.storyboard(""),
        queryFn: ({ signal }) => getProjectStoryboard(projectId as string, signal),
        enabled: Boolean(projectId),
    });
}
