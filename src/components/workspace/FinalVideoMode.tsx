import { Box, Button, Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import type { Storyboard } from "@/api/storyboard";

type FinalVideoModeProps = {
    storyboard: Storyboard | null;
};

const FinalVideoMode = ({ storyboard }: FinalVideoModeProps) => {
    if (!storyboard) {
        return (
            <Box sx={{ p: { xs: 2.5, md: 4 }, height: "100%", overflowY: "auto" }}>
                <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight={700}>
                            No final video yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Finish generating and approving scenes to move toward a final cut.
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    const approvedScenes = storyboard.scenes.filter((scene) => scene.video_status === "approved");
    const heroScene = approvedScenes.find((scene) => scene.generated_video_url) ?? approvedScenes[0] ?? null;

    return (
        <Box sx={{ p: { xs: 2.5, md: 4 }, height: "100%", overflowY: "auto" }}>
            <Stack spacing={2.5} sx={{ maxWidth: 960, mx: "auto" }}>
                <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
                    <CardContent>
                        <Typography variant="overline" sx={{ letterSpacing: 1.5, fontWeight: 700, color: "text.secondary" }}>
                            Final assembly
                        </Typography>
                        <Typography variant="h6" fontWeight={700}>
                            {storyboard.title || "Final Video"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Approved scenes: {approvedScenes.length} / {storyboard.scenes.length}
                        </Typography>
                    </CardContent>
                </Card>

                <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
                    <Box sx={{ bgcolor: "background.default", minHeight: 280, display: "grid", placeItems: "center" }}>
                        {heroScene?.generated_video_url ? (
                            <Box
                                component="video"
                                src={heroScene.generated_video_url}
                                controls
                                sx={{ width: "100%", height: "100%", maxHeight: 360, objectFit: "cover" }}
                            />
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                No approved video preview yet
                            </Typography>
                        )}
                    </Box>
                    <CardContent>
                        <Stack spacing={1}>
                            <Typography variant="subtitle2" fontWeight={700}>
                                Export
                            </Typography>
                            <Divider />
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<DownloadRoundedIcon />}
                                    disabled={approvedScenes.length === 0}
                                >
                                    Download
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<LaunchRoundedIcon />}
                                    disabled={approvedScenes.length === 0}
                                >
                                    Publish
                                </Button>
                                <Typography variant="caption" color="text.secondary">
                                    Approve all scenes to unlock final export options.
                                </Typography>
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>

                {approvedScenes.length > 0 && (
                    <Stack spacing={2}>
                        {approvedScenes.map((scene) => (
                            <Card
                                key={scene.scene_index}
                                elevation={0}
                                sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}
                            >
                                <CardContent>
                                    <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                                        Scene {scene.scene_index + 1}: {scene.title}
                                    </Typography>
                                    {scene.generated_video_url ? (
                                        <Box
                                            component="video"
                                            src={scene.generated_video_url}
                                            controls
                                            sx={{
                                                width: "100%",
                                                maxHeight: 260,
                                                borderRadius: 2,
                                                border: "1px solid",
                                                borderColor: "divider",
                                            }}
                                        />
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            Approved without a video URL yet.
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                )}
            </Stack>
        </Box>
    );
};

export default FinalVideoMode;
