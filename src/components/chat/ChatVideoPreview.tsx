import { Box } from "@mui/material";

type ChatVideoPreviewProps = {
    src: string;
};

export default function ChatVideoPreview({ src }: ChatVideoPreviewProps) {
    return (
        <Box
            sx={{
                display: "inline-block",
                width: "auto",
                maxWidth: "100%",
                borderRadius: 3,
                overflow: "hidden",
                bgcolor: "#05070b",
                boxShadow: "0 18px 40px rgba(15, 23, 42, 0.12)",
            }}
        >
            <Box
                component="video"
                src={src}
                controls
                playsInline
                preload="metadata"
                sx={{
                    display: "block",
                    width: "auto",
                    maxWidth: "100%",
                    height: "auto",
                    maxHeight: 820,
                    objectFit: "contain",
                    bgcolor: "background.default",
                }}
            />
        </Box>
    );
}
