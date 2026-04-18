import type { MarketplaceExtractResponse } from "@/api/projects";

export type ResultSlot = {
    id: string;
    title: string;
    caption: string;
};

export type ManualImage = {
    id: string;
    file: File;
    previewUrl: string;
};

export type ManualProductDraft = {
    title: string;
    description: string;
    vibe: string;
    images: ManualImage[];
};

export type ExtractedListingState = MarketplaceExtractResponse | null;

export const SCENE_SLOTS: ResultSlot[] = [
    { id: "scene-1", title: "Scene 1", caption: "Marketplace hero frame" },
    { id: "scene-2", title: "Scene 2", caption: "Benefit-led close-up" },
    { id: "scene-3", title: "Scene 3", caption: "Context of use" },
    { id: "scene-4", title: "Scene 4", caption: "Feature detail" },
    { id: "scene-5", title: "Scene 5", caption: "Lifestyle proof" },
    { id: "scene-6", title: "Scene 6", caption: "Offer and finish frame" },
];

export const EMPTY_SCENE_SELECTION: number[] = [];
