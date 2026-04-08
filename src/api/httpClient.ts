import { useAuthStore } from "@/stores/useAuthStore";

export const API_BASE_URL = import.meta.env.VITE_APP_API_BASE;

export type RequestOptions = {
    path: string;
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    headers?: HeadersInit;
    signal?: AbortSignal;
    cache?: RequestCache;
};

export function buildUrl(path: string) {
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return new URL(path, API_BASE_URL).toString();
}

export function getDefaultHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    const token = useAuthStore.getState().token;
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
}

async function readError(response: Response) {
    try {
        const data = await response.json();
        return data?.detail || data?.message || `Request failed with ${response.status}`;
    } catch {
        const text = await response.text();
        return text || `Request failed with ${response.status}`;
    }
}

export async function requestJson<T>({
    path,
    method = "GET",
    body,
    headers,
    signal,
    cache,
}: RequestOptions): Promise<T> {
    const response = await fetch(buildUrl(path), {
        method,
        headers: {
            "Content-Type": "application/json",
            ...getDefaultHeaders(),
            ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal,
        cache,
    });

    if (!response.ok) {
        throw new Error(await readError(response));
    }

    if (response.status === 204) {
        return undefined as T;
    }

    const text = await response.text();
    if (!text) {
        return undefined as T;
    }

    return JSON.parse(text) as T;
}
