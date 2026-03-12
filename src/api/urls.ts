import { buildUrl } from "./httpClient";

export function resolveAssetUrl(url?: string | null) {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return buildUrl(url);
}
