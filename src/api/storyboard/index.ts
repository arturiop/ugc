import { requestJson } from "@/api/httpClient";

export type StoryboardScene = {
    scene_index: number;
    title: string;
    objective: string;
    description: string;
    script: string;
    visual_prompt: string;
    frame_prompt: string;
    generated_image_url?: string | null;
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
    scenes: StoryboardScene[];
    updated_at: string | null;
};

export type StoryboardResponse = {
    storyboard: Storyboard | null;
};

export async function getProjectStoryboard(projectId: string, signal?: AbortSignal) {
    return requestJson<StoryboardResponse>({
        path: `/api/v1/projects/${projectId}/storyboard`,
        signal,
    });
}
