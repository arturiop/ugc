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
        | { type: "data-generation"; data?: { event?: string; media?: string; scope?: string; error?: string } }
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
        path: `/api/projects/${projectId}/chat/messages`,
        signal,
        cache: "no-store",
    });
}

export function getProjectChatTransportConfig(projectId: string) {
    return {
        api: buildUrl("/api/projects/chat"),
        headers: getDefaultHeaders(),
        body: { projectId },
    };
}
