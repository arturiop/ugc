import { AuiIf, ComposerPrimitive, useAuiState } from "@assistant-ui/react";
import { Box, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material";
import { ArrowUp, FileText, ImagePlus, Square } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export function ProjectChatComposer() {
    return (
        <ComposerPrimitive.Root className="w-full">
            <Paper
                variant="outlined"
                sx={{
                    borderRadius: 3,
                    p: 1,
                    mt: 1,
                    overflow: "hidden",
                    width: "100%",
                    bgcolor: "background.paper",
                    borderColor: "divider",
                    boxShadow: "0 10px 26px rgba(11, 13, 18, 0.08)",
                    "&:focus-within": {
                        borderColor: "secondary.main",
                        boxShadow: "0 0 0 1px rgba(91, 97, 255, 0.4), 0 12px 28px rgba(11, 13, 18, 0.12)",
                    },
                }}>
                <Stack spacing={1}>
                    <ComposerPrimitive.Attachments
                        components={{
                            Image: ComposerImageAttachment,
                            File: ComposerFileAttachment,
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
            {/* <IconButton
                size="small"
                onClick={() => aui.composer().clearAttachments(attachment.id)}
                aria-label="Remove image">
                <X size={14} />
            </IconButton> */}
        </Box>
    );
}

function ComposerFileAttachment() {
    const attachment = useAuiState((s) => s.attachment);

    if (!attachment) return null;

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
                sx={{
                    width: 44,
                    height: 44,
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
                <Typography variant="caption" color="text.secondary">
                    File ready to upload
                </Typography>
            </Box>
        </Box>
    );
}
