import { Box, Button, Stack, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { approveSceneVideo, generateSceneVideo, type Storyboard } from "@/api/storyboard";
import { resolveAssetUrl } from "@/api/urls";
import { queryKeys } from "@/api/queryKeys";
import { useNgrokImageSrc } from "@/hooks/useNgrokImageSrc";
import { useProject } from "@/contexts/project/ProjectContext";

type Props = {
    storyboard: Storyboard;
};

const ScenesPanel = ({ storyboard }: Props) => {
    const storyboardUrl = resolveAssetUrl(storyboard.storyboard_image_url || undefined);
    const { src: storyboardImageSrc } = useNgrokImageSrc(storyboardUrl || undefined);
    const { projectId } = useProject();
    const queryClient = useQueryClient();
    const [generatingSceneIndex, setGeneratingSceneIndex] = useState<number | null>(null);
    const [approvingSceneIndex, setApprovingSceneIndex] = useState<number | null>(null);

    const normalizedScenes = useMemo(() => storyboard.scenes || [], [storyboard.scenes]);
    const nextScene = normalizedScenes.find((scene) => (scene.video_status ?? "not_started") !== "approved");
    const nextSceneIndex = nextScene?.scene_index ?? null;

    const generateMutation = useMutation({
        mutationFn: ({ sceneIndex, force }: { sceneIndex: number; force: boolean }) =>
            generateSceneVideo(projectId as string, sceneIndex, force),
        onMutate: ({ sceneIndex }) => {
            setGeneratingSceneIndex(sceneIndex);
        },
        onError: (error, variables) => {
            const message = error instanceof Error ? error.message : "";
            if (message.includes("already has a generated video") && !variables.force) {
                const confirmed = window.confirm(
                    `Scene ${variables.sceneIndex} already has a video. Re-generate it?`
                );
                if (confirmed) {
                    generateMutation.mutate({ sceneIndex: variables.sceneIndex, force: true });
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.storyboard(projectId as string) });
        },
        onSettled: () => {
            setGeneratingSceneIndex(null);
        },
    });

    const approveMutation = useMutation({
        mutationFn: (sceneIndex: number) => approveSceneVideo(projectId as string, sceneIndex),
        onMutate: (sceneIndex) => {
            setApprovingSceneIndex(sceneIndex);
        },
        onSuccess: async (data) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.storyboard(projectId as string) });
            if (data.next_scene_index) {
                await generateMutation.mutateAsync({ sceneIndex: data.next_scene_index, force: false });
            }
        },
        onSettled: () => {
            setApprovingSceneIndex(null);
        },
    });

    if (!storyboard.scenes || storyboard.scenes.length === 0 || !projectId) {
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
                    {normalizedScenes.map((scene) => {
                        const status = scene.video_status ?? (scene.generated_video_url ? "ready" : "not_started");
                        const isBusy =
                            generatingSceneIndex === scene.scene_index || approvingSceneIndex === scene.scene_index;

                        return (
                            <SceneCard
                                key={`${scene.scene_index}-${scene.title}`}
                                scene={scene}
                                status={status}
                                isCurrent={nextSceneIndex === scene.scene_index}
                                isBusy={isBusy}
                                isGenerating={generateMutation.isPending}
                                isApproving={approveMutation.isPending}
                                hasNext={normalizedScenes.some((next) => next.scene_index > scene.scene_index)}
                                onGenerate={(force) => generateMutation.mutate({ sceneIndex: scene.scene_index, force })}
                                onApprove={() => approveMutation.mutate(scene.scene_index)}
                            />
                        );
                    })}
                </Stack>
            </Stack>
        </Box>
    );
};

export default ScenesPanel;

type SceneCardProps = {
    scene: Storyboard["scenes"][number];
    status: "not_started" | "generating" | "ready" | "approved" | "failed" | null;
    isCurrent: boolean;
    isBusy: boolean;
    isGenerating: boolean;
    isApproving: boolean;
    hasNext: boolean;
    onGenerate: (force?: boolean) => void;
    onApprove: () => void;
};

const SceneCard = ({
    scene,
    status,
    isCurrent,
    isBusy,
    isGenerating,
    isApproving,
    hasNext,
    onGenerate,
    onApprove,
}: SceneCardProps) => {
    const videoUrl = resolveAssetUrl(scene.generated_video_url || undefined);
    const { src: videoSrc } = useNgrokImageSrc(videoUrl || undefined);

    return (
        <Box
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

                {videoUrl ? (
                    <Box
                        component="video"
                        src={videoSrc || videoUrl}
                        controls
                        playsInline
                        preload="metadata"
                        sx={{
                            width: "100%",
                            borderRadius: 2,
                            border: "1px solid var(--scene-border)",
                            bgcolor: "#1b1b1b",
                        }}
                    />
                ) : null}

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="center">
                    <Typography variant="caption" sx={{ color: "var(--scene-ink-soft)", fontWeight: 600 }}>
                        Video status: {(status || "not_started").replace("_", " ")}
                    </Typography>
                    {isCurrent ? (
                        <>
                            {status === "ready" ? (
                                <Button
                                    variant="contained"
                                    size="small"
                                    disabled={isBusy || isApproving}
                                    onClick={onApprove}
                                >
                                    {isApproving
                                        ? "Approving..."
                                        : hasNext
                                          ? "Approve & generate next"
                                          : "Approve scene"}
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    size="small"
                                    disabled={isBusy || isGenerating || status === "generating"}
                                    onClick={() => {
                                        if (scene.generated_video_url) {
                                            const confirmed = window.confirm(
                                                `Scene ${scene.scene_index} already has a video. Re-generate it?`
                                            );
                                            if (!confirmed) {
                                                return;
                                            }
                                            onGenerate(true);
                                            return;
                                        }
                                        onGenerate(false);
                                    }}
                                >
                                    {status === "generating" || isGenerating
                                        ? "Generating..."
                                        : `Generate scene ${scene.scene_index}`}
                                </Button>
                            )}
                        </>
                    ) : (
                        <Button variant="outlined" size="small" disabled>
                            Waiting for previous approval
                        </Button>
                    )}
                </Stack>
            </Stack>
        </Box>
    );
};
