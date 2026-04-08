import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/api/queryKeys";
import { getProjectChatMessages } from "./index";

export function useProjectChatHistory(projectId: string | null | undefined) {
    return useQuery({
        queryKey: projectId ? queryKeys.projects.chatMessages(projectId) : queryKeys.projects.chatMessages(""),
        queryFn: ({ signal }) => getProjectChatMessages(projectId as string, signal),
        enabled: Boolean(projectId),
        refetchOnMount: "always",
    });
}
