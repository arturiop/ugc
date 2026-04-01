import { Box, Button, Card, CardActions, CardContent, Chip, Divider, Stack, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Storyboard, StoryboardScene } from "@/api/storyboard";
import { approveSceneVideo, generateSceneVideo } from "@/api/storyboard";
import { queryKeys } from "@/api/queryKeys";
import { useProject } from "@/contexts/Project/ProjectContext";

type SceneGenModeProps = {
    storyboard: Storyboard | null;
    selectedSceneIndex: number | null;
    onSelectScene: (sceneIndex: number) => void;
};

const statusConfig: Record<
    NonNullable<StoryboardScene["video_status"]> | "not_started",
    { label: string; color: "default" | "primary" | "success" | "warning" | "error" }
> = {
    not_started: { label: "Not started", color: "default" },
    generating: { label: "Generating", color: "warning" },
    ready: { label: "Ready", color: "success" },
    approved: { label: "Approved", color: "primary" },
    failed: { label: "Failed", color: "error" },
};

const SceneGenMode = ({ storyboard, selectedSceneIndex, onSelectScene }: SceneGenModeProps) => {
    const { projectId } = useProject();
    const queryClient = useQueryClient();

    const generateMutation = useMutation({
        mutationFn: async ({ sceneIndex, force }: { sceneIndex: number; force: boolean }) => {
            if (!projectId) {
                throw new Error("Project id missing");
            }
            return generateSceneVideo(projectId, sceneIndex, force);
        },
        onSuccess: () => {
            if (projectId) {
                void queryClient.invalidateQueries({ queryKey: queryKeys.projects.storyboard(projectId) });
            }
        },
    });

    const approveMutation = useMutation({
        mutationFn: async ({ sceneIndex }: { sceneIndex: number }) => {
            if (!projectId) {
                throw new Error("Project id missing");
            }
            return approveSceneVideo(projectId, sceneIndex);
        },
        onSuccess: () => {
            if (projectId) {
                void queryClient.invalidateQueries({ queryKey: queryKeys.projects.storyboard(projectId) });
            }
        },
    });

    if (!storyboard) {
        return (
            <Box sx={{ p: { xs: 2.5, md: 4 }, height: "100%", overflowY: "auto" }}>
                <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight={700}>
                            No scenes ready yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Generate a storyboard to start scene video generation.
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    const scenes = storyboard.scenes ?? [];
    const selectedScene = scenes.find((scene) => scene.scene_index === selectedSceneIndex) ?? scenes[0];

    const resolveStatus = (scene: StoryboardScene) => {
        const statusKey = scene.video_status || "not_started";
        const meta = statusConfig[statusKey] ?? statusConfig.not_started;
        return { statusKey, meta };
    };

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, height: "100%", overflow: "hidden" }}>
            <Box
                sx={{
                    display: "flex",
                    height: "100%",
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    overflow: "hidden",
                }}
            >
                <Box sx={{ flex: 1, minWidth: 0, p: { xs: 2, md: 3 }, display: "flex", flexDirection: "column" }}>
                    {selectedScene ? (
                        <>
                            <Stack spacing={1}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                                    <Typography variant="subtitle1" fontWeight={700}>
                                        Scene {selectedScene.scene_index}: {selectedScene.title}
                                    </Typography>
                                    <Chip
                                        size="small"
                                        label={resolveStatus(selectedScene).meta.label}
                                        color={resolveStatus(selectedScene).meta.color}
                                    />
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                    {selectedScene.objective}
                                </Typography>
                            </Stack>

                                <Box
                                    sx={{
                                        flex: 1,
                                        mt: 2,
                                        borderRadius: 3,
                                        border: "1px solid",
                                        borderColor: "divider",
                                        bgcolor: "background.neutral",
                                        display: "grid",
                                        placeItems: "center",
                                        minHeight: 240,
                                        overflow: "hidden",
                                    }}
                                >
                                {selectedScene.generated_video_url ? (
                                    <Box
                                        component="video"
                                        src={selectedScene.generated_video_url}
                                        controls
                                        sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                ) : (
                                    <Typography variant="caption" color="text.secondary">
                                        No video generated yet
                                    </Typography>
                                )}
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Stack direction="row" spacing={1.5}>
                                <Button
                                    variant="contained"
                                    onClick={() =>
                                        generateMutation.mutate({
                                            sceneIndex: selectedScene.scene_index,
                                            force: Boolean(selectedScene.generated_video_url),
                                        })
                                    }
                                    disabled={
                                        !projectId ||
                                        (generateMutation.isPending && generateMutation.variables?.sceneIndex === selectedScene.scene_index) ||
                                        resolveStatus(selectedScene).statusKey === "generating"
                                    }
                                >
                                    {selectedScene.generated_video_url ? "Regenerate" : "Generate"}
                                </Button>
                                <Button
                                    variant="outlined"
                                    disabled={
                                        !projectId ||
                                        resolveStatus(selectedScene).statusKey !== "ready" ||
                                        (approveMutation.isPending && approveMutation.variables?.sceneIndex === selectedScene.scene_index)
                                    }
                                    onClick={() => approveMutation.mutate({ sceneIndex: selectedScene.scene_index })}
                                >
                                    Approve
                                </Button>
                            </Stack>
                        </>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            Select a scene to preview.
                        </Typography>
                    )}
                </Box>

                <Box
                    sx={{
                        width: { xs: 240, md: 300 },
                        borderLeft: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.neutral",
                        overflowY: "auto",
                    }}
                >
                    <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                            Scene Queue
                        </Typography>
                    </Box>
                    <Stack spacing={1} sx={{ p: 1.5 }}>
                        {scenes.map((scene) => {
                            const { meta } = resolveStatus(scene);
                            const isSelected = scene.scene_index === selectedSceneIndex;
                            return (
                                <Card
                                    key={scene.scene_index}
                                    elevation={0}
                                    sx={{
                                        borderRadius: 2.5,
                                        border: "1px solid",
                                        borderColor: isSelected ? "secondary.main" : "divider",
                                        bgcolor: isSelected ? "secondary.lighter" : "background.paper",
                                    }}
                                >
                                    <CardActions sx={{ px: 1.5, py: 1 }}>
                                        <Button
                                            fullWidth
                                            onClick={() => onSelectScene(scene.scene_index)}
                                            sx={{ justifyContent: "space-between", textTransform: "none" }}
                                        >
                                            <Stack spacing={0.5} alignItems="flex-start">
                                                <Typography variant="caption" fontWeight={700} color="text.secondary">
                                                    Scene {scene.scene_index}
                                                </Typography>
                                                <Typography variant="body2" fontWeight={600} noWrap>
                                                    {scene.title}
                                                </Typography>
                                                <Chip size="small" label={meta.label} color={meta.color} />
                                            </Stack>
                                            <Box
                                                sx={{
                                                    width: 54,
                                                    height: 36,
                                                    borderRadius: 1.5,
                                                    border: "1px solid",
                                                    borderColor: "divider",
                                                    bgcolor: "background.default",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                {scene.generated_video_url ? (
                                                    <Box
                                                        component="video"
                                                        src={scene.generated_video_url}
                                                        muted
                                                        sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                    />
                                                ) : (
                                                    <Box sx={{ width: "100%", height: "100%", display: "grid", placeItems: "center" }}>
                                                        <Typography variant="caption" color="text.disabled">
                                                            {String(scene.scene_index).padStart(2, "0")}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Button>
                                    </CardActions>
                                </Card>
                            );
                        })}
                    </Stack>
                </Box>
            </Box>
        </Box>
    );
};

export default SceneGenMode;
