import { AuiIf, ErrorPrimitive, MessagePrimitive, ThreadPrimitive, useAuiState } from "@assistant-ui/react";
import { Box, CircularProgress, Link, Paper, Stack, Typography } from "@mui/material";
import { Bot, FileText } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useGeneratedContent } from "@/contexts/GeneratedContentContext";

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
                        <MessagePrimitive.Parts />

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
    const imageUrl = useMemo(() => {
        if (!attachment) return null;
        const imagePart = attachment.content?.find((part) => part.type === "image");
        return imagePart && "image" in imagePart ? imagePart.image : null;
    }, [attachment]);

    if (!imageUrl) return null;

    return (
        <Box
            sx={{
                mb: 1,
                borderRadius: 2,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
            }}>
            <Box
                component="img"
                src={imageUrl}
                alt={attachment?.name || "uploaded image"}
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

function MessageFileAttachment() {
    const attachment = useAuiState((s) => s.attachment);
    if (!attachment) return null;

    const filePart = attachment.content?.find((part) => part.type === "file");
    const fileUrl = filePart && "data" in filePart ? filePart.data : null;
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
