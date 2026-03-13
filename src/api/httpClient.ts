import { useAuthStore } from "@/stores/useAuthStore";

export const API_BASE_URL = import.meta.env.VITE_APP_NGROK || "http://localhost:5050";

export type RequestOptions = {
    path: string;
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    headers?: HeadersInit;
    signal?: AbortSignal;
};

export function buildUrl(path: string) {
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return new URL(path, API_BASE_URL).toString();
}

export function getDefaultHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
        "ngrok-skip-browser-warning": "1",
    };

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
    });

    if (!response.ok) {
        throw new Error(await readError(response));
    }

    return response.json();
}
