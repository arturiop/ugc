import { requestJson } from "@/api/httpClient";

export type PromptItem = {
    key: string;
    version: number;
    prompt: string;
    is_active: boolean;
    created_at: string;
    updated_at?: string | null;
};

export type PromptListResponse = {
    items: PromptItem[];
};

export type PromptUpsertRequest = {
    prompt: string;
};

export async function listPrompts(signal?: AbortSignal) {
    return requestJson<PromptListResponse>({
        path: "/api/v1/settings/prompts",
        signal,
    });
}

export async function upsertPrompt(
    key: string,
    payload: PromptUpsertRequest,
    signal?: AbortSignal
) {
    return requestJson<PromptItem>({
        path: `/api/v1/settings/prompts/${encodeURIComponent(key)}`,
        method: "PUT",
        body: payload,
        signal,
    });
}

export async function deletePrompt(key: string, signal?: AbortSignal) {
    return requestJson<PromptItem>({
        path: `/api/v1/settings/prompts/${encodeURIComponent(key)}`,
        method: "DELETE",
        signal,
    });
}
