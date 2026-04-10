import { requestJson } from "@/api/httpClient";

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

export type MarketplaceStartRequest = {
    product_url: string;
};

export type MarketplaceExtractResponse = {
    product_url: string;
    product_title: string;
    product_description: string;
    product_image_url: string;
};

export type MarketplaceBriefInitRequest = {
    source: "amazon" | "manual";
    product_url?: string | null;
    product_title: string;
    product_description: string;
    product_image_url?: string | null;
    vibe?: string | null;
    image_asset_ids?: number[];
    listing_metadata?: Record<string, unknown>;
};

export type MarketplaceStartResponse = {
    started: boolean;
    project_id: string;
    pipeline_status: "running";
};

export async function listProjects(signal?: AbortSignal) {
    return requestJson<ProjectListResponse>({
        path: "/api/v1/projects",
        signal,
    });
}

export async function createProject(projectType: ProjectType = ProjectType.Storyboard) {
    return requestJson<ProjectResponse>({
        path: "/api/v1/projects",
        method: "POST",
        body: { project_type: projectType },
    });
}

export async function getProject(projectId: string, signal?: AbortSignal) {
    return requestJson<ProjectResponse>({
        path: `/api/v1/projects/${projectId}`,
        signal,
    });
}

export async function deleteProject(projectId: string) {
    return requestJson<void>({
        path: `/api/v1/projects/${projectId}`,
        method: "DELETE",
    });
}

export async function startMarketplaceProject(projectId: string, payload: MarketplaceStartRequest) {
    return requestJson<MarketplaceStartResponse>({
        path: `/api/v1/projects/${projectId}/marketplace/start`,
        method: "POST",
        body: payload,
    });
}

export async function extractMarketplaceListing(payload: MarketplaceStartRequest) {
    return requestJson<MarketplaceExtractResponse>({
        path: "/api/v1/projects/marketplace/extract",
        method: "POST",
        body: payload,
    });
}

export async function initializeMarketplaceProjectBrief(projectId: string, payload: MarketplaceBriefInitRequest) {
    return requestJson<ProjectResponse>({
        path: `/api/v1/projects/${projectId}/marketplace/brief`,
        method: "POST",
        body: payload,
    });
}
