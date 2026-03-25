import { AuiIf, ErrorPrimitive, MessagePrimitive, ThreadPrimitive, useAuiState } from "@assistant-ui/react";
import { Box, CircularProgress, Link, Paper, Stack, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { Bot, FileText } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGeneratedContent } from "@/contexts/GeneratedContentContext";
import { useProject } from "@/contexts/Project/ProjectContext";
import { queryKeys } from "@/api/queryKeys";

function MessageDataImages() {
    const message = useAuiState((s) => s.message);
    const { addImages } = useGeneratedContent();
    const imageMessages: any[] = useMemo(() => {

        return (message.parts || []).filter((p) => p?.type === "data" && p.name === "image")
    }, [message]);

    useEffect(() => {
        if (!imageMessages.length) return;
        const urls = imageMessages
            .map((imgM) => imgM?.data?.url)
            .filter((url): url is string => typeof url === "string" && url.length > 0);
        if (urls.length) addImages(urls);
    }, [addImages, imageMessages]);

    if (!imageMessages.length) return null;

    return (
        <Stack spacing={1} sx={{ mb: 1 }}>
            {imageMessages.map((imgM, idx) => (
                <MessageDataImageItem
                    key={`${imgM.data.name}_${idx}`}
                    name={imgM.data.name}
                    url={imgM.data.url || ""}
                />
            ))}
        </Stack>
    );
}

function ActionDataPart({ data }: { data?: { name?: string; action?: string; actions?: string[] } }) {
    const queryClient = useQueryClient();
    const { projectId } = useProject();
    const firedRef = useRef<Set<string>>(new Set());
    const actions = useMemo(() => {
        if (!data) return [];
        if (Array.isArray(data.actions)) return data.actions;
        if (typeof data.name === "string") return [data.name];
        if (typeof data.action === "string") return [data.action];
        return [];
    }, [data]);

    useEffect(() => {
        if (!actions.length || !projectId) return;
        actions.forEach((action) => {
            const key = `${projectId}:${action}`;
            if (firedRef.current.has(key)) return;
            firedRef.current.add(key);
            if (action === "refresh_storyboard") {
                void queryClient.invalidateQueries({ queryKey: queryKeys.projects.storyboard(projectId) });
            }
        });
    }, [actions, projectId, queryClient]);

    return null;
}


export function ProjectChatMessages() {
    return (
        <ThreadPrimitive.Messages
            components={{
                UserMessage,
                AssistantMessage,
            }}
        />
    );
}

function UserMessage() {
    return (
        <MessagePrimitive.Root className="w-full" style={{ padding: "10px 0" }} data-role="user">
            <Stack direction="row" justifyContent="flex-end" sx={{ px: 1, width: "100%" }}>
                <Box sx={{ width: "100%", minWidth: 0, display: "flex", justifyContent: "flex-end" }}>
                    <Paper
                        elevation={0}
                        sx={{
                            bgcolor: "background.neutral",
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 3,
                            px: 2,
                            py: 1.25,
                            overflowWrap: "anywhere",
                            maxWidth: { xs: "100%", sm: "80%" },
                        }}>
                        <MessagePrimitive.Attachments
                            components={{
                                Image: MessageImageAttachment,
                                File: MessageFileAttachment,
                            }}
                        />
                        <MessagePrimitive.Parts />
                    </Paper>
                </Box>
            </Stack>
        </MessagePrimitive.Root>
    );
}

function AssistantMessage() {
    return (
        <MessagePrimitive.Root className="w-full" style={{ padding: "10px 0" }} data-role="assistant">
            <Stack direction="row" spacing={1.5} sx={{ px: 1, width: "100%" }}>
                <Box
                    sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "999px",
                        bgcolor: "secondary.main",
                        color: "secondary.contrastText",
                        display: "grid",
                        placeItems: "center",
                        flex: "0 0 auto",
                        opacity: 0.9,
                    }}>
                    <Bot size={16} />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            bgcolor: "background.paper",
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 3,
                            px: 2,
                            py: 1.5,
                            overflowWrap: "anywhere",
                        }}>
                        <MessageDataImages />
                        <MessagePrimitive.Parts components={{ data: { by_name: { action: ActionDataPart } } }} />

                        <MessagePrimitive.Error>
                            <ErrorPrimitive.Root
                                className="mt-2"
                                style={{
                                    border: "1px solid rgba(244,67,54,0.4)",
                                    background: "rgba(244,67,54,0.08)",
                                    borderRadius: 12,
                                    padding: 10,
                                }}>
                                <ErrorPrimitive.Message />
                            </ErrorPrimitive.Root>
                        </MessagePrimitive.Error>

                        <AuiIf condition={(s) => s.thread.isRunning && s.message.isLast}>
                            <ThinkingRow />
                        </AuiIf>
                    </Paper>
                </Box>
            </Stack>
        </MessagePrimitive.Root>
    );
}

function ThinkingRow() {
    return (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1, color: "text.secondary" }}>
            <CircularProgress size={14} />
            <Typography variant="caption">Thinking…</Typography>
        </Stack>
    );
}

function MessageImageAttachment() {
    const attachment = useAuiState((s) => s.attachment);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const imageUrl = useMemo(() => {
        if (!attachment) return null;
        const imagePart = attachment.content?.find((part) => part.type === "image");
        return imagePart && "image" in imagePart ? imagePart.image : null;
    }, [attachment]);

    useEffect(() => {
        if (!attachment?.file) {
            setPreviewUrl(null);
            return;
        }
        const next = URL.createObjectURL(attachment.file);
        setPreviewUrl(next);
        return () => URL.revokeObjectURL(next);
    }, [attachment?.file]);

    const src = imageUrl || previewUrl;
    if (!src) return null;
    const isPending = attachment?.status?.type !== "complete";

    return (
        <Box
            sx={{
                mb: 1,
                borderRadius: 2,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                position: "relative",
                isolation: "isolate",
                "&:hover .attachment-image": {
                    transform: "scale(1.02)",
                },
                "&:hover .attachment-backdrop": {
                    opacity: 0.7,
                },
            }}>
            <Box
                className="attachment-backdrop"
                aria-hidden="true"
                sx={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 0,
                    opacity: 0,
                    transition: "opacity 0.2s ease",
                    backgroundImage: `url(${src})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "blur(10px)",
                    transform: "scale(1.06)",
                }}
            />
            <Box
                component="img"
                src={src}
                alt={attachment?.name || "uploaded image"}
                className="attachment-image"
                sx={{
                    position: "relative",
                    zIndex: 1,
                    display: "block",
                    width: "100%",
                    height: "auto",
                    maxHeight: 280,
                    objectFit: "cover",
                    filter: isPending ? "grayscale(0.1)" : "none",
                    opacity: isPending ? 0.7 : 1,
                    transition: "transform 0.2s ease",
                }}
            />
            {isPending && (
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                        bgcolor: "rgba(0, 0, 0, 0.35)",
                        color: "common.white",
                    }}
                >
                    <CircularProgress size={16} color="inherit" />
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        Uploading…
                    </Typography>
                </Box>
            )}
        </Box>
    );
}

function MessageFileAttachment() {
    const attachment = useAuiState((s) => s.attachment);
    if (!attachment) return null;

    const filePart = attachment.content?.find((part) => part.type === "file");
    const fileUrl = filePart && "data" in filePart ? filePart.data : null;
    const isPending = attachment?.status?.type !== "complete";
    return (
        <Box
            sx={{
                mb: 1,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                p: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
            }}>
            <Box
                sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "background.paper",
                }}>
                <FileText size={16} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                    {attachment.name}
                </Typography>
                {fileUrl ? (
                    <Link href={fileUrl} target="_blank" rel="noreferrer" variant="caption">
                        Open file
                    </Link>
                ) : isPending ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                        <CircularProgress size={12} />
                        <Typography variant="caption" color="text.secondary">
                            Uploading…
                        </Typography>
                    </Stack>
                ) : (
                    <Typography variant="caption" color="text.secondary">
                        File uploaded
                    </Typography>
                )}
            </Box>
        </Box>
    );
}

function MessageDataImageItem({ name, url }: { name: string; url: string }) {
    return (
        <Box
            sx={{
                borderRadius: 2,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
            }}>
            <Box
                component="img"
                src={url}
                alt={name}
                sx={{
                    display: "block",
                    width: "100%",
                    height: "auto",
                    maxHeight: 280,
                    objectFit: "cover",
                }}
            />
        </Box>
    );
}
