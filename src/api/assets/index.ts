import { buildUrl, getDefaultHeaders, requestJson } from "@/api/httpClient";

export type AssetLabel = "product" | "logo" | "brandbook" | "reference";

export type AssetItem = {
    id: number;
    url: string;
    filename: string;
    label: AssetLabel;
    contentType?: string | null;
    sizeBytes?: number | null;
    createdAt: string;
    updatedAt: string;
};

export type AssetListResponse = {
    items?: AssetItem[];
};

export async function listProjectAssets(projectId: string, signal?: AbortSignal) {
    return requestJson<AssetListResponse>({
        path: `/api/projects/${projectId}/assets`,
        signal,
    });
}

export async function updateProjectAssetLabel(
    projectId: string,
    assetId: number,
    label: AssetLabel,
    signal?: AbortSignal
) {
    return requestJson<AssetItem>({
        path: `/api/projects/${projectId}/assets/${assetId}`,
        method: "PATCH",
        body: { label },
        signal,
    });
}

export async function deleteProjectAsset(projectId: string, assetId: number, signal?: AbortSignal) {
    return requestJson<void>({
        path: `/api/projects/${projectId}/assets/${assetId}`,
        method: "DELETE",
        signal,
    });
}

export async function uploadProjectAsset(projectId: string, file: File, label: AssetLabel = "product") {
    const form = new FormData();
    form.append("file", file);
    form.append("label", label);

    const response = await fetch(buildUrl(`/api/projects/${projectId}/assets/upload`), {
        method: "POST",
        headers: getDefaultHeaders(),
        body: form,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to upload asset.");
    }

    const payload = (await response.json()) as { asset: AssetItem };
    if (!payload.asset) {
        throw new Error("Upload response missing asset data.");
    }

    return payload.asset;
}
