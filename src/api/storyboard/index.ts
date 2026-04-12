import { requestJson } from "@/api/httpClient";

export type StoryboardScene = {
    scene_index: number;
    title: string;
    objective: string;
    description: string;
    script: string;
    visual_prompt: string;
    frame_prompt: string;
    video_prompt: string;
    transition_prompt?: string | null;
    generated_image_url?: string | null;
    generated_video_url?: string | null;
    video_status?: "not_started" | "generating" | "ready" | "approved" | "failed" | null;
    selected_for_video?: boolean;
};

export type MarketplaceStoryboardState = {
    source: string;
    product_title?: string | null;
    product_description?: string | null;
    style?: string | null;
    product_image_url?: string | null;
    listing_metadata?: Record<string, unknown> | null;
    selected_scene_indices?: number[];
    pipeline_status?: "idle" | "running" | "completed" | "failed";
    pipeline_step?:
        | "input_confirmed"
        | "extracting_listing"
        | "listing_extracted"
        | "generating_storyboard"
        | "generating_scene_images"
        | "generating_scene_videos"
        | "combining_video"
        | "completed"
        | "failed"
        | string
        | null;
    pipeline_error?: string | null;
    final_video_url?: string | null;
    final_video_status?: "not_started" | "processing" | "ready" | "failed";
};

export type Storyboard = {
    id: number;
    version: number;
    title?: string;
    concept: string;
    audience: string;
    tone: string;
    platform: string;
    hook?: string;
    cta?: string;
    key_message?: string;
    assumptions?: string[];
    aspect_ratio: string;
    storyboard_image_url?: string | null;
    scenes: StoryboardScene[];
    updated_at: string | null;
};

export type StoryboardResponse = {
    storyboard: Storyboard | null;
    marketplace?: MarketplaceStoryboardState | null;
};

export type StoryboardUpdateRequest = {
    audience?: string | null;
    tone?: string | null;
    platform?: string | null;
    aspect_ratio?: string | null;
};

export async function getProjectStoryboard(projectId: string, signal?: AbortSignal) {
    return requestJson<StoryboardResponse>({
        path: `/api/projects/${projectId}/storyboard`,
        signal,
    });
}

export async function updateProjectStoryboard(
    projectId: string,
    updates: StoryboardUpdateRequest,
    signal?: AbortSignal
) {
    return requestJson<StoryboardResponse>({
        path: `/api/projects/${projectId}/storyboard`,
        method: "PATCH",
        body: updates,
        signal,
    });
}

export type SceneVideoResponse = {
    scene: StoryboardScene;
};

export type SceneApproveResponse = {
    scene: StoryboardScene;
    next_scene_index: number | null;
};

export async function generateSceneVideo(projectId: string, sceneIndex: number, force = false) {
    const query = force ? "?force=true" : "";
    return requestJson<SceneVideoResponse>({
        path: `/api/projects/${projectId}/scenes/${sceneIndex}/video${query}`,
        method: "POST",
    });
}

export async function approveSceneVideo(projectId: string, sceneIndex: number) {
    return requestJson<SceneApproveResponse>({
        path: `/api/projects/${projectId}/scenes/${sceneIndex}/approve`,
        method: "POST",
    });
}
