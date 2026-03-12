import type { AttachmentAdapter, PendingAttachment, CompleteAttachment } from "@assistant-ui/react";

type UploadAttachmentAdapterOptions = {
    apiBaseUrl: string;
    projectId: string;
    sessionId: string;
};

type UploadResponse = {
    url?: string;
    filename?: string;
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
}: UploadAttachmentAdapterOptions): AttachmentAdapter => ({
    accept: "image/*",
    async add({ file }): Promise<PendingAttachment> {
        return {
            id: crypto.randomUUID(),
            type: "image",
            name: file.name,
            contentType: file.type,
            file,
            status: { type: "requires-action", reason: "composer-send" },
        };
    },
    async send(attachment: PendingAttachment): Promise<CompleteAttachment> {
        const form = new FormData();
        form.append("file", attachment.file);
        form.append("projectId", projectId);
        form.append("sessionId", sessionId);

        const response = await fetch(`${apiBaseUrl}/api/v1/upload`, {
            method: "POST",
            headers: { "X-Session-Id": sessionId,
                "ngrok-skip-browser-warning": "1",

             },
            body: form,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to upload image.");
        }

        const payload = (await response.json()) as UploadResponse;
        const url = payload.url ? resolveUploadUrl(apiBaseUrl, payload.url) : "";
        if (!url) {
            throw new Error("Upload response missing url.");
        }

        return {
            ...attachment,
            status: { type: "complete" },
            content: [
                {
                    type: "image",
                    image: url,
                    filename: attachment.name,
                },
            ],
        };
    },
    async remove() {
        // no-op for now
    },
});
