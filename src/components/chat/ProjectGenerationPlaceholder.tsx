import { Box } from "@mui/material";
import { useGenerationPlaceholder } from "@/contexts/GenerationPlaceholderContext";
import { LiquidPlaceholder } from "@/components/dashboard/LiquidPlaceholder";

export function ProjectGenerationPlaceholder() {
    const { placeholder } = useGenerationPlaceholder();

    if (!placeholder || placeholder.status !== "running") {
        return null;
    }

    const minHeight = placeholder.media === "video" ? 420 : 280;
    const aspectRatio = placeholder.media === "video" ? "9 / 16" : "4 / 5";

    return (
        <Box
            sx={{
                mt: 1,
                width: "min(100%, 420px)",
                maxWidth: "100%",
                minHeight,
                aspectRatio,
                borderRadius: 3,
                overflow: "hidden",
                bgcolor: "#0d1015",
                boxShadow: "0 18px 40px rgba(15, 23, 42, 0.12)",
            }}
        >
            <LiquidPlaceholder />
        </Box>
    );
}
