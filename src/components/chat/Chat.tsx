import { useEffect, useMemo, useState } from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { AssistantChatTransport, useChatRuntime } from "@assistant-ui/react-ai-sdk";

import { Box, CircularProgress, Typography } from "@mui/material";

import { ProjectChatThread } from "./Thread";
import { getSessionId } from "@/utils/session";
import { createUploadAttachmentAdapter } from "./uploadAttachmentAdapter";
import { useProject } from "@/contexts/project/ProjectContext";

const API_BASE_URL = import.meta.env.VITE_APP_NGROK || "http://localhost:5050";
const CHAT_ENDPOINT = "/api/v1/projects/chat"; // we'll implement server later

type HistoryMessage = {
    id?: string;
    role: "user" | "assistant";
    content?: string;
    parts?: Array<{ type: "text"; text: string } | { type: "file"; url: string; mediaType: string; filename?: string }>;
    createdAt?: string;
};

function normalizeHistory(messages: HistoryMessage[]) {
    return messages
        .filter((m) => m && (m.role === "user" || m.role === "assistant"))
        .map((m, idx) => {
            const content = m.content || "";
            const parts = Array.isArray(m.parts) && m.parts.length > 0 ? m.parts : [{ type: "text" as const, text: content }];
            return {
                id: m.id || `history-${idx}`,
                role: m.role,
                parts,
            };
        });
}

function ProjectChat2({ projectId, m, sessionId }: { projectId: string; m: any[]; sessionId: any }) {
    const transport = useMemo(() => {
        return new AssistantChatTransport({
            api: `${API_BASE_URL}${CHAT_ENDPOINT}`,
            headers: { "X-Session-Id": sessionId },
            body: { projectId },
        });
    }, [projectId, sessionId]);

    const attachmentAdapter = useMemo(
        () =>
            createUploadAttachmentAdapter({
                apiBaseUrl: API_BASE_URL,
                projectId,
                sessionId,
            }),
        [projectId, sessionId]
    );

    const runtime = useChatRuntime({
        transport,
        messages: m ?? undefined,
        adapters: { attachments: attachmentAdapter },
    });

    return (
        <AssistantRuntimeProvider runtime={runtime}>
            <Box
                sx={
                    {
                        height: "100%",
                        minHeight: 0,
                        flex: 1,
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        bgcolor: "background.default",
                        "--thread-max-width": "100%",
                        "--accent-color": "#10a37f",
                        "--accent-foreground": "#ffffff",
                    } as any
                }>
                <ProjectChatThread />
            </Box>
        </AssistantRuntimeProvider>
    );
}

export function ProjectChat() {
    const [initialMessages, setInitialMessages] = useState(null);
    const [historyError, setHistoryError] = useState<string | null>(null);
    const sessionId = getSessionId();
    const { projectId } = useProject();

    useEffect(() => {
        setHistoryError(null);

        const loadHistory = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/v1/projects/chat_history/${projectId}`, {
                    headers: {
                        "X-Session-Id": sessionId,
                        "ngrok-skip-browser-warning": "1",
                    },
                });

                const data = await response.json()
                console.log('data', data);
                const normalized = Array.isArray(data?.messages) ? normalizeHistory(data.messages) : [];
                setInitialMessages(normalized || []);
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") return;
                console.log('error', error, `${API_BASE_URL}/api/v1/projects/chat_history/${projectId}`)
                setHistoryError("Failed to load chat history.");
                setInitialMessages([]);
            }
        };

        if(projectId && sessionId) {
            loadHistory();
        }
    }, [projectId, sessionId]);

    return (
        <Box sx={{ height: "100%", minHeight: 0, width: "100%", display: "flex", flexDirection: "column" }}>
            {initialMessages === null ? (
                <Box sx={{ flex: 1, display: "grid", placeItems: "center" }}>
                    <CircularProgress size={18} />
                </Box>
            ) : (
                <>
                    <ProjectChat2 sessionId={sessionId} projectId={projectId} m={initialMessages} />
                    {historyError && (
                        <Box sx={{ px: 2, pt: 1 }}>
                            <Typography variant="caption" color="error">
                                {historyError}
                            </Typography>
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
}
