import { AuiIf, ComposerPrimitive, useAui, useAuiState } from "@assistant-ui/react";
import { Box, IconButton, Paper, Stack, Tooltip } from "@mui/material";
import { ArrowUp, ImagePlus, Square, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export function ProjectChatComposer() {
    return (
        <ComposerPrimitive.Root>
            <Paper
                variant="outlined"
                sx={{
                    borderRadius: 3,
                    p: 1,
                    mt: 1,
                    overflow: "hidden",
                }}>
                <Stack spacing={1}>
                    <ComposerPrimitive.Attachments
                        components={{
                            Image: ComposerImageAttachment,
                        }}
                    />
                    <ComposerPrimitive.Input
                        placeholder="Send a message..."
                        className="w-full resize-none bg-transparent outline-none"
                        style={{
                            border: "none",
                            width: "100%",
                            padding: "10px 12px",
                            fontSize: 14,
                        }}
                        rows={1}
                    />

                    <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ px: 1, pb: 0.5 }}>
                        <ComposerPrimitive.AddAttachment asChild multiple={false}>
                            <Tooltip title="Add image">
                                <IconButton size="small" sx={{ mr: 1 }}>
                                    <ImagePlus size={16} />
                                </IconButton>
                            </Tooltip>
                        </ComposerPrimitive.AddAttachment>

                        <AuiIf condition={(s) => !s.thread.isRunning}>
                            <ComposerPrimitive.Send asChild>
                                <Tooltip title="Send">
                                    <IconButton
                                        size="small"
                                        sx={{
                                            bgcolor: "var(--accent-color)",
                                            color: "var(--accent-foreground)",
                                            "&:hover": { bgcolor: "var(--accent-color)" },
                                        }}>
                                        <ArrowUp size={16} />
                                    </IconButton>
                                </Tooltip>
                            </ComposerPrimitive.Send>
                        </AuiIf>

                        <AuiIf condition={(s) => s.thread.isRunning}>
                            <ComposerPrimitive.Cancel asChild>
                                <Tooltip title="Stop">
                                    <IconButton
                                        size="small"
                                        sx={{
                                            bgcolor: "var(--accent-color)",
                                            color: "var(--accent-foreground)",
                                            "&:hover": { bgcolor: "var(--accent-color)" },
                                        }}>
                                        <Square size={16} />
                                    </IconButton>
                                </Tooltip>
                            </ComposerPrimitive.Cancel>
                        </AuiIf>
                    </Stack>
                </Stack>
            </Paper>
        </ComposerPrimitive.Root>
    );
}

function ComposerImageAttachment() {
    const attachment = useAuiState((s) => s.attachment);
    const aui = useAui();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const contentUrl = useMemo(() => {
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

    if (!attachment) return null;
    const src = contentUrl || previewUrl;
    if (!src) return null;

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1,
                pt: 1,
            }}>
            <Box
                component="img"
                src={src}
                alt={attachment.name}
                sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 2,
                    objectFit: "cover",
                    border: "1px solid",
                    borderColor: "divider",
                }}
            />
            <IconButton
                size="small"
                onClick={() => aui.composer().removeAttachment(attachment.id)}
                aria-label="Remove image">
                <X size={14} />
            </IconButton>
        </Box>
    );
}
