import { requestJson } from "@/api/httpClient";

export type GlobalSettingItem = {
    key: string;
    value: unknown | null;
    description?: string | null;
    created_at: string;
    updated_at: string;
};

export type GlobalSettingListResponse = {
    items: GlobalSettingItem[];
};

export type GlobalSettingUpsertRequest = {
    value: unknown | null;
    description?: string | null;
};

export async function listGlobalSettings(signal?: AbortSignal) {
    return requestJson<GlobalSettingListResponse>({
        path: "/api/v1/settings",
        signal,
    });
}

export async function upsertGlobalSetting(
    key: string,
    payload: GlobalSettingUpsertRequest,
    signal?: AbortSignal
) {
    return requestJson<GlobalSettingItem>({
        path: `/api/v1/settings/${encodeURIComponent(key)}`,
        method: "PUT",
        body: payload,
        signal,
    });
}

export async function deleteGlobalSetting(key: string, signal?: AbortSignal) {
    return requestJson<GlobalSettingItem>({
        path: `/api/v1/settings/${encodeURIComponent(key)}`,
        method: "DELETE",
        signal,
    });
}
