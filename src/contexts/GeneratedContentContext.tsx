import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type GeneratedImage = {
    id: string;
    url: string;
    title: string;
};

type GeneratedContentContextValue = {
    images: GeneratedImage[];
    addImages: (urls: string[]) => void;
    clearImages: () => void;
};

const GeneratedContentContext = createContext<GeneratedContentContextValue | null>(null);

const createId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
    return `gen-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const titleFromUrl = (url: string, index: number) => {
    const clean = url.split("#")[0]?.split("?")[0] ?? "";
    const basename = clean.split("/").pop() ?? "";
    const trimmed = basename.replace(/\.[^/.]+$/, "");
    return trimmed ? trimmed.replace(/[-_]+/g, " ") : `Generated image ${index}`;
};

export function GeneratedContentProvider({ children }: { children: ReactNode }) {
    const [images, setImages] = useState<GeneratedImage[]>([]);

    const addImages = useCallback((urls: string[]) => {
        if (!urls.length) return;
        setImages((prev) => {
            const next = [...prev];
            const urlSet = new Set(prev.map((item) => item.url));
            let counter = next.length + 1;
            for (const url of urls) {
                if (!url || urlSet.has(url)) continue;
                next.push({
                    id: createId(),
                    url,
                    title: titleFromUrl(url, counter),
                });
                urlSet.add(url);
                counter += 1;
            }
            return next;
        });
    }, []);

    const clearImages = useCallback(() => setImages([]), []);

    const value = useMemo(
        () => ({
            images,
            addImages,
            clearImages,
        }),
        [images, addImages, clearImages]
    );

    return <GeneratedContentContext.Provider value={value}>{children}</GeneratedContentContext.Provider>;
}

export function useGeneratedContent() {
    const context = useContext(GeneratedContentContext);
    if (!context) {
        throw new Error("useGeneratedContent must be used within GeneratedContentProvider.");
    }
    return context;
}
