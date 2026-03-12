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
    current_stage: string;
    created_at: string;
    updated_at: string;
    stages: ProjectStageEntry[];
};

export type ProjectSummary = {
    id: string;
    title?: string;
    name?: string;
    updatedAt: string;
    thumbnailUrl?: string | null;
};

export type ProjectListResponse = {
    items: ProjectSummary[];
};

export async function listProjects(signal?: AbortSignal) {
    return requestJson<ProjectListResponse>({
        path: "/api/v1/projects",
        signal,
    });
}

export async function createProject() {
    return requestJson<ProjectResponse>({
        path: "/api/v1/projects",
        method: "POST",
        body: {},
    });
}

export async function getProject(projectId: string, signal?: AbortSignal) {
    return requestJson<ProjectResponse>({
        path: `/api/v1/projects/${projectId}`,
        signal,
    });
}
