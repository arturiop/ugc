import { useState, type ReactNode } from "react";
import { Box, Fade, Modal, type SxProps, type Theme } from "@mui/material";

type ChatImagePreviewProps = {
    src: string;
    alt: string;
    pendingOverlay?: ReactNode;
    imageSx?: SxProps<Theme>;
};

export default function ChatImagePreview({ src, alt, pendingOverlay, imageSx }: ChatImagePreviewProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Box
                component="button"
                type="button"
                onClick={() => setOpen(true)}
                sx={{
                    position: "relative",
                    display: "block",
                    width: "100%",
                    maxWidth: 420,
                    p: 0,
                    border: 0,
                    borderRadius: 3,
                    overflow: "hidden",
                    bgcolor: "transparent",
                    cursor: "zoom-in",
                    textAlign: "inherit",
                    WebkitTapHighlightColor: "transparent",
                    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.12)",
                }}
            >
                <Box
                    component="img"
                    src={src}
                    alt={alt}
                    sx={{
                        display: "block",
                        width: "100%",
                        maxHeight: 320,
                        objectFit: "cover",
                        bgcolor: "background.default",
                        ...imageSx,
                    }}
                />
                {pendingOverlay}
            </Box>

            <Modal
                open={open}
                onClose={() => setOpen(false)}
                closeAfterTransition
                slotProps={{
                    backdrop: {
                        sx: {
                            bgcolor: "rgba(8, 10, 18, 0.58)",
                            backdropFilter: "blur(6px)",
                        },
                    },
                }}
            >
                <Fade in={open} timeout={180}>
                    <Box
                        onClick={() => setOpen(false)}
                        sx={{
                            width: "100%",
                            height: "100%",
                            p: { xs: 1.5, sm: 3 },
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Box
                            sx={{
                                position: "relative",
                                width: "min(100%, 760px)",
                                maxHeight: "100%",
                                borderRadius: { xs: 3.5 },
                                overflow: "hidden",
                                border: "1px solid rgba(255,255,255,0.12)",
                                bgcolor: "rgba(255, 255, 255, 0.06)",
                                boxShadow: "0 24px 64px rgba(0, 0, 0, 0.24)",
                                p: { xs: 0.5, sm: 0.75 },
                            }}
                            onClick={(event) => event.stopPropagation()}
                        >
                            <Box
                                component="img"
                                src={src}
                                alt={alt}
                                sx={{
                                    display: "block",
                                    width: "100%",
                                    maxHeight: "calc(100dvh - 48px)",
                                    minHeight: { xs: 240, sm: 320 },
                                    objectFit: "contain",
                                    borderRadius: { xs: 3, sm: 4 },
                                    bgcolor: "rgba(255,255,255,0.02)",
                                    userSelect: "none",
                                    WebkitUserDrag: "none",
                                }}
                            />
                        </Box>
                    </Box>
                </Fade>
            </Modal>
        </>
    );
}
