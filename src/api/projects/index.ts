import { requestJson } from "@/api/httpClient";
import { buildUrl, getDefaultHeaders } from "@/api/httpClient";

export type ProjectStageEntry = {
    stage: string;
    status: string;
    created_at: string;
    updated_at: string;
};

export type ProjectResponse = {
    uuid: string;
    short_id: string;
    created_by: number;
    title: string;
    name: string;
    project_type: ProjectType;
    status: ProjectStatus;
    current_stage: string;
    created_at: string;
    updated_at: string;
    stages: ProjectStageEntry[];
};

export enum ProjectStatus {
    Draft = 1,
    Active = 2,
    Archived = 5,
}

export type ProjectSummary = {
    id: string;
    title?: string;
    name?: string;
    project_type: ProjectType;
    status: ProjectStatus;
    updatedAt: string;
    thumbnailUrl?: string | null;
    imageUrl?: string | null;
    coverUrl?: string | null;
    previewUrl?: string | null;
    lastImageUrl?: string | null;
};

export enum ProjectType {
    Storyboard = "storyboard",
    SatisfactionVideo = "satisfaction_video",
    MarketplaceCreatives = "marketplace_creatives",
}

export type ProjectListResponse = {
    items: ProjectSummary[];
};

export type MarketplaceExtractRequest = {
    product_url: string;
};

export type MarketplaceExtractResponse = {
    product_url: string;
    product_title: string;
    product_description: string;
    product_image_url: string;
};

export type MarketplaceSubmitResponse = {
    project_id: string;
    project_short_id: string;
};

export type CreateMarketplaceProjectPayload = {
    source: "amazon_extracted" | "manual";
    product_title: string;
    product_description: string;
    style?: string | null;
    image_urls?: string[];
    listing_metadata?: Record<string, unknown>;
    files?: File[];
};

export async function listProjects(signal?: AbortSignal) {
    return requestJson<ProjectListResponse>({
        path: "/api/projects",
        signal,
    });
}

export async function createProject(projectType: ProjectType = ProjectType.Storyboard) {
    return requestJson<ProjectResponse>({
        path: "/api/projects",
        method: "POST",
        body: { project_type: projectType },
    });
}

export async function getProject(projectId: string, signal?: AbortSignal) {
    return requestJson<ProjectResponse>({
        path: `/api/projects/${projectId}`,
        signal,
    });
}

export async function deleteProject(projectId: string) {
    return requestJson<void>({
        path: `/api/projects/${projectId}`,
        method: "DELETE",
    });
}

export async function extractMarketplaceListing(payload: MarketplaceExtractRequest) {
    return requestJson<MarketplaceExtractResponse>({
        path: "/api/projects/marketplace/extract",
        method: "POST",
        body: payload,
    });
}

export async function createAndSubmitMarketplaceProject(payload: CreateMarketplaceProjectPayload) {
    const form = new FormData();
    form.append("source", payload.source);
    form.append("product_title", payload.product_title);
    form.append("product_description", payload.product_description);
    if (payload.style) {
        form.append("style", payload.style);
    }
    if (payload.image_urls?.length) {
        form.append("image_urls_json", JSON.stringify(payload.image_urls));
    }
    if (payload.listing_metadata) {
        form.append("listing_metadata_json", JSON.stringify(payload.listing_metadata));
    }
    for (const file of payload.files ?? []) {
        form.append("files", file);
    }

    const response = await fetch(buildUrl("/api/projects/make-creatives"), {
        method: "POST",
        headers: getDefaultHeaders(),
        body: form,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create marketplace project.");
    }

    return (await response.json()) as MarketplaceSubmitResponse;
}
