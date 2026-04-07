import { useEffect, useMemo, useRef, useState } from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { AssistantChatTransport, useChatRuntime } from "@assistant-ui/react-ai-sdk";

import { Box, CircularProgress, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";

import { ProjectChatThread } from "./Thread";
import { createUploadAttachmentAdapter } from "./uploadAttachmentAdapter";
import { ProjectType } from "@/api/projects";
import { useProject } from "@/contexts/Project/ProjectContext";
import { getProjectChatTransportConfig, HistoryMessage } from "@/api/chat";
import { useProjectChatHistory } from "@/api/chat/hooks";
import { queryKeys } from "@/api/queryKeys";

type NormalizedMessage = {
    id?: string;
    role: "user" | "assistant";
    parts: HistoryMessage["parts"];
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
  

  
function ProjectChat2({ projectId, m }: { projectId: string; m: any[] }) {
    const queryClient = useQueryClient();
    const { projectType } = useProject();
    const runtimeRef = useRef<ReturnType<typeof useChatRuntime> | null>(null);
    const isSatisfactionVideo = projectType === ProjectType.SatisfactionVideo;
    const transport = useMemo(() => {
        const config = getProjectChatTransportConfig(projectId);
        return new AssistantChatTransport(config);
    }, [projectId]);

    const attachmentAdapter = useMemo(
        () =>
            createUploadAttachmentAdapter({
                apiBaseUrl: import.meta.env.VITE_APP_API_BASE,
                projectId,
                onUploadComplete: (asset) => {
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
                        justifyContent: "center",
                        px: { xs: 2, md: 3 },
                        bgcolor: "background.paper",
                        "--thread-max-width": isSatisfactionVideo ? "960px" : "100%",
                        "--accent-color": (theme: any) => theme.palette.primary.main,
                        "--accent-foreground": (theme: any) => theme.palette.primary.contrastText,
                    } as any
                }>
                <Box
                    sx={{
                        height: "100%",
                        minHeight: 0,
                        width: "100%",
                        maxWidth: isSatisfactionVideo ? "960px" : "100%",
                        mx: "auto",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <ProjectChatThread />
                </Box>
            </Box>
        </AssistantRuntimeProvider>
    );
}

export function ProjectChat() {
    const { projectId } = useProject();
    const { data, isLoading, error, isFetching } = useProjectChatHistory(projectId);
    const [initialMessages, setInitialMessages] = useState<NormalizedMessage[] | null>(null);

    useEffect(() => {
        setInitialMessages(null);
    }, [projectId]);

    useEffect(() => {
        if (initialMessages === null && data) {
            setInitialMessages(normalizeHistory(data.messages || []));
        }
    }, [data, initialMessages]);

    console.log("data, isLoading, error, isFetching", data, isLoading, error, isFetching);
    return (
        <Box sx={{ height: "100%", minHeight: 0, width: "100%", display: "flex", flexDirection: "column", bgcolor: "background.paper" }}>
            {(isLoading || !data || initialMessages === null) ? (
                <Box sx={{ flex: 1, display: "grid", placeItems: "center" }}>
                    <CircularProgress size={18} />
                </Box>
            ) : (
                <>
                    <ProjectChat2 projectId={projectId} m={initialMessages} />
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
