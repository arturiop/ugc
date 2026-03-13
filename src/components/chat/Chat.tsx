import { useEffect, useMemo, useRef } from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { AssistantChatTransport, useChatRuntime } from "@assistant-ui/react-ai-sdk";

import { Box, CircularProgress, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";

import { ProjectChatThread } from "./Thread";
import { createUploadAttachmentAdapter } from "./uploadAttachmentAdapter";
import { useProject } from "@/contexts/project/ProjectContext";
import { API_BASE_URL } from "@/api/httpClient";
import { getProjectChatTransportConfig, HistoryMessage } from "@/api/chat";
import { useProjectChatHistory } from "@/api/chat/hooks";
import { queryKeys } from "@/api/queryKeys";

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
  

  
function ProjectChat2({ projectId, m }: { projectId: string; m: any[] }) {
    const queryClient = useQueryClient();
    const runtimeRef = useRef<ReturnType<typeof useChatRuntime> | null>(null);
    const transport = useMemo(() => {
        const config = getProjectChatTransportConfig(projectId);
        return new AssistantChatTransport(config);
    }, [projectId]);

    const attachmentAdapter = useMemo(
        () =>
            createUploadAttachmentAdapter({
                apiBaseUrl: API_BASE_URL,
                projectId,
                onUploadComplete: (asset) => {
                    runtimeRef.current?.thread.append({
                        role: "assistant",
                        content: [
                            {
                                type: "text",
                                text: `Saved "${asset.filename}" to Assets (${formatAssetLabel(asset.label)}).`,
                            },
                        ],
                    });
                    queryClient.invalidateQueries({ queryKey: queryKeys.projects.assets(projectId) });
                },
            }),
        [projectId, queryClient]
    );

    const runtime = useChatRuntime({
        transport,
        messages: m ?? undefined,
        adapters: { attachments: attachmentAdapter },
    });

    useEffect(() => {
        runtimeRef.current = runtime;
    }, [runtime]);

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

const formatAssetLabel = (label: string) => {
    switch (label) {
        case "product":
            return "Product";
        case "logo":
            return "Logo";
        case "brandbook":
            return "Brandbook";
        case "reference":
            return "Reference";
        default:
            return "Asset";
    }
};

export function ProjectChat() {
    const { projectId } = useProject();
    const { data, isLoading, error, isFetching } = useProjectChatHistory(projectId);
    console.log('data, isLoading, error, isFetching', data, isLoading, error, isFetching)
    return (
        <Box sx={{ height: "100%", minHeight: 0, width: "100%", display: "flex", flexDirection: "column" }}>
            {(isLoading || !data) ? (
                <Box sx={{ flex: 1, display: "grid", placeItems: "center" }}>
                    <CircularProgress size={18} />
                </Box>
            ) : (
                <>
                    <ProjectChat2 projectId={projectId} m={data?.messages || []} />
                    {error && (
                        <Box sx={{ px: 2, pt: 1 }}>
                            <Typography variant="caption" color="error">
                                Failed to load chat history.
                            </Typography>
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
}
