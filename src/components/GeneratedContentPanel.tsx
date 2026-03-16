import { Box, Stack, Typography } from "@mui/material";
import { useGeneratedContent } from "@/contexts/GeneratedContentContext";

function GeneratedImageItem({ url, title }: { url: string; title: string }) {
    return (
        <Box
            component="img"
            src={url}
            alt={title}
            sx={{
                width: "100%",
                height: 220,
                objectFit: "contain",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                display: "block",
            }}
        />
    );
}

const GeneratedContentPanel = () => {
    const { images } = useGeneratedContent();

    if (!images.length) {
        return (
            <Stack spacing={1} sx={{ color: "text.secondary" }}>
                <Typography variant="h6" fontWeight={700}>
                    No generated content yet
                </Typography>
                <Typography variant="body2">
                    Ask the assistant to generate visuals and they will show up here.
                </Typography>
            </Stack>
        );
    }

    return (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
            {images.map((item) => (
                <GeneratedImageItem key={item.id} url={item.url} title={item.title} />
            ))}
        </Box>
    );
};

export default GeneratedContentPanel;
