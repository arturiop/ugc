import { requestJson } from "@/api/httpClient";

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
        path: `/api/v1/projects/${projectId}/assets`,
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
        path: `/api/v1/projects/${projectId}/assets/${assetId}`,
        method: "PATCH",
        body: { label },
        signal,
    });
}

export async function deleteProjectAsset(projectId: string, assetId: number, signal?: AbortSignal) {
    return requestJson<void>({
        path: `/api/v1/projects/${projectId}/assets/${assetId}`,
        method: "DELETE",
        signal,
    });
}
