import { buildUrl, getDefaultHeaders, requestJson } from "@/api/httpClient";

export type HistoryMessage = {
    id?: string;
    role: "user" | "assistant";
    content?: string;
    parts?: Array<{ type: "text"; text: string } | { type: "file"; url: string; mediaType: string; filename?: string }>;
    createdAt?: string;
};

export type ProjectChatHistoryResponse = {
    messages?: HistoryMessage[];
};

export async function getProjectChatMessages(projectId: string, signal?: AbortSignal) {
    return requestJson<ProjectChatHistoryResponse>({
        path: `/api/v1/projects/${projectId}/chat/messages`,
        signal,
    });
}

export function getProjectChatTransportConfig(projectId: string) {
    return {
        api: buildUrl("/api/v1/projects/chat"),
        headers: getDefaultHeaders(),
        body: { projectId },
    };
}
