import type { ManualImage, ManualProductDraft } from "./types";

export function normalizeAmazonUrl(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
    return `https://${trimmed}`;
}

export function isAmazonUrl(value: string) {
    try {
        const parsed = new URL(value);
        return /(^|\.)amazon\./i.test(parsed.hostname);
    } catch {
        return false;
    }
}

export function createEmptyManualDraft(): ManualProductDraft {
    return {
        title: "",
        description: "",
        vibe: "",
        images: [],
    };
}

export function releaseManualImages(images: ManualImage[]) {
    images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
}

export function formatEstimatedDuration(seconds: number) {
    if (seconds <= 0) return "0s";
    if (seconds % 60 === 0) return `${seconds / 60}m`;
    if (seconds > 60) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${seconds}s`;
}
