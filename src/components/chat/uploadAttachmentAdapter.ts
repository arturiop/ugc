import type { AttachmentAdapter, PendingAttachment, CompleteAttachment } from "@assistant-ui/react";
import { getDefaultHeaders } from "@/api/httpClient";

type UploadAttachmentAdapterOptions = {
    apiBaseUrl: string;
    projectId: string;
    sessionId: string;
    onUploadComplete?: (asset: UploadAsset) => void;
};

type UploadAsset = {
    id: number;
    url: string;
    filename: string;
    label: "product" | "logo" | "brandbook" | "reference";
    createdAt: string;
    updatedAt: string;
};

type UploadResponse = {
    asset?: UploadAsset;
};

const resolveUploadUrl = (apiBaseUrl: string, url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${apiBaseUrl}${url}`;
};

export const createUploadAttachmentAdapter = ({
    apiBaseUrl,
    projectId,
    sessionId,
    onUploadComplete,
}: UploadAttachmentAdapterOptions): AttachmentAdapter => ({
    accept: "*/*",
    async add({ file }): Promise<PendingAttachment> {
        const isImage = file.type.startsWith("image/");
        return {
            id: crypto.randomUUID(),
            type: isImage ? "image" : "file",
            name: file.name,
            contentType: file.type,
            file,
            status: { type: "requires-action", reason: "composer-send" },
        };
    },
    async send(attachment: PendingAttachment): Promise<CompleteAttachment> {
        const form = new FormData();
        form.append("file", attachment.file);

        const response = await fetch(`${apiBaseUrl}/api/v1/projects/${projectId}/assets/upload`, {
            method: "POST",
            headers: getDefaultHeaders(sessionId),
            body: form,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to upload image.");
        }

        const payload = (await response.json()) as UploadResponse;
        const asset = payload.asset;
        const url = asset?.url ? resolveUploadUrl(apiBaseUrl, asset.url) : "";
        if (!asset || !url) {
            throw new Error("Upload response missing asset data.");
        }

        onUploadComplete?.({ ...asset, url });

        return {
            ...attachment,
            status: { type: "complete" },
            content: [
                attachment.type === "image"
                    ? {
                        type: "image",
                        image: url,
                        filename: attachment.name,
                    }
                    : {
                        type: "file",
                        data: url,
                        mimeType: attachment.contentType || "application/octet-stream",
                        filename: attachment.name,
                    },
            ],
        };
    },
    async remove() {
        // no-op for now
    },
});
