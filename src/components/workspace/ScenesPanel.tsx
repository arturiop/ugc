import { Box, Stack, Typography } from "@mui/material";
import type { Storyboard } from "@/api/storyboard";
import { resolveAssetUrl } from "@/api/urls";
import { useNgrokImageSrc } from "@/hooks/useNgrokImageSrc";

type Props = {
    storyboard: Storyboard;
};

const ScenesPanel = ({ storyboard }: Props) => {
    const storyboardUrl = resolveAssetUrl(storyboard.storyboard_image_url || undefined);
    const { src: storyboardImageSrc } = useNgrokImageSrc(storyboardUrl || undefined);

    if (!storyboard.scenes || storyboard.scenes.length === 0) {
        return null;
    }
    return (
        <Box
            sx={{
                "--scene-ink": "#111111",
                "--scene-ink-soft": "rgba(17,17,17,0.62)",
                "--scene-paper": "#fbf8f2",
                "--scene-border": "rgba(17,17,17,0.12)",
                "--scene-accent": "#f4b247",
                p: { xs: 2.5, md: 3.5 },
                borderRadius: { xs: 3, md: 4 },
                border: "1px solid var(--scene-border)",
                bgcolor: "var(--scene-paper)",
                boxShadow: "0 18px 50px rgba(17,17,17,0.1)",
                fontFamily: "'Public Sans', sans-serif",
            }}
        >
            <Stack spacing={2.5}>
                <Box>
                    <Typography
                        variant="overline"
                        sx={{
                            color: "var(--scene-ink-soft)",
                            letterSpacing: 2,
                            fontWeight: 700,
                        }}
                    >
                        Scenes
                    </Typography>
                    <Typography
                        variant="h5"
                        sx={{
                            color: "var(--scene-ink)",
                            fontWeight: 700,
                            fontFamily: "'Space Grotesk', 'Public Sans', sans-serif",
                        }}
                    >
                        Storyboard scene list
                    </Typography>
                </Box>

                {storyboardUrl ? (
                    <Box
                        sx={{
                            borderRadius: 3,
                            border: "1px solid var(--scene-border)",
                            bgcolor: "rgba(255,255,255,0.92)",
                            p: { xs: 1.5, md: 2 },
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                display: "block",
                                mb: 1,
                                letterSpacing: 1.4,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                color: "var(--scene-ink-soft)",
                            }}
                        >
                            Storyboard preview
                        </Typography>
                        <Box
                            component="img"
                            src={storyboardImageSrc || storyboardUrl}
                            alt="Storyboard preview"
                            sx={{
                                width: "100%",
                                maxHeight: 520,
                                objectFit: "contain",
                                borderRadius: 2,
                                border: "1px solid var(--scene-border)",
                                bgcolor: "#f5f2eb",
                                display: "block",
                            }}
                        />
                    </Box>
                ) : null}

                <Stack spacing={2}>
                    {storyboard.scenes.map((scene) => (
                        <Box
                            key={`${scene.scene_index}-${scene.title}`}
                            sx={{
                                p: { xs: 2, md: 2.5 },
                                borderRadius: 3,
                                border: "1px solid var(--scene-border)",
                                bgcolor: "rgba(255,255,255,0.78)",
                            }}
                        >
                            <Stack spacing={1.5}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1.5,
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            minWidth: 36,
                                            height: 36,
                                            borderRadius: 999,
                                            bgcolor: "var(--scene-accent)",
                                            color: "#1b1305",
                                            display: "grid",
                                            placeItems: "center",
                                            fontWeight: 700,
                                            fontSize: 14,
                                        }}
                                    >
                                        {scene.scene_index}
                                    </Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "var(--scene-ink)" }}>
                                        {scene.title || `Scene ${scene.scene_index}`}
                                    </Typography>
                                </Box>

                                {scene.objective && (
                                    <Typography variant="body2" sx={{ color: "var(--scene-ink-soft)" }}>
                                        <strong>Objective:</strong> {scene.objective}
                                    </Typography>
                                )}
                                {scene.description && (
                                    <Typography variant="body2" sx={{ color: "var(--scene-ink)" }}>
                                        {scene.description}
                                    </Typography>
                                )}
                                {scene.script && (
                                    <Typography variant="body2" sx={{ color: "var(--scene-ink-soft)" }}>
                                        <strong>Script:</strong> {scene.script}
                                    </Typography>
                                )}
                                {scene.visual_prompt && (
                                    <Typography variant="body2" sx={{ color: "var(--scene-ink-soft)" }}>
                                        <strong>Visual prompt:</strong> {scene.visual_prompt}
                                    </Typography>
                                )}
                                {scene.frame_prompt && (
                                    <Box
                                        sx={{
                                            mt: 0.5,
                                            p: 1.5,
                                            borderRadius: 2,
                                            bgcolor: "rgba(17,17,17,0.05)",
                                            border: "1px dashed rgba(17,17,17,0.2)",
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: "var(--scene-ink-soft)",
                                                letterSpacing: 1,
                                                fontWeight: 700,
                                                textTransform: "uppercase",
                                                display: "block",
                                                mb: 0.5,
                                            }}
                                        >
                                            Frame prompt
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: "var(--scene-ink)" }}>
                                            {scene.frame_prompt}
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>
                        </Box>
                    ))}
                </Stack>
            </Stack>
        </Box>
    );
};

export default ScenesPanel;
