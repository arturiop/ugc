import { buildUrl, getDefaultHeaders, requestJson } from "@/api/httpClient";

export type HistoryMessage = {
    id?: string;
    role: "user" | "assistant";
    content?: string;
    parts?: Array<
        { type: "text"; text: string }
        | { type: "image"; image: string; filename?: string }
        | { type: "file"; url?: string; data?: string; mediaType?: string; mimeType?: string; filename?: string }
        | { type: "data-image"; data?: { url?: string; mediaType?: string; filename?: string } }
        | { type: "data-video"; data?: { url?: string; mediaType?: string; filename?: string } }
        | { type: "data"; name: string; data?: Record<string, unknown> }
    >;
    createdAt?: string;
    metadata?: Record<string, unknown>;
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
