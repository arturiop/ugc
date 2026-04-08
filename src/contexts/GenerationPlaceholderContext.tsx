import type { PropsWithChildren } from "react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type GenerationPlaceholderMedia = "image" | "video";

export type GenerationPlaceholderState = {
    media: GenerationPlaceholderMedia;
    scope?: string;
    status: "running" | "ready" | "failed";
    url?: string;
    error?: string;
};

type GenerationPlaceholderContextValue = {
    placeholder: GenerationPlaceholderState | null;
    startPlaceholder: (next: { media: GenerationPlaceholderMedia; scope?: string }) => void;
    stopPlaceholder: (match?: { media?: GenerationPlaceholderMedia; scope?: string }) => void;
    resolvePlaceholder: (next: { media: GenerationPlaceholderMedia; scope?: string; url?: string }) => void;
    failPlaceholder: (next: { media: GenerationPlaceholderMedia; scope?: string; error?: string }) => void;
};

const GenerationPlaceholderContext = createContext<GenerationPlaceholderContextValue | null>(null);

const matchesPlaceholder = (
    current: GenerationPlaceholderState | null,
    match?: { media?: GenerationPlaceholderMedia; scope?: string }
) => {
    if (!current) return false;
    if (match?.media && current.media !== match.media) return false;
    if (match?.scope && current.scope !== match.scope) return false;
    return true;
};

export function GenerationPlaceholderProvider({ children }: PropsWithChildren) {
    const [placeholder, setPlaceholder] = useState<GenerationPlaceholderState | null>(null);

    const startPlaceholder = useCallback((next: { media: GenerationPlaceholderMedia; scope?: string }) => {
        setPlaceholder({
            media: next.media,
            scope: next.scope,
            status: "running",
        });
    }, []);

    const stopPlaceholder = useCallback((match?: { media?: GenerationPlaceholderMedia; scope?: string }) => {
        setPlaceholder((current) => (matchesPlaceholder(current, match) ? null : current));
    }, []);

    const resolvePlaceholder = useCallback((next: { media: GenerationPlaceholderMedia; scope?: string; url?: string }) => {
        setPlaceholder((current) => {
            if (current && !matchesPlaceholder(current, { media: next.media, scope: next.scope })) {
                return current;
            }
            return {
                media: next.media,
                scope: next.scope,
                status: "ready",
                url: next.url,
            };
        });
    }, []);

    const failPlaceholder = useCallback((next: { media: GenerationPlaceholderMedia; scope?: string; error?: string }) => {
        setPlaceholder((current) => {
            if (current && !matchesPlaceholder(current, { media: next.media, scope: next.scope })) {
                return current;
            }
            return {
                media: next.media,
                scope: next.scope,
                status: "failed",
                error: next.error,
            };
        });
    }, []);

    const value = useMemo(
        () => ({
            placeholder,
            startPlaceholder,
            stopPlaceholder,
            resolvePlaceholder,
            failPlaceholder,
        }),
        [placeholder, startPlaceholder, stopPlaceholder, resolvePlaceholder, failPlaceholder]
    );

    return <GenerationPlaceholderContext.Provider value={value}>{children}</GenerationPlaceholderContext.Provider>;
}

export function useGenerationPlaceholder() {
    const context = useContext(GenerationPlaceholderContext);
    if (!context) {
        throw new Error("useGenerationPlaceholder must be used within GenerationPlaceholderProvider.");
    }
    return context;
}
