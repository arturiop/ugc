import { buildUrl, getDefaultHeaders, requestJson } from "@/api/httpClient";

export type ViralKnowledgeScene = {
    title: string;
    description: string;
    startSeconds?: number | null;
    endSeconds?: number | null;
    durationSeconds?: number | null;
    frameTimestampSeconds?: number | null;
    ocrText?: string | null;
};

export type ViralKnowledgePreview = {
    analysisId?: number | null;
    sourceId?: number | null;
    sourceUrl?: string | null;
    title: string;
    platform: string;
    creatorName?: string | null;
    transcript: string;
    ocrText: string;
    knowledgeMaterial: string;
    summary: string;
    hookPattern: string;
    ctaPattern: string;
    whyItWorks: string;
    sceneBreakdown: ViralKnowledgeScene[];
    lessons: string[];
    tags: string[];
};

export type ViralKnowledgeEntry = ViralKnowledgePreview & {
    id: string;
    status: "draft" | "active";
    createdAt: string;
};

type ExtractByUrlPayload = {
    sourceUrl: string;
};

type CreateEntryPayload = {
    preview: ViralKnowledgePreview;
};

type ExtractResponse = {
    preview: ViralKnowledgePreview;
};

type CreateEntryResponse = {
    entry: ViralKnowledgeEntry;
};

export async function extractViralKnowledgeFromUrl(payload: ExtractByUrlPayload, signal?: AbortSignal) {
    return requestJson<ExtractResponse>({
        path: "/api/v1/admin/viral-kb/extract/url",
        method: "POST",
        body: payload,
        signal,
    });
}

export async function extractViralKnowledgeFromFile(file: File, signal?: AbortSignal) {
    const form = new FormData();
    form.append("file", file);

    const response = await fetch(buildUrl("/api/v1/admin/viral-kb/extract/file"), {
        method: "POST",
        headers: getDefaultHeaders(),
        body: form,
        signal,
    });

    if (!response.ok) {
        let errorText = `Request failed with ${response.status}`;
        try {
            const json = await response.json();
            errorText = json?.detail || json?.message || errorText;
        } catch {
            const text = await response.text();
            errorText = text || errorText;
        }
        throw new Error(errorText);
    }

    return (await response.json()) as ExtractResponse;
}

export async function createViralKnowledgeEntry(payload: CreateEntryPayload, signal?: AbortSignal) {
    return requestJson<CreateEntryResponse>({
        path: "/api/v1/admin/viral-kb/entries",
        method: "POST",
        body: payload,
        signal,
    });
}
